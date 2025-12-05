import { Body, Controller, Delete, Param, Post, Get, ParseUUIDPipe, Req, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-res.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseAuthGuard } from 'src/auth/guards/auth.guard';
import { Request } from "express";

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }
    
    @ApiBearerAuth()
    @Post('/create/:product_id')
    @UseGuards(SupabaseAuthGuard)
    @ApiOperation({ summary: 'create comment' })
    async createComment(@Req() req, @Param('product_id', new ParseUUIDPipe()) product_id:string, @Body() createCommentDto: CreateCommentDto): Promise<CommentResponseDto> {
        const user_id = req.user.id
        return this.commentsService.createComment(user_id,product_id, createCommentDto);
    }

    @Get('/:product_id')
    @ApiOperation({ summary: 'retrieve comments' })
    async getComments(@Param('product_id') product_id: string): Promise<CommentResponseDto[]> {
        return this.commentsService.getComments(product_id);
    }

    @ApiBearerAuth()
    @UseGuards(SupabaseAuthGuard)
    @Delete('/delete/:comment_id')
    @ApiOperation({ summary: 'delete comment' })
    async deleteComment(@Req() req:Request,@Param('comment_id', new ParseUUIDPipe()) comment_id: string): Promise<{ message: string }> {
        const user_id = req.user.id;                
        return this.commentsService.deleteComment(comment_id,user_id);
    }

}
