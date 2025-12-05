import { InternalServerErrorException } from "@nestjs/common";

export async function uploadProductImages(images: Express.Multer.File[],supabase): Promise<string[]> {
    const urls = [];

    for (const img of images) {
        const fileName = `${Date.now()}_${img.originalname}`;

        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, img.buffer, {
                contentType: img.mimetype,
            });

        if (uploadError) throw new InternalServerErrorException(uploadError.message);

        const { data } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

        urls.push(data.publicUrl);
    }

    return urls;
}

export async function handleUpdateProductImages( existingImages: string[],remove_image_urls: string[] | undefined,uploadedFiles: Express.Multer.File[] | undefined,supabase): Promise < string[] > {

    let imageUrls = existingImages || [];
    const bucket = 'product-images';

    //Remove old images (bucket + local list)
    if(remove_image_urls?.length) {
        const validRemovals = remove_image_urls.filter(url =>
            imageUrls.includes(url),
        );

        const filenames = validRemovals.map(url => url.split('/').pop());

        const { error: removeErr } = await supabase.storage
            .from(bucket)
            .remove(filenames);

        if (removeErr) {
            throw new InternalServerErrorException(
                `Failed to remove images: ${removeErr.message}`,
            );
        }

        imageUrls = imageUrls.filter(url => !validRemovals.includes(url));
    }

    // Upload new images
    if(uploadedFiles?.length) {
        const uploaded = await uploadProductImages(uploadedFiles, supabase);
        imageUrls.push(...uploaded);
    }

    return imageUrls;
}

