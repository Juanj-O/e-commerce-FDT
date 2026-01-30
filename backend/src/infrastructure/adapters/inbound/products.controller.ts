import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GetProductsUseCase } from '../../../application/use-cases/products/get-products.use-case';
import { GetProductByIdUseCase } from '../../../application/use-cases/products/get-product-by-id.use-case';

@ApiTags('Products')
@Controller('api/products')
export class ProductsController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with available stock' })
  @ApiResponse({
    status: 200,
    description: 'List of products with stock > 0',
  })
  async findAll() {
    const result = await this.getProductsUseCase.execute();

    if (result.isFailure) {
      throw result.error;
    }

    return {
      success: true,
      data: result.value.map((product) => product.toJSON()),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product found',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findOne(@Param('id') id: string) {
    const result = await this.getProductByIdUseCase.execute(id);

    if (result.isFailure) {
      throw new NotFoundException(result.error.message);
    }

    return {
      success: true,
      data: result.value.toJSON(),
    };
  }
}
