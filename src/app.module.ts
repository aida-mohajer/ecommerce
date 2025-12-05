import { Module } from '@nestjs/common';
import { SupabaseModule } from './supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './products/products.module';
import { CartModule } from './cart/carts.module';
import { CommentsModule } from './comments/comments.module';
import { ProductAttributesModule } from './product-attributes/product-attributes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SupabaseModule,
    AuthModule,
    ProductModule,
    CartModule,
    CommentsModule,
    ProductAttributesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
