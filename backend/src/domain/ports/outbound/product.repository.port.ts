import { Product } from '../../entities/product.entity';

export interface ProductRepositoryPort {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findByIdWithLock(id: string): Promise<Product | null>;
  save(product: Product): Promise<Product>;
  updateStock(id: string, stock: number): Promise<void>;
}

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
