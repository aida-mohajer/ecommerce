import { IsArray, IsNumber, IsString, IsUUID } from "class-validator";
import { ProductAttributeDto } from "./product-attr.dto";
import { Type } from "class-transformer";

export class CreateProductResponseDto {
    @IsUUID()
    id: string;

    @IsString()
    title: string;

    @IsString()
    description?: string;

    @IsArray()
    image_urls: string[];

    @IsNumber()
    price: number;

    @Type(() => ProductAttributeDto)
    attributes: ProductAttributeDto[];
}