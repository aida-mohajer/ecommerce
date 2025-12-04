import { Controller, Get, Post, Param, Body, Patch, Delete, UseInterceptors, Query, ParseUUIDPipe, UploadedFiles } from '@nestjs/common';
import { ProductService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductResponseDto } from './dto/create-product-res.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { GetProductsDto } from './dto/get-products-dto';
import { PaginationDto } from 'src/helper/dto/pagination-dto';
import { UpdateProductWithFilesDto } from 'src/helper/dto/update-product-with-file.dto';
import { CreateProductDtoWithFile } from 'src/helper/dto/create-product-with-file';
import { GetProductDto } from './dto/get-product.dto';

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post()
    @ApiOperation({ summary: 'create product' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({description: 'Create a new product',type: CreateProductDtoWithFile})
    @UseInterceptors(FilesInterceptor('image_files', 5, {limits: { fileSize: 5 * 1024 * 1024 }}))
    async createProduct(@Body() createProductDto: CreateProductDto, @UploadedFiles() image_files: Express.Multer.File[],
    ):Promise<CreateProductResponseDto> {                
        return this.productService.createProduct(createProductDto,image_files);
    }

    @Get()
    @ApiOperation({ summary: 'retrieve all products' })
    @ApiOkResponse({ description: 'List of all products' })
    async getAllProducts(@Query() products:PaginationDto):Promise<GetProductsDto[]> {
        return this.productService.getAllProducts(products);
    }

    @Get(':id')
    @ApiOperation({ summary: 'retrieve single product' })
    @ApiParam({ name: 'id', example: 'cfde7adc-2dee-4f81-8fc9-ff9768af9056' })
    async getProductById(@Param('id', new ParseUUIDPipe()) id:string):Promise<GetProductDto> {
        return this.productService.getProductById(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'update single product' })
    @ApiConsumes('multipart/form-data')
    @ApiParam({ name: 'id', example: 'cfde7adc-2dee-4f81-8fc9-ff9768af9056' })
    @ApiBody({ description: 'Update a product', type: UpdateProductWithFilesDto })
    @UseInterceptors(FilesInterceptor('image_files', 5,{limits: { fileSize: 5 * 1024 * 1024 }}))
    update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updateProductDto: UpdateProductWithFilesDto, @UploadedFiles() image_files?: Express.Multer.File[],) {
        return this.productService.updateProduct(id, updateProductDto,image_files);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'delete single product' })
    @ApiParam({ name: 'id', example: 'cfde7adc-2dee-4f81-8fc9-ff9768af9056' })
    delete(@Param('id', new ParseUUIDPipe()) id: string):Promise<{message:string}> {
        return this.productService.deleteProduct(id);
    }
}