import { ApiProperty } from '@nestjs/swagger';
import { CreateProductDto } from 'src/products/dto/create-product.dto';

export class CreateProductDtoWithFile extends CreateProductDto {
    @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
    image_files: any[];
}