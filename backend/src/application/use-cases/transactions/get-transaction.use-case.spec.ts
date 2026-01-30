import { Product } from '../../../domain/entities/product.entity';
import { Transaction } from '../../../domain/entities/transaction.entity';
import type { PaymentGatewayPort } from '../../../domain/ports/outbound/payment-gateway.port';
import type { ProductRepositoryPort } from '../../../domain/ports/outbound/product.repository.port';
import type { TransactionRepositoryPort } from '../../../domain/ports/outbound/transaction.repository.port';
import { Result } from '../../../shared/result';
import { GetTransactionUseCase } from './get-transaction.use-case';

describe('GetTransactionUseCase', () => {
  let useCase: GetTransactionUseCase;
  let transactionRepository: jest.Mocked<TransactionRepositoryPort>;
  let paymentGateway: jest.Mocked<PaymentGatewayPort>;
  let productRepository: jest.Mocked<ProductRepositoryPort>;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    transactionRepository = {
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    paymentGateway = {
      getAcceptanceToken: jest.fn(),
      tokenizeCard: jest.fn(),
      createPayment: jest.fn(),
      getTransaction: jest.fn(),
    };

    productRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIdWithLock: jest.fn(),
      save: jest.fn(),
      updateStock: jest.fn(),
    };

    useCase = new GetTransactionUseCase(
      transactionRepository,
      paymentGateway,
      productRepository,
    );
  });

  // ========================================================================
  // TRANSACTION NOT FOUND
  // ========================================================================

  describe('Transaction not found', () => {
    it('should return a failure when the transaction does not exist', async () => {
      transactionRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute('non-existent-id');

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('Transaction with id non-existent-id not found');
      expect(transactionRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(paymentGateway.getTransaction).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // NON-PENDING TRANSACTION (no gateway check needed)
  // ========================================================================

  describe('Non-PENDING transaction', () => {
    it('should return an APPROVED transaction directly without checking the gateway', async () => {
      const approvedTransaction = new Transaction({
        id: 'txn-1',
        customerId: 'cust-1',
        productId: 'prod-1',
        deliveryId: 'del-1',
        quantity: 1,
        productAmount: 50000,
        baseFee: 500000,
        deliveryFee: 1000000,
        totalAmount: 1550000,
        status: 'APPROVED',
        businessTransactionId: 'biz-txn-001',
      });
      transactionRepository.findById.mockResolvedValue(approvedTransaction);

      const result = await useCase.execute('txn-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value.status).toBe('APPROVED');
      expect(paymentGateway.getTransaction).not.toHaveBeenCalled();
      expect(transactionRepository.update).not.toHaveBeenCalled();
    });

    it('should return a DECLINED transaction directly without checking the gateway', async () => {
      const declinedTransaction = new Transaction({
        id: 'txn-2',
        customerId: 'cust-1',
        productId: 'prod-1',
        deliveryId: 'del-1',
        quantity: 1,
        productAmount: 50000,
        baseFee: 500000,
        deliveryFee: 1000000,
        totalAmount: 1550000,
        status: 'DECLINED',
        errorMessage: 'Insufficient funds',
      });
      transactionRepository.findById.mockResolvedValue(declinedTransaction);

      const result = await useCase.execute('txn-2');

      expect(result.isSuccess).toBe(true);
      expect(result.value.status).toBe('DECLINED');
      expect(paymentGateway.getTransaction).not.toHaveBeenCalled();
      expect(transactionRepository.update).not.toHaveBeenCalled();
    });

    it('should return an ERROR transaction directly without checking the gateway', async () => {
      const errorTransaction = new Transaction({
        id: 'txn-3',
        customerId: 'cust-1',
        productId: 'prod-1',
        deliveryId: 'del-1',
        quantity: 1,
        productAmount: 50000,
        baseFee: 500000,
        deliveryFee: 1000000,
        totalAmount: 1550000,
        status: 'ERROR',
        errorMessage: 'Gateway timeout',
      });
      transactionRepository.findById.mockResolvedValue(errorTransaction);

      const result = await useCase.execute('txn-3');

      expect(result.isSuccess).toBe(true);
      expect(result.value.status).toBe('ERROR');
      expect(paymentGateway.getTransaction).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // PENDING WITHOUT businessTransactionId
  // ========================================================================

  describe('PENDING without businessTransactionId', () => {
    it('should return the PENDING transaction as-is when it has no businessTransactionId', async () => {
      const pendingTransaction = new Transaction({
        id: 'txn-4',
        customerId: 'cust-1',
        productId: 'prod-1',
        deliveryId: 'del-1',
        quantity: 1,
        productAmount: 50000,
        baseFee: 500000,
        deliveryFee: 1000000,
        totalAmount: 1550000,
        status: 'PENDING',
        // No businessTransactionId
      });
      transactionRepository.findById.mockResolvedValue(pendingTransaction);

      const result = await useCase.execute('txn-4');

      expect(result.isSuccess).toBe(true);
      expect(result.value.status).toBe('PENDING');
      expect(paymentGateway.getTransaction).not.toHaveBeenCalled();
      expect(transactionRepository.update).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // PENDING WITH businessTransactionId - APPROVED by gateway
  // ========================================================================

  describe('PENDING with businessTransactionId - gateway returns APPROVED', () => {
    it('should update the transaction to APPROVED and decrease product stock', async () => {
      const pendingTransaction = new Transaction({
        id: 'txn-5',
        customerId: 'cust-1',
        productId: 'prod-1',
        deliveryId: 'del-1',
        quantity: 2,
        productAmount: 100000,
        baseFee: 500000,
        deliveryFee: 1000000,
        totalAmount: 1600000,
        status: 'PENDING',
        businessTransactionId: 'biz-txn-005',
      });
      transactionRepository.findById.mockResolvedValue(pendingTransaction);

      paymentGateway.getTransaction.mockResolvedValue(
        Result.ok({
          transactionId: 'biz-txn-005',
          reference: 'REF-005',
          status: 'APPROVED',
          statusMessage: 'Transaction approved',
          paymentMethodType: 'CARD',
          amountInCents: 160000000,
          currency: 'COP',
        }),
      );

      const product = new Product({
        id: 'prod-1',
        name: 'Test Product',
        description: 'Desc',
        price: 50000,
        stock: 10,
      });
      productRepository.findById.mockResolvedValue(product);
      productRepository.updateStock.mockResolvedValue(undefined);

      transactionRepository.update.mockImplementation(async (txn) => txn);

      const result = await useCase.execute('txn-5');

      expect(result.isSuccess).toBe(true);
      expect(result.value.status).toBe('APPROVED');

      // Verify gateway was consulted
      expect(paymentGateway.getTransaction).toHaveBeenCalledWith('biz-txn-005');

      // Verify stock was updated (10 - 2 = 8)
      expect(productRepository.findById).toHaveBeenCalledWith('prod-1');
      expect(productRepository.updateStock).toHaveBeenCalledWith('prod-1', 8);

      // Verify transaction was persisted
      expect(transactionRepository.update).toHaveBeenCalled();
    });

    it('should still approve the transaction even if the product is not found (stock update skipped)', async () => {
      const pendingTransaction = new Transaction({
        id: 'txn-6',
        customerId: 'cust-1',
        productId: 'prod-deleted',
        deliveryId: 'del-1',
        quantity: 1,
        productAmount: 50000,
        baseFee: 500000,
        deliveryFee: 1000000,
        totalAmount: 1550000,
        status: 'PENDING',
        businessTransactionId: 'biz-txn-006',
      });
      transactionRepository.findById.mockResolvedValue(pendingTransaction);

      paymentGateway.getTransaction.mockResolvedValue(
        Result.ok({
          transactionId: 'biz-txn-006',
          reference: 'REF-006',
          status: 'APPROVED',
          statusMessage: 'Transaction approved',
          paymentMethodType: 'CARD',
          amountInCents: 155000000,
          currency: 'COP',
        }),
      );

      productRepository.findById.mockResolvedValue(null);
      transactionRepository.update.mockImplementation(async (txn) => txn);

      const result = await useCase.execute('txn-6');

      expect(result.isSuccess).toBe(true);
      expect(result.value.status).toBe('APPROVED');
      expect(productRepository.findById).toHaveBeenCalledWith('prod-deleted');
      expect(productRepository.updateStock).not.toHaveBeenCalled();
      expect(transactionRepository.update).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // PENDING WITH businessTransactionId - DECLINED by gateway
  // ========================================================================

  describe('PENDING with businessTransactionId - gateway returns DECLINED', () => {
    it('should update the transaction to DECLINED', async () => {
      const pendingTransaction = new Transaction({
        id: 'txn-7',
        customerId: 'cust-1',
        productId: 'prod-1',
        deliveryId: 'del-1',
        quantity: 1,
        productAmount: 50000,
        baseFee: 500000,
        deliveryFee: 1000000,
        totalAmount: 1550000,
        status: 'PENDING',
        businessTransactionId: 'biz-txn-007',
      });
      transactionRepository.findById.mockResolvedValue(pendingTransaction);

      paymentGateway.getTransaction.mockResolvedValue(
        Result.ok({
          transactionId: 'biz-txn-007',
          reference: 'REF-007',
          status: 'DECLINED',
          statusMessage: 'Card rejected by bank',
          paymentMethodType: 'CARD',
          amountInCents: 155000000,
          currency: 'COP',
        }),
      );

      transactionRepository.update.mockImplementation(async (txn) => txn);

      const result = await useCase.execute('txn-7');

      expect(result.isSuccess).toBe(true);
      expect(result.value.status).toBe('DECLINED');
      expect(paymentGateway.getTransaction).toHaveBeenCalledWith('biz-txn-007');
      expect(productRepository.updateStock).not.toHaveBeenCalled();
      expect(transactionRepository.update).toHaveBeenCalled();
    });

    it('should use default decline message when statusMessage is not provided', async () => {
      const pendingTransaction = new Transaction({
        id: 'txn-8',
        customerId: 'cust-1',
        productId: 'prod-1',
        deliveryId: 'del-1',
        quantity: 1,
        productAmount: 50000,
        baseFee: 500000,
        deliveryFee: 1000000,
        totalAmount: 1550000,
        status: 'PENDING',
        businessTransactionId: 'biz-txn-008',
      });
      transactionRepository.findById.mockResolvedValue(pendingTransaction);

      paymentGateway.getTransaction.mockResolvedValue(
        Result.ok({
          transactionId: 'biz-txn-008',
          reference: 'REF-008',
          status: 'DECLINED',
          // no statusMessage
          paymentMethodType: 'CARD',
          amountInCents: 155000000,
          currency: 'COP',
        }),
      );

      transactionRepository.update.mockImplementation(async (txn) => {
        expect(txn.errorMessage).toBe('Payment declined by issuer');
        return txn;
      });

      const result = await useCase.execute('txn-8');

      expect(result.isSuccess).toBe(true);
      expect(result.value.status).toBe('DECLINED');
    });
  });

  // ========================================================================
  // PENDING WITH businessTransactionId - gateway fails
  // ========================================================================

  describe('PENDING with businessTransactionId - gateway call fails', () => {
    it('should return the transaction as-is when the gateway call fails', async () => {
      const pendingTransaction = new Transaction({
        id: 'txn-9',
        customerId: 'cust-1',
        productId: 'prod-1',
        deliveryId: 'del-1',
        quantity: 1,
        productAmount: 50000,
        baseFee: 500000,
        deliveryFee: 1000000,
        totalAmount: 1550000,
        status: 'PENDING',
        businessTransactionId: 'biz-txn-009',
      });
      transactionRepository.findById.mockResolvedValue(pendingTransaction);

      paymentGateway.getTransaction.mockResolvedValue(
        Result.fail(new Error('Gateway unreachable')),
      );

      const result = await useCase.execute('txn-9');

      expect(result.isSuccess).toBe(true);
      expect(result.value.status).toBe('PENDING');
      expect(paymentGateway.getTransaction).toHaveBeenCalledWith('biz-txn-009');
      expect(transactionRepository.update).not.toHaveBeenCalled();
      expect(productRepository.updateStock).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // PENDING WITH businessTransactionId - gateway returns still PENDING
  // ========================================================================

  describe('PENDING with businessTransactionId - gateway returns PENDING', () => {
    it('should return the transaction as-is when the gateway still reports PENDING', async () => {
      const pendingTransaction = new Transaction({
        id: 'txn-10',
        customerId: 'cust-1',
        productId: 'prod-1',
        deliveryId: 'del-1',
        quantity: 1,
        productAmount: 50000,
        baseFee: 500000,
        deliveryFee: 1000000,
        totalAmount: 1550000,
        status: 'PENDING',
        businessTransactionId: 'biz-txn-010',
      });
      transactionRepository.findById.mockResolvedValue(pendingTransaction);

      paymentGateway.getTransaction.mockResolvedValue(
        Result.ok({
          transactionId: 'biz-txn-010',
          reference: 'REF-010',
          status: 'PENDING',
          statusMessage: 'Still processing',
          paymentMethodType: 'CARD',
          amountInCents: 155000000,
          currency: 'COP',
        }),
      );

      const result = await useCase.execute('txn-10');

      expect(result.isSuccess).toBe(true);
      expect(result.value.status).toBe('PENDING');
      expect(paymentGateway.getTransaction).toHaveBeenCalledWith('biz-txn-010');
      // Since status is still PENDING, no update should happen
      expect(transactionRepository.update).not.toHaveBeenCalled();
      expect(productRepository.updateStock).not.toHaveBeenCalled();
    });
  });
});
