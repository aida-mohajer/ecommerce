import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-res.dto';

@Injectable()
export class CommentsService {
    constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient) { }

    async createComment(user_id: string, product_id:string, createCommentDto: CreateCommentDto): Promise<CommentResponseDto> {
        const { content,rate } = createCommentDto;

        const { data:comment, error } = await this.supabase
            .from('comments')
            .insert({ user_id, product_id, content, rate })
            .select('id, content, rate, created_at')
            .single();

        if (error) throw new Error(error.message);

        // 2. Calculate new average rating
        const { data: allComments, error: avgError } = await this.supabase
            .from('comments')
            .select('rate')
            .eq('product_id', product_id);

        if (avgError) throw new Error(avgError.message);

        const rates = allComments.map(c => c.rate);
        const averageRating = rates.reduce((a, b) => a + b, 0) / rates.length;

        // 3. Update product rating
        const { error: updateError } = await this.supabase
            .from('products')
            .update({ rating: averageRating })
            .eq('id', product_id);

        if (updateError) throw new Error(updateError.message);

        return comment as CommentResponseDto;
        }

    async getComments(product_id: string): Promise<CommentResponseDto[]> {
        const { data, error } = await this.supabase
            .from('comments')
            .select('id, content, rate, created_at')
            .eq('product_id', product_id)
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);

        return data as CommentResponseDto[];
    }

    async deleteComment(comment_id: string): Promise<{ message: string }> {
        const { data: comment, error: findError } = await this.supabase
            .from('comments')
            .select('id, product_id, rate')
            .eq('id', comment_id)
            .single();

        if (findError || !comment) {
            throw new NotFoundException('Comment not found or not yours');
        }

        const product_id = comment.product_id;

        const { error: deleteError } = await this.supabase
            .from('comments')
            .delete()
            .eq('id', comment_id);

        if (deleteError) throw new Error(deleteError.message);

        // 3. Recalculate average rating for the product
        const { data: allComments, error: avgError } = await this.supabase
            .from('comments')
            .select('rate')
            .eq('product_id', product_id);

        if (avgError) throw new Error(avgError.message);

        const rates = allComments.map(c => c.rate);
        const averageRating = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;

        // 4. Update product rating
        const { error: updateError } = await this.supabase
            .from('products')
            .update({ rating: averageRating })
            .eq('id', product_id);

        if (updateError) throw new Error(updateError.message);

        return { message: 'Comment deleted successfully' };
    }
}
