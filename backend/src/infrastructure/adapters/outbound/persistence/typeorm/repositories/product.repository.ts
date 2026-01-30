import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../../../../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../../../../../domain/ports/outbound/product.repository.port';
import { ProductOrmEntity } from '../entities/product.orm-entity';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class ProductRepository implements ProductRepositoryPort {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repository: Repository<ProductOrmEntity>,
  ) {}

  async findAll(): Promise<Product[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map(ProductMapper.toDomain);
  }

  async findById(id: string): Promise<Product | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? ProductMapper.toDomain(entity) : null;
  }

  async findByIdWithLock(id: string): Promise<Product | null> {
    const entity = await this.repository
      .createQueryBuilder('product')
      .where('product.id = :id', { id })
      .setLock('pessimistic_write')
      .getOne();
    return entity ? ProductMapper.toDomain(entity) : null;
  }

  async save(product: Product): Promise<Product> {
    const ormEntity = ProductMapper.toOrm(product);
    const saved = await this.repository.save(ormEntity);
    return ProductMapper.toDomain(saved as ProductOrmEntity);
  }

  async updateStock(id: string, stock: number): Promise<void> {
    await this.repository.update(id, { stock });
  }
}
