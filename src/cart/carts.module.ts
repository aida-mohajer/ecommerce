import { Module } from '@nestjs/common';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { CartController } from './carts.controller';
import { CartService } from './carts.service';

@Module({
    imports: [SupabaseModule],
    controllers: [CartController],
    providers: [CartService],
    exports: [CartService]
})
export class CartModule { }
