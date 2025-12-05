import { Type } from "class-transformer";
import {  IsInt, IsString, IsUUID, Min } from "class-validator";

export class ProductAttributesResponseDto {

    @IsUUID()
    product_attribute_id?: string;

    @IsString()
    color?: string;

    @IsString()
    size?: string;

    @IsInt()
    @Type(() => Number)
    @Min(0)
    quantity?: number;
}