import { Product } from '../../../../../../domain/entities/product.entity';
import { ProductOrmEntity } from '../entities/product.orm-entity';

export class ProductMapper {
  static toDomain(ormEntity: ProductOrmEntity): Product {
    return new Product({
      id: ormEntity.id,
      name: ormEntity.name,
      description: ormEntity.description,
      price: Number(ormEntity.price),
      stock: ormEntity.stock,
      imageUrl: ormEntity.imageUrl,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  static toOrm(domain: Product): Partial<ProductOrmEntity> {
    return {
      id: domain.id || undefined,
      name: domain.name,
      description: domain.description,
      price: domain.price,
      stock: domain.stock,
      imageUrl: domain.imageUrl,
    };
  }
}
