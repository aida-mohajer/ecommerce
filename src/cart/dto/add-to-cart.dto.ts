import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsIn, isInt, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Color, Size } from "src/enums/attributes.enum";

export class AddToCartDto {
    @ApiProperty({ example: 4 })
    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value, 10))
     @IsInt()
    @Min(1)
    quantity: number;

    @ApiPropertyOptional({ example: 'red', enum: Color })
    @IsString()
    @IsOptional()
    @IsIn(Object.values(Color), {
        message: (args) => `color must be one of the allowed values: ${Object.values(Color).join(', ')}`
    })
    color?: string;

    @ApiPropertyOptional({ example: 'M', enum: Size })
    @IsString()
    @IsOptional()
    @IsIn(Object.values(Size), {
        message: (args) => `size must be one of the allowed values: ${Object.values(Size).join(', ')}`
    })
    size?: string;

}
