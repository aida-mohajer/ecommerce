import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CreateProductDto } from 'src/products/dto/create-product.dto';

export class CreateProductDtoWithFile extends CreateProductDto {
    @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
    // @IsNotEmpty()
    image_files: any[];
}