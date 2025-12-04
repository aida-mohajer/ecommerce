import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { plainToInstance, Transform, Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from "class-validator";
import { ProductAttributeDto } from "./product-attr.dto";

export class CreateProductDto {
    @ApiProperty({ example: 'Nike Shoes' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(200, { message: 'Title must be at max 200 characters' })
    title: string;

    @ApiPropertyOptional({ example: 'Comfortable running shoes' })
    @IsOptional()
    @IsString()
    @MaxLength(700, { message: 'Description must be at max 700 characters' })
    description?: string;

    @ApiProperty({ example: 299 })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    @Max(999999.99)
    price: number;

    @ApiProperty({
        type: String,
        description: 'JSON array of attributes',
        example: JSON.stringify([
            { color: 'red', size: 'M', quantity: 10 },
            { color: 'blue', size: 'M', quantity: 10 }
        ], null, 2),
    })
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({each:true})
    @Type(() => ProductAttributeDto)
    @Transform(({ value }) => {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        return Array.isArray(parsed)
            ? parsed.map(item => plainToInstance(ProductAttributeDto, item))
            : [];
    })
    attributes: ProductAttributeDto[];
}