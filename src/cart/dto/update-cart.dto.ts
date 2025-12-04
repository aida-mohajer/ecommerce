import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class UpdateCartDto {
    @ApiPropertyOptional({ example: 4 })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(1000)
    quantity: number;
}