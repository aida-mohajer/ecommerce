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
