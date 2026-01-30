import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from '../../../../../../domain/entities/delivery.entity';
import { DeliveryRepositoryPort } from '../../../../../../domain/ports/outbound/delivery.repository.port';
import { DeliveryOrmEntity } from '../entities/delivery.orm-entity';
import { DeliveryMapper } from '../mappers/delivery.mapper';

@Injectable()
export class DeliveryRepository implements DeliveryRepositoryPort {
  constructor(
    @InjectRepository(DeliveryOrmEntity)
    private readonly repository: Repository<DeliveryOrmEntity>,
  ) {}

  async findById(id: string): Promise<Delivery | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? DeliveryMapper.toDomain(entity) : null;
  }

  async findByCustomerId(customerId: string): Promise<Delivery[]> {
    const entities = await this.repository.find({ where: { customerId } });
    return entities.map(DeliveryMapper.toDomain);
  }

  async save(delivery: Delivery): Promise<Delivery> {
    const ormEntity = DeliveryMapper.toOrm(delivery);
    const saved = await this.repository.save(ormEntity);
    return DeliveryMapper.toDomain(saved as DeliveryOrmEntity);
  }
}
