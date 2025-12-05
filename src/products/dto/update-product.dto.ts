import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from "class-validator";

export class UpdateProductDto {
    @ApiPropertyOptional({ example: 'Nike Shoes' })
    @IsOptional()
    @IsString()
    @MaxLength(200, { message: 'Title must be at max 200 characters' })
    title?: string;

    @ApiPropertyOptional({ example: 'Comfortable running shoes' })
    @IsOptional()
    @IsString()
    @MaxLength(700, { message: 'Description must be at max 700 characters' })
    description?: string;

    @ApiPropertyOptional({ example: 299 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    @Max(999999.99)
    price?: number;

    @ApiPropertyOptional({ type: [String], required: false })
    @IsOptional()
    @IsArray()
    @Transform(({ value }) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        return value.split(',').map((v: string) => v.trim());
    })
    @IsUrl({}, { each: true, message: 'Each URL for remove image field must be a valid URL' })
    remove_image_urls?: string[];
}