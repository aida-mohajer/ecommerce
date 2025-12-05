import { HttpException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { AddProductAttributesDto } from "./dto/add-product-attributes.dto";
import { ProductAttributesResponseDto } from "./dto/product-attributes-res.dto";
import { UpdateProductAttributesDto } from "./dto/update-product-attribute.dto";

@Injectable()
export class ProductAttributesService {
    constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient) { }

    async addProductAttributes(product_id:string, addProductAttributeDto: AddProductAttributesDto ): Promise<ProductAttributesResponseDto> {
         const {color,size,quantity} = addProductAttributeDto

         try{
        const { data: productAttrs, error: productAttrErr } = await this.supabase
            .from('product_attributes')
            .insert({
                color: color,
                size: size,
                quantity: quantity,
                product_id,
            })
            .select('id, color, size, quantity')
            .single();


        if(!productAttrs)throw new NotFoundException('product attributes not found')
        if (productAttrErr) throw new InternalServerErrorException(`Failed to insert product attributes: ${productAttrErr.message}`)

         return  productAttrs
    }catch(error){
             if (error instanceof NotFoundException) throw error;
             else if (error instanceof HttpException) throw error;
             throw new InternalServerErrorException(`Unexpected error adding product attribute: ${error.message}`)
    }
}


    async getProductAttributes(product_id:string): Promise<ProductAttributesResponseDto[]> {

        try{
        const { data: productAttrs, error: productAttrErr } = await this.supabase
            .from('product_attributes')
            .select('id, color, size, quantity')
            .eq('product_id', product_id)


        if (productAttrErr) {
            throw new InternalServerErrorException(`Failed to retrieve product attribute: ${productAttrErr.message}`);
        }

        if (!productAttrs) return []
         return  productAttrs
    }catch(error){
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException(`Unexpected error retrieve product attributes: ${error.message}`)
    }
}

    async updateProductAttributes(product_attribute_id:string, updateProductAttributeDto: UpdateProductAttributesDto ): Promise<ProductAttributesResponseDto> {
         const {color,size,quantity} = updateProductAttributeDto

         try{
        const { data: productAttr, error: productAttrErr } = await this.supabase
            .from('product_attributes')
            .update({color,size,quantity})
            .eq('id', product_attribute_id)
            .select('id, color, size, quantity')
            .maybeSingle();


        if (productAttrErr) {
            throw new InternalServerErrorException(`Failed to update product attribute: ${productAttrErr.message}`);
        }

        if (!productAttr) {
            throw new NotFoundException('Product attribute not found');
        }
         return  productAttr
    }catch(error){
             if (error instanceof NotFoundException) throw error;
             else if (error instanceof HttpException) throw error;
             throw new InternalServerErrorException(`Unexpected error update product attribute: ${error.message}`)
    }
}

    async deleteProductAttribute(product_attribute_id:string): Promise<{message:string}> {

        try{
        const { data: productAttr, error: productAttrErr } = await this.supabase
            .from('product_attributes')
            .delete()
            .eq('id', product_attribute_id)
            .select('id')

        if (productAttrErr) {
            throw new InternalServerErrorException(`Failed to remove product attribute: ${productAttrErr.message}`);
        }

        if (!productAttr) {
            throw new NotFoundException('Product attribute not found');
        }
        return { message: 'Product attribute deleted successfully'}
    }catch(error){
            if (error instanceof NotFoundException) throw error;
            else if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException(`Unexpected error remove product attribute: ${error.message}`)
    }
}
}