import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";
import { Color, Size } from "src/enums/attributes.enum";

export class AddProductAttributesDto {

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

    @ApiProperty({ example: 10 })
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    quantity: number;
}