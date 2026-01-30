import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from '../../../../../../domain/entities/transaction.entity';
import { TransactionOrmEntity } from '../entities/transaction.orm-entity';
import { TransactionRepository } from './transaction.repository';

describe('TransactionRepository', () => {
  let repository: TransactionRepository;

  const mockTransaction = new Transaction({
    id: 'transaction-uuid-1',
    customerId: 'customer-uuid-1',
    productId: 'product-uuid-1',
    deliveryId: 'delivery-uuid-1',
    quantity: 2,
    productAmount: 50000,
    baseFee: 5000,
    deliveryFee: 10000,
    totalAmount: 65000,
    status: 'APPROVED',
    businessTransactionId: '12345-67890',
    businessReference: 'REF-001',
    paymentMethod: 'CARD',
    cardLastFour: '4242',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  });

  const mockTransactionEntity: TransactionOrmEntity = {
    id: 'transaction-uuid-1',
    customerId: 'customer-uuid-1',
    productId: 'product-uuid-1',
    deliveryId: 'delivery-uuid-1',
    quantity: 2,
    productAmount: 50000,
    baseFee: 5000,
    deliveryFee: 10000,
    totalAmount: 65000,
    status: 'APPROVED',
    businessTransactionId: '12345-67890',
    businessReference: 'REF-001',
    paymentMethod: 'CARD',
    cardLastFour: '4242',
    errorMessage: undefined,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  } as unknown as TransactionOrmEntity;

  const mockOrmRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionRepository,
        {
          provide: getRepositoryToken(TransactionOrmEntity),
          useValue: mockOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<TransactionRepository>(TransactionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a transaction when found', async () => {
      mockOrmRepository.findOne.mockResolvedValue(mockTransactionEntity);

      const result = await repository.findById('transaction-uuid-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('transaction-uuid-1');
      expect(result?.customerId).toBe('customer-uuid-1');
      expect(result?.status).toBe('APPROVED');
      expect(result?.totalAmount).toBe(65000);
    });

    it('should return null when transaction not found', async () => {
      mockOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });

    it('should handle different transaction ids', async () => {
      const anotherTransaction = {
        ...mockTransactionEntity,
        id: 'transaction-uuid-2',
      };
      mockOrmRepository.findOne.mockResolvedValue(anotherTransaction);

      const result = await repository.findById('transaction-uuid-2');

      expect(result?.id).toBe('transaction-uuid-2');
    });
  });

  describe('findByCustomerId', () => {
    it('should return all transactions for a customer ordered by date', async () => {
      const transaction2 = {
        ...mockTransactionEntity,
        id: 'transaction-uuid-2',
        createdAt: new Date('2024-01-16'),
      };
      mockOrmRepository.find.mockResolvedValue([
        transaction2,
        mockTransactionEntity,
      ]);

      const result = await repository.findByCustomerId('customer-uuid-1');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('transaction-uuid-2');
      expect(result[1].id).toBe('transaction-uuid-1');
    });

    it('should return empty array when no transactions found', async () => {
      mockOrmRepository.find.mockResolvedValue([]);

      const result = await repository.findByCustomerId('customer-uuid-999');

      expect(result).toEqual([]);
    });

    it('should handle customer with single transaction', async () => {
      mockOrmRepository.find.mockResolvedValue([mockTransactionEntity]);

      const result = await repository.findByCustomerId('customer-uuid-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('transaction-uuid-1');
    });
  });

  describe('save', () => {
    it('should save a new pending transaction', async () => {
      const newTransaction = new Transaction({
        customerId: 'customer-uuid-2',
        productId: 'product-uuid-2',
        quantity: 1,
        productAmount: 30000,
        baseFee: 3000,
        deliveryFee: 5000,
        totalAmount: 38000,
      });

      const newEntity = {
        id: 'new-transaction-uuid',
        customerId: 'customer-uuid-2',
        productId: 'product-uuid-2',
        deliveryId: undefined,
        quantity: 1,
        productAmount: 30000,
        baseFee: 3000,
        deliveryFee: 5000,
        totalAmount: 38000,
        status: 'PENDING',
        businessTransactionId: undefined,
        businessReference: undefined,
        paymentMethod: undefined,
        cardLastFour: undefined,
        errorMessage: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrmRepository.save.mockResolvedValue(
        newEntity as unknown as TransactionOrmEntity,
      );

      const result = await repository.save(newTransaction);

      expect(result.customerId).toBe('customer-uuid-2');
      expect(result.status).toBe('PENDING');
      expect(result.totalAmount).toBe(38000);
    });

    it('should save transaction with all fields', async () => {
      mockOrmRepository.save.mockResolvedValue(mockTransactionEntity);

      const result = await repository.save(mockTransaction);

      expect(result.id).toBe(mockTransaction.id);
      expect(result.businessTransactionId).toBe('12345-67890');
      expect(result.businessReference).toBe('REF-001');
      expect(result.cardLastFour).toBe('4242');
    });

    it('should handle transaction without delivery', async () => {
      const txNoDelivery = new Transaction({
        customerId: 'customer-uuid-3',
        productId: 'product-uuid-3',
        quantity: 3,
        productAmount: 45000,
        baseFee: 4500,
        deliveryFee: 0,
        totalAmount: 49500,
      });

      const entityNoDelivery = {
        ...mockTransactionEntity,
        id: 'tx-no-delivery',
        customerId: 'customer-uuid-3',
        deliveryId: undefined,
        deliveryFee: 0,
        totalAmount: 49500,
      };

      mockOrmRepository.save.mockResolvedValue(entityNoDelivery);

      const result = await repository.save(txNoDelivery);

      expect(result.deliveryId).toBeUndefined();
      expect(result.deliveryFee).toBe(0);
    });
  });

  describe('update', () => {
    it('should update transaction status to approved', async () => {
      const updatedTransaction = new Transaction({
        id: mockTransaction.id,
        customerId: mockTransaction.customerId,
        productId: mockTransaction.productId,
        deliveryId: mockTransaction.deliveryId,
        quantity: mockTransaction.quantity,
        productAmount: mockTransaction.productAmount,
        baseFee: mockTransaction.baseFee,
        deliveryFee: mockTransaction.deliveryFee,
        totalAmount: mockTransaction.totalAmount,
        status: 'APPROVED',
        businessTransactionId: '98765-43210',
        businessReference: 'REF-UPDATED',
        paymentMethod: 'CARD',
        cardLastFour: '1234',
        createdAt: mockTransaction.createdAt,
        updatedAt: new Date('2024-01-16'),
      });

      const updatedEntity = {
        ...mockTransactionEntity,
        status: 'APPROVED',
        businessTransactionId: '98765-43210',
        businessReference: 'REF-UPDATED',
        cardLastFour: '1234',
        updatedAt: new Date('2024-01-16'),
      };

      mockOrmRepository.update.mockResolvedValue({ affected: 1 });
      mockOrmRepository.findOne.mockResolvedValue(updatedEntity);

      const result = await repository.update(updatedTransaction);

      expect(result.status).toBe('APPROVED');
      expect(result.businessTransactionId).toBe('98765-43210');
      expect(result.businessReference).toBe('REF-UPDATED');
    });

    it('should update transaction status to declined', async () => {
      const declinedTransaction = new Transaction({
        id: mockTransaction.id,
        customerId: mockTransaction.customerId,
        productId: mockTransaction.productId,
        quantity: mockTransaction.quantity,
        productAmount: mockTransaction.productAmount,
        baseFee: mockTransaction.baseFee,
        deliveryFee: mockTransaction.deliveryFee,
        totalAmount: mockTransaction.totalAmount,
        status: 'DECLINED',
        errorMessage: 'Insufficient funds',
        createdAt: mockTransaction.createdAt,
        updatedAt: new Date('2024-01-16'),
      });

      const declinedEntity = {
        ...mockTransactionEntity,
        status: 'DECLINED',
        errorMessage: 'Insufficient funds',
        updatedAt: new Date('2024-01-16'),
      };

      mockOrmRepository.update.mockResolvedValue({ affected: 1 });
      mockOrmRepository.findOne.mockResolvedValue(declinedEntity);

      const result = await repository.update(declinedTransaction);

      expect(result.status).toBe('DECLINED');
      expect(result.errorMessage).toBe('Insufficient funds');
    });

    it('should update transaction and add delivery', async () => {
      const txWithDelivery = new Transaction({
        id: mockTransaction.id,
        customerId: mockTransaction.customerId,
        productId: mockTransaction.productId,
        deliveryId: 'new-delivery-uuid',
        quantity: mockTransaction.quantity,
        productAmount: mockTransaction.productAmount,
        baseFee: mockTransaction.baseFee,
        deliveryFee: mockTransaction.deliveryFee,
        totalAmount: mockTransaction.totalAmount,
        status: mockTransaction.status,
        createdAt: mockTransaction.createdAt,
        updatedAt: new Date('2024-01-16'),
      });

      const entityWithDelivery = {
        ...mockTransactionEntity,
        deliveryId: 'new-delivery-uuid',
        updatedAt: new Date('2024-01-16'),
      };

      mockOrmRepository.update.mockResolvedValue({ affected: 1 });
      mockOrmRepository.findOne.mockResolvedValue(entityWithDelivery);

      const result = await repository.update(txWithDelivery);

      expect(result.deliveryId).toBe('new-delivery-uuid');
    });

    it('should update transaction status to error', async () => {
      const errorTransaction = new Transaction({
        id: mockTransaction.id,
        customerId: mockTransaction.customerId,
        productId: mockTransaction.productId,
        quantity: mockTransaction.quantity,
        productAmount: mockTransaction.productAmount,
        baseFee: mockTransaction.baseFee,
        deliveryFee: mockTransaction.deliveryFee,
        totalAmount: mockTransaction.totalAmount,
        status: 'ERROR',
        errorMessage: 'Gateway timeout',
        createdAt: mockTransaction.createdAt,
        updatedAt: new Date('2024-01-16'),
      });

      const errorEntity = {
        ...mockTransactionEntity,
        status: 'ERROR',
        errorMessage: 'Gateway timeout',
        updatedAt: new Date('2024-01-16'),
      };

      mockOrmRepository.update.mockResolvedValue({ affected: 1 });
      mockOrmRepository.findOne.mockResolvedValue(errorEntity);

      const result = await repository.update(errorTransaction);

      expect(result.status).toBe('ERROR');
      expect(result.errorMessage).toBe('Gateway timeout');
    });
  });
});
