import { IsArray, IsNumber, IsString, IsUUID } from "class-validator";
import { Type } from "class-transformer";
import { UpdateProductAttributesDto } from "src/product-attributes/dto/update-product-attribute.dto";

export class GetProductDto{
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

    @Type(() => UpdateProductAttributesDto)
    attributes: UpdateProductAttributesDto[];
}