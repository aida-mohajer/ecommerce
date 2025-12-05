import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-res.dto';

@Injectable()
export class CommentsService {
    constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient) { }

    async createComment(user_id: string, product_id:string, createCommentDto: CreateCommentDto): Promise<CommentResponseDto> {
        const { content,rate } = createCommentDto;

        try{
        const { data:comment, error } = await this.supabase
            .from('comments')
            .insert({ user_id, product_id, content, rate })
            .select('id, content, rate, created_at')
            .single();

            if (error) throw new InternalServerErrorException(`Failed to create comment: ${error.message}`);
            
        //Calculate new average rating
        const { data: allComments, error: avgError } = await this.supabase
            .from('comments')
            .select('rate')
            .eq('product_id', product_id);

            if (avgError) {
                throw new InternalServerErrorException(`Failed to fetch comments for rating: ${avgError.message}`);
            }

        const rates = allComments.map(c => c.rate);
        const averageRating = rates.reduce((a, b) => a + b, 0) / rates.length;

        // Update product rating
        const { error: updateError } = await this.supabase
            .from('products')
            .update({ rating: averageRating })
            .eq('id', product_id);

            if (updateError) {
                throw new InternalServerErrorException(`Failed to update product rating: ${updateError.message}`);
            }
        return comment as CommentResponseDto;
        }catch(error){
                throw new InternalServerErrorException(`Unexpected error creating comment: ${error.message}`);
        }
    }

    async getComments(product_id: string): Promise<CommentResponseDto[]> {
        try{
        const { data, error } = await this.supabase
            .from('comments')
            .select('id, content, rate, created_at')
            .eq('product_id', product_id)
            .order('created_at', { ascending: true });

            if (error) {
                throw new InternalServerErrorException(`Failed to fetch comments: ${error.message}`);
            }
        return (data || []) as CommentResponseDto[];
    }catch(error){
            throw new InternalServerErrorException(`Unexpected error while fetching comments: ${error.message}`);
    }
}

    async deleteComment(comment_id: string,user_id:string): Promise<{ message: string }> {
        try{
        const { data: comment, error: findError } = await this.supabase
            .from('comments')
            .select('id, product_id, rate')
            .eq('id', comment_id)
            .eq('user_id', user_id)
            .single();

        if (findError || !comment) {
            throw new NotFoundException('Comment not found or not yours');
        }

        const product_id = comment.product_id;

        const { error: deleteError } = await this.supabase
            .from('comments')
            .delete()
            .eq('id', comment_id)
            .eq('user_id',user_id)

            if (deleteError) {
                throw new InternalServerErrorException(`Failed to delete comment: ${deleteError.message}`);
            }

        // Recalculate average rating for the product
        const { data: allComments, error: avgError } = await this.supabase
            .from('comments')
            .select('rate')
            .eq('product_id', product_id);

            if (avgError) {
                throw new InternalServerErrorException(`Failed to fetch comments for rating update: ${avgError.message}`);
            }
        const rates = allComments.map(c => c.rate);
        const averageRating = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;

        // Update product rating
        const { error: updateError } = await this.supabase
            .from('products')
            .update({ rating: averageRating })
            .eq('id', product_id);

            if (updateError) {
                throw new InternalServerErrorException(`Failed to update product rating: ${updateError.message}`);
            }
        return { message: 'Comment deleted successfully' };
    }catch(error){
            throw new InternalServerErrorException(`Unexpected error deleting comment: ${error.message}`);
    }
}
}
