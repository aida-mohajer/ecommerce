import { IsInt, IsString, IsUUID } from "class-validator";

export class CommentResponseDto {
    @IsUUID()
    id: string;

    @IsString()
    content: string;

    @IsInt()
    rate: number;

    created_at: string;
}
