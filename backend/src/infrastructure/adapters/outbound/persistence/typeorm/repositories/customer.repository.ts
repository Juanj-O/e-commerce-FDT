import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../../../../../domain/entities/customer.entity';
import { CustomerRepositoryPort } from '../../../../../../domain/ports/outbound/customer.repository.port';
import { CustomerOrmEntity } from '../entities/customer.orm-entity';
import { CustomerMapper } from '../mappers/customer.mapper';

@Injectable()
export class CustomerRepository implements CustomerRepositoryPort {
  constructor(
    @InjectRepository(CustomerOrmEntity)
    private readonly repository: Repository<CustomerOrmEntity>,
  ) {}

  async findById(id: string): Promise<Customer | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? CustomerMapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? CustomerMapper.toDomain(entity) : null;
  }

  async save(customer: Customer): Promise<Customer> {
    const ormEntity = CustomerMapper.toOrm(customer);
    const saved = await this.repository.save(ormEntity);
    return CustomerMapper.toDomain(saved as CustomerOrmEntity);
  }
}
