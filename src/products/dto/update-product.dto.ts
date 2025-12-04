import { ApiPropertyOptional } from "@nestjs/swagger";
import { plainToInstance, Transform, Type } from "class-transformer";
import { IsArray, IsInt, IsNumber, IsOptional, IsString, IsUrl, Matches, Max, MaxLength, Min, ValidateNested } from "class-validator";
import { ProductAttributeDto } from "./product-attr.dto";

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

    @ApiPropertyOptional({
        type: String,
        description: 'JSON array of attributes',
        example: JSON.stringify([
            { color: 'red', size: 'M', quantity: 10 },
            { color: 'blue', size: 'M', quantity: 10 }
        ], null, 2),
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductAttributeDto)
    @Transform(({ value }) => {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        return Array.isArray(parsed)
            ? parsed.map(item => plainToInstance(ProductAttributeDto, item))
            : [];
    })
    attributes: ProductAttributeDto[];

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