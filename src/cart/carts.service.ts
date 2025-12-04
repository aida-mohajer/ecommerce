import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { AddToCartResponseDto } from "./dto/add-to-cart-res.dto";
import { v4 as uuidv4 } from 'uuid';
import { IsUUID } from "class-validator";
import { GetCartItemsDto } from "./dto/get-cart-items.dto";


@Injectable()
export class CartService {
    constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient) { }

    async addToCart(user_id: string | null, product_id:string, addToCartDto: AddToCartDto):Promise<AddToCartResponseDto> {
        const { quantity, color, size } = addToCartDto;

        let finalUserId = user_id ?? null;
        if (!user_id && !finalUserId) {
            finalUserId = uuidv4();
        }

        // if(user_id && !IsUUID(user_id)) {
        //     throw new BadRequestException('user_id must be a valid UUID');
        // }

        const { data: product, error: productErr } = await this.supabase
            .from('products')
            .select('id')
            .eq('id', product_id)
            .single();

        if (productErr) throw new BadRequestException('Product not found');

        const { data: attr, error: attrErr } = await this.supabase
            .from('product_attributes')
            .select('id, quantity')
            .eq('product_id', product_id)
            .eq('color', color)
            .eq('size', size)
            .single();

        if (attrErr) {
            throw new BadRequestException('This attribute does not exist');
        }

        if (!attr) {
            throw new BadRequestException('Product with selected size/color not available');
        }

        if (quantity > attr.quantity) {
            throw new BadRequestException(`Not enough stock. Available: ${attr.quantity}`);
        }
        

        const { data: new_Item, error:insertErr } = await this.supabase
            .from('cart_items')
            .insert({
                user_id: finalUserId,
                product_id: product_id,
                quantity,
                color,
                size,
            })
            .select('id,user_id, product_id, size, color, quantity')
            .single();

        if (insertErr) throw new InternalServerErrorException(insertErr.message);
        
        return new_Item;
    }

    async getCart(user_id: string): Promise<{ items: GetCartItemsDto[]; totalQuantity: number }> {
        const { data, error } = await this.supabase
            .from('cart_items')
            .select(`id,quantity,size,color,products (id,title, price, image_urls)`)
            .eq('user_id', user_id)

        if (error) throw new NotFoundException('Cart not found');

        const items: GetCartItemsDto[] = data.map(item => ({
            ...item,
            products: item.products ?? []
        }));

        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

        return { items, totalQuantity };


    }

    async deleteCartItem(cart_item_id: string):Promise<{message:string}> {
        const { data , error} = await this.supabase
            .from('cart_items')
            .delete()
            .eq('id',cart_item_id)
            .select()

        if (error) throw new NotFoundException('Cart item not found');

        return { message: 'Cart item deleted successfully'}
    }
}
