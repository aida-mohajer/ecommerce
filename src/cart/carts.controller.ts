import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CartService } from "./carts.service";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateCartDto } from "./dto/update-cart.dto";
import { AddToCartResponseDto } from "./dto/add-to-cart-res.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { GetCartItemsDto } from "./dto/get-cart-items.dto";

@Controller('cart')
@ApiTags('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Post('add/:product_id')
    @ApiOperation({ summary: 'add item to cart' })
    @ApiQuery({ name: 'user_id', required: false, description: 'user_id(guest_id - enter if user have already cart items)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ description: 'add item to cart', type: AddToCartDto })
    @UseInterceptors(FilesInterceptor('files', 0))
    async addToCart(@Param('product_id', new ParseUUIDPipe()) product_id: string, @Body() addToCartDto: AddToCartDto, @Query('user_id') user_id?: string | null): Promise<AddToCartResponseDto> {
        return this.cartService.addToCart(user_id ?? undefined, product_id, addToCartDto);
    }

    @Get('/:user_id')
    @ApiOperation({ summary: 'retrieve cart items' })
    async getCart(@Param('user_id', new ParseUUIDPipe()) user_id: string): Promise<{ items: GetCartItemsDto[]; totalQuantity: number }> {
        return this.cartService.getCart(user_id);
    }

    @Delete('delete/:cart_item_id')
    @ApiOperation({ summary: 'delete cart item' })
    async deleteCartItem(@Param('cart_item_id', new ParseUUIDPipe()) cart_item_id: string):Promise<{message:string}> {
        return this.cartService.deleteCartItem(cart_item_id);
    }
}
