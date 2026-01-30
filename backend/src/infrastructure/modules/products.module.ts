import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from '../adapters/inbound/products.controller';
import { GetProductsUseCase } from '../../application/use-cases/products/get-products.use-case';
import { GetProductByIdUseCase } from '../../application/use-cases/products/get-product-by-id.use-case';
import { ProductOrmEntity } from '../adapters/outbound/persistence/typeorm/entities/product.orm-entity';
import { ProductRepository } from '../adapters/outbound/persistence/typeorm/repositories/product.repository';
import { PRODUCT_REPOSITORY } from '../../domain/ports/outbound/product.repository.port';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOrmEntity])],
  controllers: [ProductsController],
  providers: [
    GetProductsUseCase,
    GetProductByIdUseCase,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}
