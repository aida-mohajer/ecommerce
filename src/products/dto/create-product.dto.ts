import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {  Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

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
}