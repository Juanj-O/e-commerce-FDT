import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Customer } from '../../../domain/entities/customer.entity';
import { Delivery } from '../../../domain/entities/delivery.entity';
import { Transaction } from '../../../domain/entities/transaction.entity';
import {
  InsufficientStockException,
  ProductNotFoundException,
} from '../../../domain/exceptions/domain.exception';
import { Result } from '../../../shared/result';
import { TransactionsController } from './transactions.controller';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let mockProcessPaymentUseCase: { execute: jest.Mock };
  let mockGetTransactionUseCase: { execute: jest.Mock };

  const now = new Date();

  const mockTransaction = new Transaction({
    id: 'txn-1',
    customerId: 'cust-1',
    productId: 'prod-1',
    deliveryId: 'del-1',
    quantity: 2,
    productAmount: 50000,
    baseFee: 500000,
    deliveryFee: 1000000,
    totalAmount: 1550000,
    status: 'APPROVED',
    businessTransactionId: 'biz-txn-1',
    businessReference: 'REF-001',
    paymentMethod: 'CARD',
    cardLastFour: '4242',
    createdAt: now,
    updatedAt: now,
  });

  const mockCustomer = new Customer({
    id: 'cust-1',
    email: 'john@example.com',
    fullName: 'John Doe',
    phone: '+573001234567',
    createdAt: now,
  });

  const mockDelivery = new Delivery({
    id: 'del-1',
    customerId: 'cust-1',
    address: 'Calle 123 #45-67',
    city: 'Bogota',
    department: 'Cundinamarca',
    zipCode: '110111',
    createdAt: now,
  });

  const mockCreateTransactionDto = {
    productId: 'prod-1',
    quantity: 2,
    customer: {
      email: 'john@example.com',
      fullName: 'John Doe',
      phone: '+573001234567',
    },
    delivery: {
      address: 'Calle 123 #45-67',
      city: 'Bogota',
      department: 'Cundinamarca',
      zipCode: '110111',
    },
    card: {
      number: '4242424242424242',
      cvc: '123',
      expMonth: '12',
      expYear: '28',
      cardHolder: 'JOHN DOE',
    },
    installments: 1,
  };

  beforeEach(() => {
    mockProcessPaymentUseCase = { execute: jest.fn() };
    mockGetTransactionUseCase = { execute: jest.fn() };

    controller = new TransactionsController(
      mockProcessPaymentUseCase as any,
      mockGetTransactionUseCase as any,
    );
  });

  describe('create', () => {
    it('should return success with transaction, customer, and delivery data when payment succeeds', async () => {
      mockProcessPaymentUseCase.execute.mockResolvedValue(
        Result.ok({
          transaction: mockTransaction,
          customer: mockCustomer,
          delivery: mockDelivery,
        }),
      );

      const result = await controller.create(mockCreateTransactionDto as any);

      expect(result).toEqual({
        success: true,
        data: {
          transaction: mockTransaction.toJSON(),
          customer: mockCustomer.toJSON(),
          delivery: mockDelivery.toJSON(),
        },
      });
      expect(result.success).toBe(true);
      expect(result.data.transaction.id).toBe('txn-1');
      expect(result.data.customer.id).toBe('cust-1');
      expect(result.data.delivery.id).toBe('del-1');
      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledWith(mockCreateTransactionDto);
    });

    it('should throw NotFoundException when use case fails with ProductNotFoundException', async () => {
      const error = new ProductNotFoundException('prod-999');
      mockProcessPaymentUseCase.execute.mockResolvedValue(Result.fail(error));

      await expect(controller.create(mockCreateTransactionDto as any)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.create(mockCreateTransactionDto as any)).rejects.toThrow(
        'Product with id prod-999 not found',
      );
    });

    it('should throw BadRequestException when use case fails with InsufficientStockException', async () => {
      const error = new InsufficientStockException('prod-1', 100, 5);
      mockProcessPaymentUseCase.execute.mockResolvedValue(Result.fail(error));

      await expect(controller.create(mockCreateTransactionDto as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.create(mockCreateTransactionDto as any)).rejects.toThrow(
        'Insufficient stock for product prod-1. Requested: 100, Available: 5',
      );
    });

    it('should throw BadRequestException when use case fails with a generic Error', async () => {
      const error = new Error('Payment gateway timeout');
      mockProcessPaymentUseCase.execute.mockResolvedValue(Result.fail(error));

      await expect(controller.create(mockCreateTransactionDto as any)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.create(mockCreateTransactionDto as any)).rejects.toThrow(
        'Payment gateway timeout',
      );
    });

    it('should pass the DTO to the use case', async () => {
      mockProcessPaymentUseCase.execute.mockResolvedValue(
        Result.ok({
          transaction: mockTransaction,
          customer: mockCustomer,
          delivery: mockDelivery,
        }),
      );

      await controller.create(mockCreateTransactionDto as any);

      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledWith(mockCreateTransactionDto);
    });
  });

  describe('findOne', () => {
    it('should return success with transaction data when use case succeeds', async () => {
      mockGetTransactionUseCase.execute.mockResolvedValue(Result.ok(mockTransaction));

      const result = await controller.findOne('txn-1');

      expect(result).toEqual({
        success: true,
        data: mockTransaction.toJSON(),
      });
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('txn-1');
      expect(result.data.status).toBe('APPROVED');
      expect(result.data.totalAmount).toBe(1550000);
      expect(mockGetTransactionUseCase.execute).toHaveBeenCalledWith('txn-1');
    });

    it('should throw NotFoundException when use case returns failure', async () => {
      const error = new Error('Transaction with id txn-999 not found');
      mockGetTransactionUseCase.execute.mockResolvedValue(Result.fail(error));

      await expect(controller.findOne('txn-999')).rejects.toThrow(NotFoundException);
      await expect(controller.findOne('txn-999')).rejects.toThrow(
        'Transaction with id txn-999 not found',
      );
      expect(mockGetTransactionUseCase.execute).toHaveBeenCalledWith('txn-999');
    });

    it('should pass the id parameter to the use case', async () => {
      const transaction = new Transaction({
        id: 'uuid-abc',
        customerId: 'cust-1',
        productId: 'prod-1',
        quantity: 1,
        productAmount: 10000,
        baseFee: 500000,
        deliveryFee: 1000000,
        totalAmount: 1510000,
        status: 'PENDING',
        createdAt: now,
        updatedAt: now,
      });
      mockGetTransactionUseCase.execute.mockResolvedValue(Result.ok(transaction));

      await controller.findOne('uuid-abc');

      expect(mockGetTransactionUseCase.execute).toHaveBeenCalledWith('uuid-abc');
      expect(mockGetTransactionUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });
});
