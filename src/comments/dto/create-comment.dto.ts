import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";

export class CreateCommentDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    content: string;

    @ApiProperty({ example: 4 })
    @IsInt()
    @Min(1)
    @Max(5)
    rate: number;
}
