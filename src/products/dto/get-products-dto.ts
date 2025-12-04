import { IsArray, IsNumber, IsString, IsUUID } from "class-validator";

export class GetProductsDto {
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

}
