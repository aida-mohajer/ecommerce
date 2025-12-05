import { Controller, Get, Post, Param, Body, Patch, Delete, UseInterceptors, Query, ParseUUIDPipe, UploadedFiles, UseGuards } from '@nestjs/common';
import { ProductService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductResponseDto } from './dto/create-product-res.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetProductsDto } from './dto/get-products-dto';
import { PaginationDto } from 'src/helper/dto/pagination-dto';
import { CreateProductDtoWithFile } from 'src/products/dto/create-product-with-file';
import { GetProductDto } from './dto/get-product.dto';
import { SupabaseAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { UpdateProductResponseDto } from './dto/update-product-res.dto';
import { UpdateProductWithFilesDto } from './dto/update-product-with-file.dto';

@ApiTags('products')
@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    // @ApiBearerAuth()
    // @UseGuards(SupabaseAuthGuard, new RolesGuard('admin'))
    @Post('/create')
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

    @Get('/:product_id')
    @ApiOperation({ summary: 'retrieve single product' })
    @ApiParam({ name: 'product_id', example: 'cfde7adc-2dee-4f81-8fc9-ff9768af9056' })
    async getProductById(@Param('product_id', new ParseUUIDPipe()) product_id:string):Promise<GetProductDto> {
        return this.productService.getProductById(product_id);
    }

    // @ApiBearerAuth()
    // @UseGuards(SupabaseAuthGuard, new RolesGuard('admin'))
    @Patch('/update/:product_id')
    @ApiOperation({ summary: 'update single product' })
    @ApiConsumes('multipart/form-data')
    @ApiParam({ name: 'product_id', example: 'cfde7adc-2dee-4f81-8fc9-ff9768af9056' })
    @ApiBody({ description: 'Update a product', type: UpdateProductWithFilesDto })
    @UseInterceptors(FilesInterceptor('image_files', 5,{limits: { fileSize: 5 * 1024 * 1024 }}))
    updateProduct(@Param('product_id', new ParseUUIDPipe()) product_id: string, @Body() updateProductDto: UpdateProductWithFilesDto, @UploadedFiles() image_files?: Express.Multer.File[]):Promise<UpdateProductResponseDto> {
        return this.productService.updateProduct(product_id, updateProductDto,image_files);
    }

    // @ApiBearerAuth()
    // @UseGuards(SupabaseAuthGuard, new RolesGuard('admin'))
    @Delete('/delete/:product_id')
    @ApiOperation({ summary: 'delete single product' })
    @ApiParam({ name: 'product_id', example: 'cfde7adc-2dee-4f81-8fc9-ff9768af9056' })
    deleteProduct(@Param('product_id', new ParseUUIDPipe()) product_id: string):Promise<{message:string}> {
        return this.productService.deleteProduct(product_id);
    }
}