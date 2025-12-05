import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ProductAttributesService } from "./product-attributes.service";
import { AddProductAttributesDto } from "./dto/add-product-attributes.dto";
import { ProductAttributesResponseDto } from "./dto/product-attributes-res.dto";
import { SupabaseAuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/role.guard";
import { UpdateProductAttributesDto } from "./dto/update-product-attribute.dto";

@ApiTags('product_attributes')
@Controller('product_attributes')
export class ProductAttributesController {
    constructor(private readonly productAttributesService: ProductAttributesService) { }

    // @ApiBearerAuth()
    // @UseGuards(SupabaseAuthGuard, new RolesGuard('admin'))
    @Post('add/:product_id')
    @ApiOperation({ summary: 'add product attributes' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('files', 0))
    // @ApiBody({ description: 'add product attribute', type: AddProductAttributesDto })
    async addProductAttribute(
        @Param('product_id', new ParseUUIDPipe()) product_id: string,
        @Body() addProductAttributeDto: AddProductAttributesDto,
    ): Promise<ProductAttributesResponseDto> {
        return await this.productAttributesService.addProductAttributes(product_id, addProductAttributeDto);
    }

    @Get('/:product_id')
    @ApiOperation({ summary: 'retrieve product attributes' })
    async getProductAttributes(@Param('product_id', new ParseUUIDPipe()) product_id: string): Promise<ProductAttributesResponseDto[]> {
        return this.productAttributesService.getProductAttributes(product_id);
    }

  
    // @ApiBearerAuth()
    // @UseGuards(SupabaseAuthGuard, new RolesGuard('admin'))
    @Patch('/update/:product_attribute_id')
    @ApiOperation({ summary: 'update product attribute' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('files', 0))
    @ApiParam({ name: 'product_attribute_id', example: 'cfde7adc-2dee-4f81-8fc9-ff9768af9056' })
    @ApiBody({ description: 'Update a product attribute', type: UpdateProductAttributesDto })
    async updateProductAttribute(@Param('product_attribute_id', new ParseUUIDPipe()) product_attribute_id: string, @Body() updateProductAttributeDto: UpdateProductAttributesDto):Promise<ProductAttributesResponseDto> {
        return this.productAttributesService.updateProductAttributes(product_attribute_id, updateProductAttributeDto);
    }

    // @ApiBearerAuth()
    // @UseGuards(SupabaseAuthGuard, new RolesGuard('admin'))
    @Delete('delete/:product_attribute_id')
    @ApiOperation({ summary: 'delete product attribute' })
    async deleteproductAttribute(@Param('product_attribute_id', new ParseUUIDPipe()) product_attribute_id: string): Promise<{ message: string }> {
        return this.productAttributesService.deleteProductAttribute(product_attribute_id);
    }
}
