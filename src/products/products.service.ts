import { Injectable, Inject, InternalServerErrorException, NotFoundException, BadRequestException, HttpException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductResponseDto } from './dto/create-product-res.dto';
import { handleUpdateProductImages, uploadProductImages } from 'src/helper/general-functions';
import { GetProductsDto } from './dto/get-products-dto';
import { PaginationDto } from 'src/helper/dto/pagination-dto';
import { getPaginationRange } from 'src/helper/pagination';
import { GetProductDto } from './dto/get-product.dto';
import { UpdateProductResponseDto } from './dto/update-product-res.dto';
import { UpdateProductWithFilesDto } from './dto/update-product-with-file.dto';


@Injectable()
export class ProductService {
    constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient) { }

    async createProduct(createProductDto: CreateProductDto, images: Express.Multer.File[]):Promise<CreateProductResponseDto> {
        const {title,description,price} = createProductDto

        let productId;

        try{
        const image_urls = await uploadProductImages(images,this.supabase);

        const {data: product, error: productErr} = await this.supabase
            .from('products')
            .insert({
                title: title,
                description: description,
                price: price,
                image_urls,
            })
            .select('id, title, description, image_urls, price')
            .single();

        if (productErr) {
            throw new InternalServerErrorException(`Failed to insert product: ${productErr.message}`,);
        }

         productId = product.id;

        return product
    }catch(error){
            if (productId) {
                await this.supabase.from('products').delete().eq('id', productId);
            }
            else if(error instanceof HttpException)throw error
            throw new InternalServerErrorException(`Unexpected error during product creation: ${error.message}`)
    }}

    async getAllProducts(products:PaginationDto):Promise<GetProductsDto[]>{
        try{
        const { from, to } = getPaginationRange(products.page, products.limit);

        const { data, error } = await this.supabase
            .from('products')
            .select('id, title, price, description, image_urls')
            .range(from,to)
            .order('created_at', { ascending: false });

            if (error)  throw new InternalServerErrorException(`Failed to fetch products: ${error.message}`);
            if (!data)  throw new NotFoundException('No products found');
            
        return data;
    }catch(error){
            if (error instanceof NotFoundException) throw error;
            else if (error instanceof HttpException) throw error
            throw new InternalServerErrorException(`Unexpected error while fetching products: ${error.message}`);
    }
}

    async getProductById(product_id: string):Promise<GetProductDto> {
        try{
        const { data:product, error:productErr } = await this.supabase
            .from('products')
            .select('id, title, price, description, rating, image_urls')
            .eq('id', product_id)
            .single();

            if (productErr) {
                if (productErr.code === 'PGRST116') throw new NotFoundException(`Product with id ${product_id} not found`);
                throw new InternalServerErrorException(`Failed to fetch product: ${productErr.message}`);
            }

        const { data: attrs, error: attrErr } = await this.supabase
            .from('product_attributes')
            .select('id,color, size, quantity')
            .eq('product_id', product_id);

            if (attrErr) throw new InternalServerErrorException(`Failed to fetch product attributes: ${attrErr.message}`);

        return {
            ...product,
            attributes: attrs ?? []
        };

    }catch(error){
            if (error instanceof NotFoundException) throw error;
            else if (error instanceof HttpException) throw error
            throw new InternalServerErrorException(`Unexpected error while fetching product`);
    }
}

    async updateProduct(product_id: string, updateProductDto: UpdateProductWithFilesDto, images?: Express.Multer.File[]): Promise<UpdateProductResponseDto> {
        const { remove_image_urls, image_files, ...productFields } = updateProductDto;

        try{
        const { data: existingProduct, error: findErr } = await this.supabase
            .from('products')
            .select('id, title, price, description, image_urls')
            .eq('id', product_id)
            .single();

            if (findErr) {
                if (findErr.code === 'PGRST116') throw new NotFoundException(`Product with ID ${product_id} not found`);
                throw new InternalServerErrorException(`Failed to fetch product: ${findErr.message}`);
            }

            const updatedImages = await handleUpdateProductImages(
                existingProduct.image_urls,
                remove_image_urls,
                images,
                this.supabase
            );

            const {data:updatedProduct, error: updateErr } = await this.supabase
                .from('products')
                .update({
                    ...productFields,
                    image_urls: updatedImages,
                })
                .eq('id', product_id)
                .select(`id,title,price,description,image_urls`)
                .single()

            if (updateErr) {
                throw new InternalServerErrorException(`Failed to update product: ${updateErr.message}`);
            }

        return updatedProduct;
    }catch(error){
            if (error instanceof NotFoundException) throw error
            else if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException(`Unexpected error updating product: ${error.message}`);
    }
}

    async deleteProduct(product_id: string): Promise<{ message: string }> {
        try{
            const { data, error } = await this.supabase.from('products').delete().eq('id', product_id).select('id');

        if (error) throw new BadRequestException(error.message);
            if (!data || data.length === 0) throw new NotFoundException(`Product with id ${product_id} not found`);
            
        return { message: 'Product deleted successfully' };
    }catch(error){
            if (error instanceof BadRequestException) throw error;
            else if (error instanceof NotFoundException) throw error;
            else if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException(`Unexpected error removing product: ${error.message}`);
        
    }
}
}