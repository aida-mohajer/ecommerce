import { Module } from '@nestjs/common';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { ProductController } from './products.controller';
import { ProductService } from './products.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [SupabaseModule,AuthModule],
    controllers: [ProductController],
    providers: [ProductService],
    exports: [ProductService]
})
export class ProductModule { }
