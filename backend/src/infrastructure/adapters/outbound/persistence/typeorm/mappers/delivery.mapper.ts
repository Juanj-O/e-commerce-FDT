import { Delivery } from '../../../../../../domain/entities/delivery.entity';
import { DeliveryOrmEntity } from '../entities/delivery.orm-entity';

export class DeliveryMapper {
  static toDomain(ormEntity: DeliveryOrmEntity): Delivery {
    return new Delivery({
      id: ormEntity.id,
      customerId: ormEntity.customerId,
      address: ormEntity.address,
      city: ormEntity.city,
      department: ormEntity.department,
      zipCode: ormEntity.zipCode,
      createdAt: ormEntity.createdAt,
    });
  }

  static toOrm(domain: Delivery): Partial<DeliveryOrmEntity> {
    return {
      id: domain.id || undefined,
      customerId: domain.customerId,
      address: domain.address,
      city: domain.city,
      department: domain.department,
      zipCode: domain.zipCode,
    };
  }
}
