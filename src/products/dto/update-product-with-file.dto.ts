import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { UpdateProductDto } from 'src/products/dto/update-product.dto';

export class UpdateProductWithFilesDto extends UpdateProductDto {
    @ApiPropertyOptional({ type: 'array', items: { type: 'string', format: 'binary' } })
    @IsOptional()
    image_files?: any[];
}