import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { AddToCartResponseDto } from "./dto/add-to-cart-res.dto";
import { v4 as uuidv4 } from 'uuid';
import { GetCartItemsDto } from "./dto/get-cart-items.dto";


@Injectable()
export class CartService {
    constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient) { }

    async addToCart(user_id: string | null, cart_token: string | null,product_id:string, addToCartDto: AddToCartDto):Promise<AddToCartResponseDto> {
        const { quantity, color, size } = addToCartDto;

        try{
            let finalUserId: string | null = null;
            let finalCartToken: string | null = null;
            
            if (user_id) {
                // Logged in
                finalUserId = user_id;
                finalCartToken = null;
            } else {
                // Guest user
                finalUserId = null;
                finalCartToken = cart_token ?? uuidv4();
            }

        const { data: product, error: productErr } = await this.supabase
            .from('products')
            .select('id')
            .eq('id', product_id)
            .single();

        if (productErr) throw new NotFoundException('Product not found');

           let attrQuery = this.supabase
            .from('product_attributes')
            .select('id, quantity')
            .eq('product_id', product_id)
          

            if (color) attrQuery = attrQuery.eq('color', color);
            if (size) attrQuery = attrQuery.eq('size', size);

            const { data: attr, error: attrErr } = await attrQuery.maybeSingle();

            if (attrErr) {
                throw new NotFoundException(`Attribute ${color}/${size} not found for this product`);
            }

            if (!attr) {
                throw new NotFoundException(`Product with selected color/size not available`);
            }

        if (quantity > attr.quantity) {
            throw new BadRequestException(`Not enough quantity. Available: ${attr.quantity}`);
        }
        

        const { data: new_Item, error:insertErr } = await this.supabase
            .from('cart_items')
            .insert({
                user_id: finalUserId,
                cart_token: finalCartToken,
                product_id,
                quantity,
                color,
                size,
            })
            .select('id,user_id,cart_token,product_id, size, color, quantity')
            .single();

            if (insertErr) throw new InternalServerErrorException(`Failed to add to cart: ${insertErr.message}`);
        
        return new_Item;
    }catch(error){
            if (error instanceof BadRequestException ||error instanceof NotFoundException)throw error;
            throw new InternalServerErrorException(`Unexpected error adding to cart: ${error.message}`);
    }
}

    async getCart(user_id: string,cartToken:string): Promise<{ items: GetCartItemsDto[]; totalQuantity: number }> {
        try{
        let query = this.supabase
            .from('cart_items')
            .select(`id,quantity,size,color,products (id,title, price, image_urls)`)

            if (user_id) {
                query = query.eq('user_id', user_id);
            } else {
                query = query.eq('cart_token', cartToken);
            }
            const { data, error } = await query;

            if (error) {
                throw new InternalServerErrorException(`Failed to fetch cart: ${error.message}`);
            }

        const items: GetCartItemsDto[] = data.map(item => ({
            ...item,
            products: item.products ?? []
        }));

        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

        return { items, totalQuantity };

    }catch(error){
            throw new InternalServerErrorException(`Unexpected error while fetching cart: ${error.message}`);
    }
    }

    async deleteCartItem(cart_item_id: string, user_id: string | null,cart_token: string | null):Promise<{message:string}> {
        try{
       let query =  this.supabase
            .from('cart_items')
            .delete()
            .eq('id',cart_item_id)

            if (user_id) {
                query = query.eq('user_id', user_id);
            } else if (cart_token) {
                query = query.eq('cart_token', cart_token);
            } else {
                throw new BadRequestException('No user or cart token provided');
            }

            const { data, error } = await query.select('id');

            if (error) {
                throw new InternalServerErrorException(`Failed to delete cart item: ${error.message}`);
            }

            if (!data || data.length === 0) {
                throw new NotFoundException(`Cart item with id ${cart_item_id} not found`);
            }

        return { message: 'Cart item deleted successfully'}
    }catch(error){
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException(`Unexpected error deleting cart item: ${error.message}`);
    }
}
}
