import { Transaction } from '../../../../../../domain/entities/transaction.entity';
import { TransactionMapper } from './transaction.mapper';

describe('TransactionMapper', () => {
  const now = new Date('2025-01-15T10:00:00.000Z');
  const updatedAt = new Date('2025-01-16T12:00:00.000Z');

  describe('toDomain', () => {
    it('should map an ORM entity to a domain Transaction with all fields', () => {
      const ormEntity = {
        id: 'txn-uuid-1',
        customerId: 'cust-uuid-1',
        productId: 'prod-uuid-1',
        deliveryId: 'del-uuid-1',
        quantity: 3,
        productAmount: '150000.00' as any,
        baseFee: '500000.00' as any,
        deliveryFee: '1000000.00' as any,
        totalAmount: '1650000.00' as any,
        status: 'APPROVED',
        businessTransactionId: 'biz-txn-123',
        businessReference: 'REF-ABC',
        paymentMethod: 'CARD',
        cardLastFour: '4242',
        errorMessage: null,
        createdAt: now,
        updatedAt: updatedAt,
      };

      const transaction = TransactionMapper.toDomain(ormEntity as any);

      expect(transaction).toBeInstanceOf(Transaction);
      expect(transaction.id).toBe('txn-uuid-1');
      expect(transaction.customerId).toBe('cust-uuid-1');
      expect(transaction.productId).toBe('prod-uuid-1');
      expect(transaction.deliveryId).toBe('del-uuid-1');
      expect(transaction.quantity).toBe(3);
      expect(transaction.productAmount).toBe(150000);
      expect(transaction.baseFee).toBe(500000);
      expect(transaction.deliveryFee).toBe(1000000);
      expect(transaction.totalAmount).toBe(1650000);
      expect(transaction.status).toBe('APPROVED');
      expect(transaction.businessTransactionId).toBe('biz-txn-123');
      expect(transaction.businessReference).toBe('REF-ABC');
      expect(transaction.paymentMethod).toBe('CARD');
      expect(transaction.cardLastFour).toBe('4242');
      expect(transaction.errorMessage).toBeNull();
      expect(transaction.createdAt).toBe(now);
      expect(transaction.updatedAt).toBe(updatedAt);
    });

    it('should convert decimal fields from strings to numbers using Number()', () => {
      const ormEntity = {
        id: 'txn-uuid-2',
        customerId: 'cust-uuid-2',
        productId: 'prod-uuid-2',
        deliveryId: 'del-uuid-2',
        quantity: 1,
        productAmount: '99999.99' as any,
        baseFee: '500000.50' as any,
        deliveryFee: '1000000.75' as any,
        totalAmount: '1600001.24' as any,
        status: 'PENDING',
        businessTransactionId: null,
        businessReference: null,
        paymentMethod: null,
        cardLastFour: null,
        errorMessage: null,
        createdAt: now,
        updatedAt: now,
      };

      const transaction = TransactionMapper.toDomain(ormEntity as any);

      expect(transaction.productAmount).toBe(99999.99);
      expect(typeof transaction.productAmount).toBe('number');
      expect(transaction.baseFee).toBe(500000.5);
      expect(typeof transaction.baseFee).toBe('number');
      expect(transaction.deliveryFee).toBe(1000000.75);
      expect(typeof transaction.deliveryFee).toBe('number');
      expect(transaction.totalAmount).toBe(1600001.24);
      expect(typeof transaction.totalAmount).toBe('number');
    });

    it('should map status string to TransactionStatus type', () => {
      const ormEntity = {
        id: 'txn-uuid-3',
        customerId: 'cust-uuid-3',
        productId: 'prod-uuid-3',
        deliveryId: null,
        quantity: 1,
        productAmount: '10000' as any,
        baseFee: '500000' as any,
        deliveryFee: '1000000' as any,
        totalAmount: '1510000' as any,
        status: 'DECLINED',
        businessTransactionId: 'biz-txn-456',
        businessReference: 'REF-DEF',
        paymentMethod: 'CARD',
        cardLastFour: '1234',
        errorMessage: 'Declined by issuer',
        createdAt: now,
        updatedAt: now,
      };

      const transaction = TransactionMapper.toDomain(ormEntity as any);

      expect(transaction.status).toBe('DECLINED');
      expect(transaction.errorMessage).toBe('Declined by issuer');
    });

    it('should handle integer numeric fields without conversion issues', () => {
      const ormEntity = {
        id: 'txn-uuid-4',
        customerId: 'cust-uuid-4',
        productId: 'prod-uuid-4',
        deliveryId: 'del-uuid-4',
        quantity: 5,
        productAmount: 250000,
        baseFee: 500000,
        deliveryFee: 1000000,
        totalAmount: 1750000,
        status: 'APPROVED',
        businessTransactionId: 'biz-789',
        businessReference: 'REF-GHI',
        paymentMethod: 'CARD',
        cardLastFour: '9999',
        errorMessage: null,
        createdAt: now,
        updatedAt: now,
      };

      const transaction = TransactionMapper.toDomain(ormEntity as any);

      expect(transaction.productAmount).toBe(250000);
      expect(transaction.baseFee).toBe(500000);
      expect(transaction.deliveryFee).toBe(1000000);
      expect(transaction.totalAmount).toBe(1750000);
    });
  });

  describe('toOrm', () => {
    it('should map a domain Transaction to a partial ORM entity with all fields', () => {
      const transaction = new Transaction({
        id: 'txn-uuid-1',
        customerId: 'cust-uuid-1',
        productId: 'prod-uuid-1',
        deliveryId: 'del-uuid-1',
        quantity: 3,
        productAmount: 150000,
        baseFee: 500000,
        deliveryFee: 1000000,
        totalAmount: 1650000,
        status: 'APPROVED',
        businessTransactionId: 'biz-txn-123',
        businessReference: 'REF-ABC',
        paymentMethod: 'CARD',
        cardLastFour: '4242',
        errorMessage: undefined,
        createdAt: now,
        updatedAt: updatedAt,
      });

      const ormPartial = TransactionMapper.toOrm(transaction);

      expect(ormPartial.id).toBe('txn-uuid-1');
      expect(ormPartial.customerId).toBe('cust-uuid-1');
      expect(ormPartial.productId).toBe('prod-uuid-1');
      expect(ormPartial.deliveryId).toBe('del-uuid-1');
      expect(ormPartial.quantity).toBe(3);
      expect(ormPartial.productAmount).toBe(150000);
      expect(ormPartial.baseFee).toBe(500000);
      expect(ormPartial.deliveryFee).toBe(1000000);
      expect(ormPartial.totalAmount).toBe(1650000);
      expect(ormPartial.status).toBe('APPROVED');
      expect(ormPartial.businessTransactionId).toBe('biz-txn-123');
      expect(ormPartial.businessReference).toBe('REF-ABC');
      expect(ormPartial.paymentMethod).toBe('CARD');
      expect(ormPartial.cardLastFour).toBe('4242');
      expect(ormPartial.errorMessage).toBeUndefined();
    });

    it('should return undefined for id when domain entity has an empty string id', () => {
      const transaction = new Transaction({
        customerId: 'cust-uuid-1',
        productId: 'prod-uuid-1',
        quantity: 1,
        productAmount: 50000,
        baseFee: 500000,
        deliveryFee: 1000000,
        totalAmount: 1550000,
      });

      const ormPartial = TransactionMapper.toOrm(transaction);

      expect(ormPartial.id).toBeUndefined();
      expect(ormPartial.customerId).toBe('cust-uuid-1');
      expect(ormPartial.productId).toBe('prod-uuid-1');
    });

    it('should not include createdAt or updatedAt in the ORM partial', () => {
      const transaction = new Transaction({
        id: 'txn-uuid-1',
        customerId: 'cust-uuid-1',
        productId: 'prod-uuid-1',
        quantity: 1,
        productAmount: 10000,
        baseFee: 500000,
        deliveryFee: 1000000,
        totalAmount: 1510000,
        createdAt: now,
        updatedAt: updatedAt,
      });

      const ormPartial = TransactionMapper.toOrm(transaction);

      expect(ormPartial).not.toHaveProperty('createdAt');
      expect(ormPartial).not.toHaveProperty('updatedAt');
    });

    it('should preserve optional fields when they have values', () => {
      const transaction = new Transaction({
        id: 'txn-uuid-5',
        customerId: 'cust-uuid-5',
        productId: 'prod-uuid-5',
        deliveryId: 'del-uuid-5',
        quantity: 2,
        productAmount: 80000,
        baseFee: 500000,
        deliveryFee: 1000000,
        totalAmount: 1580000,
        status: 'ERROR',
        businessTransactionId: 'biz-999',
        businessReference: 'REF-XYZ',
        paymentMethod: 'CARD',
        cardLastFour: '5678',
        errorMessage: 'Gateway timeout',
      });

      const ormPartial = TransactionMapper.toOrm(transaction);

      expect(ormPartial.errorMessage).toBe('Gateway timeout');
      expect(ormPartial.status).toBe('ERROR');
      expect(ormPartial.businessTransactionId).toBe('biz-999');
      expect(ormPartial.businessReference).toBe('REF-XYZ');
    });
  });
});
