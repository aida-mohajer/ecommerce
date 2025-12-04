import { Injectable, Inject, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductResponseDto } from './dto/create-product-res.dto';
import { uploadProductImages } from 'src/helper/general-functions';
import { GetProductsDto } from './dto/get-products-dto';
import { PaginationDto } from 'src/helper/dto/pagination-dto';
import { getPaginationRange } from 'src/helper/pagination';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductWithFilesDto } from 'src/helper/dto/update-product-with-file.dto';
import { CreateProductDtoWithFile } from 'src/helper/dto/create-product-with-file';
import { Color } from 'src/enums/attributes.enum';
import { GetProductDto } from './dto/get-product.dto';


@Injectable()
export class ProductService {
    constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient) { }

    async createProduct(createProductDto: CreateProductDto, images: Express.Multer.File[]):Promise<CreateProductResponseDto> {
        const {title,description,price,attributes} = createProductDto

        const image_urls = await uploadProductImages(images,this.supabase);

        const {data: product, error: productErr} = await this.supabase
            .from('products')
            .insert({
                title: title,
                description: description,
                price: price,
                image_urls
            })
            .select('id, title, description, image_urls, price')
            .single();

        if (productErr) {
            throw new Error(productErr.message);
        }

        const productId = product.id;

        const attributesData = attributes.map(attr => ({
            product_id: productId,
            color: attr.color || null,
            size: attr.size || null,
            quantity: attr.quantity,
        }));


        const { data: attrs, error: attrErr } = await this.supabase
            .from('product_attributes')
            .insert(attributesData)
            .select('color, size, quantity');

        if (attrErr) throw attrErr;

        return {
            ...product,
            attributes: attrs,
        };
    }

    async getAllProducts(products:PaginationDto):Promise<GetProductsDto[]>{
        const { from, to } = getPaginationRange(products.page, products.limit);

        const { data, error } = await this.supabase
            .from('products')
            .select('id, title, price, description, image_urls')
            .range(from,to)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }
        return data;
    }

    async getProductById(id: string):Promise<GetProductDto> {
        const { data:product, error:productErr } = await this.supabase
            .from('products')
            .select('id, title, price, description, rating, image_urls')
            .eq('id', id)
            .single();

        if (productErr) {
            throw new Error(productErr.message);
        }

        const { data: attrs, error: attrErr } = await this.supabase
            .from('product_attributes')
            .select('color, size, quantity')
            .eq('product_id', id);

        if (attrErr) throw new Error(attrErr.message);

        return {
            ...product,
            attributes: attrs
        };
    }

    async updateProduct(id: string, updateProductDto: UpdateProductWithFilesDto, images?: Express.Multer.File[]): Promise<GetProductDto> {
        const { remove_image_urls, image_files, attributes, ...productFields } = updateProductDto;

        const { data: existingProduct, error: findErr } = await this.supabase
            .from('products')
            .select('id, title, price, description, image_urls')
            .eq('id', id)
            .single();

        if (findErr) throw new NotFoundException('Product not found');

        let imageUrls: string[] = existingProduct.image_urls || [];
        const bucket = 'product-images';

        if (updateProductDto.remove_image_urls?.length) {
            const validRemovals = updateProductDto.remove_image_urls.filter(url =>
                imageUrls.includes(url),
            );
            // Delete from Supabase bucket
            const filenames = validRemovals.map(url => url.split('/').pop());
            await this.supabase.storage.from(bucket).remove(filenames);

            // Remove from DB list
            imageUrls = imageUrls.filter(url => !validRemovals.includes(url));
        }

        // Upload new images
        if (images?.length) {
            const uploaded = await uploadProductImages(images, this.supabase);
            imageUrls.push(...uploaded);
        }     

        const { error:updateErr } = await this.supabase
            .from('products')
            .update({ ...productFields, image_urls: imageUrls })
            .eq('id', id)
            .select('id, title, price, description, image_urls')
            .single();

        if (updateErr) throw new InternalServerErrorException(updateErr.message);

        if (attributes) {
            const { data: existingAttrs, error: attrsError } = await this.supabase
                .from('product_attributes')
                .select('id, color, size, quantity')
                .eq('product_id', id);

            if (attrsError) {
                throw new InternalServerErrorException(`Failed to fetch existing attributes: ${attrsError.message}`);
            }
            
            // Remove attributes that user removed
            const attrsToDelete = existingAttrs.filter(existing =>
                !attributes.some(incoming =>
                    incoming.color === existing.color &&
                    incoming.size === existing.size
                )
            );

            if (attrsToDelete.length) {
                await this.supabase
                    .from('product_attributes')
                    .delete()
                    .in('id', attrsToDelete.map(a => a.id));
            }
        
        // Upsert new/updated attributes
            for (const incoming of attributes) {
                const found = existingAttrs.find(e =>
                    e.color === incoming.color &&
                    e.size === incoming.size
                );

                if (found) {
                    // Update
                    await this.supabase
                        .from('product_attributes')
                        .update({ quantity: incoming.quantity })
                        .eq('id', found.id);
                } else {
                    // Insert
                    await this.supabase.from('product_attributes').insert({
                        ...incoming,
                        product_id: id,
                    });
                }
            }
    }
        

        const { data: product, error: finalErr } = await this.supabase
            .from('products')
            .select(`id,title,price,description,image_urls, attributes:product_attributes(id,size,color,quantity)`)
            .eq('id', id)
            .single();

        if (finalErr) throw new InternalServerErrorException(finalErr.message);

        return product;
    }

    async deleteProduct(id: string): Promise<{ message: string }> {
        const { error } = await this.supabase.from('products').delete().eq('id', id);

        if (error) throw new BadRequestException(error.message);

        return { message: 'Product deleted successfully' };
    }
}