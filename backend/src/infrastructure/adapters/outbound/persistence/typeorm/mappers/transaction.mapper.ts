import {
    Transaction,
    TransactionStatus,
} from '../../../../../../domain/entities/transaction.entity';
import { TransactionOrmEntity } from '../entities/transaction.orm-entity';

export class TransactionMapper {
  static toDomain(ormEntity: TransactionOrmEntity): Transaction {
    return new Transaction({
      id: ormEntity.id,
      customerId: ormEntity.customerId,
      productId: ormEntity.productId,
      deliveryId: ormEntity.deliveryId,
      quantity: ormEntity.quantity,
      productAmount: Number(ormEntity.productAmount),
      baseFee: Number(ormEntity.baseFee),
      deliveryFee: Number(ormEntity.deliveryFee),
      totalAmount: Number(ormEntity.totalAmount),
      status: ormEntity.status as TransactionStatus,
      businessTransactionId: ormEntity.businessTransactionId,
      businessReference: ormEntity.businessReference,
      paymentMethod: ormEntity.paymentMethod,
      cardLastFour: ormEntity.cardLastFour,
      errorMessage: ormEntity.errorMessage,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  static toOrm(domain: Transaction): Partial<TransactionOrmEntity> {
    return {
      id: domain.id || undefined,
      customerId: domain.customerId,
      productId: domain.productId,
      deliveryId: domain.deliveryId,
      quantity: domain.quantity,
      productAmount: domain.productAmount,
      baseFee: domain.baseFee,
      deliveryFee: domain.deliveryFee,
      totalAmount: domain.totalAmount,
      status: domain.status,
      businessTransactionId: domain.businessTransactionId,
      businessReference: domain.businessReference,
      paymentMethod: domain.paymentMethod,
      cardLastFour: domain.cardLastFour,
      errorMessage: domain.errorMessage,
    };
  }
}
