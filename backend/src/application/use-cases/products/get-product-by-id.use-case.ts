import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../shared/result';
import { Product } from '../../../domain/entities/product.entity';
import type { ProductRepositoryPort } from '../../../domain/ports/outbound/product.repository.port';
import { PRODUCT_REPOSITORY } from '../../../domain/ports/outbound/product.repository.port';
import { ProductNotFoundException } from '../../../domain/exceptions/domain.exception';

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Product, Error>> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      return Result.fail(new ProductNotFoundException(id));
    }

    return Result.ok(product);
  }
}
