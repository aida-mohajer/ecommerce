import { Module } from '@nestjs/common';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { AuthModule } from 'src/auth/auth.module';
import {  ProductAttributesService } from './product-attributes.service';
import { ProductAttributesController } from './product-attributes.controller';

@Module({
    imports: [SupabaseModule, AuthModule],
    controllers: [ProductAttributesController],
    providers: [ProductAttributesService],
    exports: [ProductAttributesService]
})
export class ProductAttributesModule { }
