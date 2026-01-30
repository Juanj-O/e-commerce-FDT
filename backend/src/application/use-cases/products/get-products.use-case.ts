import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../../domain/entities/product.entity';
import type { ProductRepositoryPort } from '../../../domain/ports/outbound/product.repository.port';
import { PRODUCT_REPOSITORY } from '../../../domain/ports/outbound/product.repository.port';
import { Result } from '../../../shared/result';

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(): Promise<Result<Product[], Error>> {
    try {
      const products = await this.productRepository.findAll();
      return Result.ok(products);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to get products'),
      );
    }
  }
}
