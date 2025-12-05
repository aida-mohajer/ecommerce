import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Req, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CartService } from "./carts.service";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { AddToCartResponseDto } from "./dto/add-to-cart-res.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { GetCartItemsDto } from "./dto/get-cart-items.dto";
import { Request } from "express";

@Controller('cart_item')
@ApiTags('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Post('add/:product_id')
    @ApiOperation({ summary: 'add item to cart' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ description: 'add item to cart', type: AddToCartDto })
    @UseInterceptors(FilesInterceptor('files', 0))
    async addToCart(
        @Param('product_id', new ParseUUIDPipe()) product_id: string,
        @Body() addToCartDto: AddToCartDto,
        @Req() req: Request,
     ): Promise<AddToCartResponseDto> {
        //get user id (if logged in)
        const userId = req.user?.id ?? null;
        // get cart token from browser cookie
        let cartToken = req.cookies['cart_token'] ?? null;

        const item =await this.cartService.addToCart(userId,cartToken, product_id,addToCartDto);

        // If guest & no cookie : set cookie
        if (!userId && !cartToken) {
            req.res.cookie('cart_token', item.cart_token, {
                httpOnly: true,
                secure: false, // secure:true ONLY in https
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });
        }
        return item
    }

    @Get()
    @ApiOperation({ summary: 'retrieve cart items' })
    async getCart(@Req() req: Request): Promise<{ items: GetCartItemsDto[]; totalQuantity: number }> {
        const userId = req.user?.id ?? null; // logged in user id
        const cartToken = req.cookies?.cart_token ?? null
        return this.cartService.getCart(userId,cartToken);
    }

    @Delete('delete/:cart_item_id')
    @ApiOperation({ summary: 'delete cart item' })
    async deleteCartItem(@Req() req: Request ,@Param('cart_item_id', new ParseUUIDPipe()) cart_item_id: string):Promise<{message:string}> {
        const userId = req.user?.id ?? null; // logged in user id
        const cartToken = req.cookies?.cart_token ?? null
        return this.cartService.deleteCartItem(cart_item_id,userId,cartToken);
    }
}
