import { IsInt, IsString, IsUUID } from "class-validator";

export class AddToCartResponseDto {
    @IsUUID()
    product_id: string;

    @IsUUID()
    user_id?: string;

    @IsUUID()
    cart_token?: string;

    @IsInt()
    quantity: number;

    @IsString()
    size?: string;

    @IsString()
    color?: string;
}
