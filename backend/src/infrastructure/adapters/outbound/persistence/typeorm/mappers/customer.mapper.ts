import { Customer } from '../../../../../../domain/entities/customer.entity';
import { CustomerOrmEntity } from '../entities/customer.orm-entity';

export class CustomerMapper {
  static toDomain(ormEntity: CustomerOrmEntity): Customer {
    return new Customer({
      id: ormEntity.id,
      email: ormEntity.email,
      fullName: ormEntity.fullName,
      phone: ormEntity.phone,
      createdAt: ormEntity.createdAt,
    });
  }

  static toOrm(domain: Customer): Partial<CustomerOrmEntity> {
    return {
      id: domain.id || undefined,
      email: domain.email,
      fullName: domain.fullName,
      phone: domain.phone,
    };
  }
}
