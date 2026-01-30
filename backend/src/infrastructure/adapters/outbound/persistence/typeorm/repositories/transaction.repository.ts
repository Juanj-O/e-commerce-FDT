import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../../../../domain/entities/transaction.entity';
import { TransactionRepositoryPort } from '../../../../../../domain/ports/outbound/transaction.repository.port';
import { TransactionOrmEntity } from '../entities/transaction.orm-entity';
import { TransactionMapper } from '../mappers/transaction.mapper';

@Injectable()
export class TransactionRepository implements TransactionRepositoryPort {
  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly repository: Repository<TransactionOrmEntity>,
  ) {}

  async findById(id: string): Promise<Transaction | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? TransactionMapper.toDomain(entity) : null;
  }

  async findByCustomerId(customerId: string): Promise<Transaction[]> {
    const entities = await this.repository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(TransactionMapper.toDomain);
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const ormEntity = TransactionMapper.toOrm(transaction);
    const saved = await this.repository.save(ormEntity);
    return TransactionMapper.toDomain(saved as TransactionOrmEntity);
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const ormEntity = TransactionMapper.toOrm(transaction);
    await this.repository.update(transaction.id, ormEntity);
    const updated = await this.repository.findOne({
      where: { id: transaction.id },
    });
    return TransactionMapper.toDomain(updated as TransactionOrmEntity);
  }
}
