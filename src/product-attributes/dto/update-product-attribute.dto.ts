import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Color, Size } from "src/enums/attributes.enum";

export class UpdateProductAttributesDto {

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

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(0)
    quantity?: number;
}