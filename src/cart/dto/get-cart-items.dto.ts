import { IsInt, IsString, IsUUID } from "class-validator";
import { Type } from "class-transformer";
import { GetProductsDto } from "src/products/dto/get-products-dto";

export class GetCartItemsDto {

    @IsUUID()
    id: string;

    // @IsUUID()
    // user_id: string;

    @IsInt()
    quantity: number;

    @IsString()
    size?: string;

    @IsString()
    color?: string;

    @Type(() => GetProductsDto)
    products: GetProductsDto[]

}