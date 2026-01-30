import { ConfigService } from '@nestjs/config';
import { Customer } from '../../../domain/entities/customer.entity';
import { Delivery } from '../../../domain/entities/delivery.entity';
import { Product } from '../../../domain/entities/product.entity';
import { Transaction } from '../../../domain/entities/transaction.entity';
import {
  InsufficientStockException,
  ProductNotFoundException,
} from '../../../domain/exceptions/domain.exception';
import type { CustomerRepositoryPort } from '../../../domain/ports/outbound/customer.repository.port';
import type { DeliveryRepositoryPort } from '../../../domain/ports/outbound/delivery.repository.port';
import type { PaymentGatewayPort } from '../../../domain/ports/outbound/payment-gateway.port';
import type { ProductRepositoryPort } from '../../../domain/ports/outbound/product.repository.port';
import type { TransactionRepositoryPort } from '../../../domain/ports/outbound/transaction.repository.port';
import { Result } from '../../../shared/result';
import type { CreateTransactionDto } from '../../dtos/create-transaction.dto';
import { ProcessPaymentUseCase } from './process-payment.use-case';

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;
  let productRepository: jest.Mocked<ProductRepositoryPort>;
  let customerRepository: jest.Mocked<CustomerRepositoryPort>;
  let deliveryRepository: jest.Mocked<DeliveryRepositoryPort>;
  let transactionRepository: jest.Mocked<TransactionRepositoryPort>;
  let paymentGateway: jest.Mocked<PaymentGatewayPort>;
  let configService: jest.Mocked<ConfigService>;

  const mockProduct = new Product({
    id: 'prod-1',
    name: 'Test Product',
    description: 'A test product',
    price: 50000,
    stock: 10,
  });

  const mockCustomer = new Customer({
    id: 'cust-1',
    email: 'test@test.com',
    fullName: 'Test User',
    phone: '+57300',
  });

  const mockDelivery = new Delivery({
    id: 'del-1',
    customerId: 'cust-1',
    address: 'Calle 1',
    city: 'Bogota',
    department: 'Cundinamarca',
  });

  const mockTransaction = new Transaction({
    id: 'txn-1',
    customerId: 'cust-1',
    productId: 'prod-1',
    deliveryId: 'del-1',
    quantity: 1,
    productAmount: 50000,
    baseFee: 500000,
    deliveryFee: 1000000,
    totalAmount: 1550000,
    status: 'PENDING',
  });

  const mockDto: CreateTransactionDto = {
    productId: 'prod-1',
    quantity: 1,
    customer: {
      email: 'test@test.com',
      fullName: 'Test User',
      phone: '+57300',
    },
    delivery: {
      address: 'Calle 1',
      city: 'Bogota',
      department: 'Cundinamarca',
    },
    card: {
      number: '4242424242424242',
      cvc: '123',
      expMonth: '12',
      expYear: '28',
      cardHolder: 'TEST USER',
    },
    installments: 1,
  };

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    productRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIdWithLock: jest.fn(),
      save: jest.fn(),
      updateStock: jest.fn(),
    };

    customerRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    deliveryRepository = {
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      save: jest.fn(),
    };

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

    configService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        if (key === 'BASE_FEE') return 500000;
        if (key === 'DELIVERY_FEE') return 1000000;
        return defaultValue;
      }),
    } as any;

    useCase = new ProcessPaymentUseCase(
      productRepository,
      customerRepository,
      deliveryRepository,
      transactionRepository,
      paymentGateway,
      configService,
    );
  });

  /**
   * Helper to set up all mocks for a successful payment flow.
   * Individual tests can override specific mocks after calling this.
   */
  function setupHappyPath() {
    productRepository.findById.mockResolvedValue(mockProduct);
    customerRepository.findByEmail.mockResolvedValue(null);
    customerRepository.save.mockResolvedValue(mockCustomer);
    deliveryRepository.save.mockResolvedValue(mockDelivery);
    transactionRepository.save.mockResolvedValue(mockTransaction);
    transactionRepository.update.mockImplementation(async (txn) => txn);
    productRepository.updateStock.mockResolvedValue(undefined);
    paymentGateway.getAcceptanceToken.mockResolvedValue(
      Result.ok({ acceptanceToken: 'acceptance-token-123', permalink: 'https://example.com', type: 'END_USER_POLICY' }),
    );
    paymentGateway.tokenizeCard.mockResolvedValue(
      Result.ok({ token: 'card-token-123', brand: 'VISA', lastFour: '4242', expiresAt: '2028-12-01' }),
    );
    paymentGateway.createPayment.mockResolvedValue(
      Result.ok({
        transactionId: 'biz-txn-001',
        reference: 'REF-001',
        status: 'APPROVED',
        statusMessage: 'Transaction approved',
        paymentMethodType: 'CARD',
        amountInCents: 155000000,
        currency: 'COP',
      }),
    );
  }

  // ========================================================================
  // HAPPY PATH
  // ========================================================================

  describe('Happy path - APPROVED payment', () => {
    it('should process the entire payment flow and return an approved transaction', async () => {
      setupHappyPath();

      const result = await useCase.execute(mockDto);

      expect(result.isSuccess).toBe(true);
      const value = result.value;
      expect(value.transaction).toBeDefined();
      expect(value.customer).toBeDefined();
      expect(value.delivery).toBeDefined();

      // Verify the full flow was executed in order
      expect(productRepository.findById).toHaveBeenCalledWith('prod-1');
      expect(customerRepository.findByEmail).toHaveBeenCalledWith('test@test.com');
      expect(customerRepository.save).toHaveBeenCalled();
      expect(deliveryRepository.save).toHaveBeenCalled();
      expect(transactionRepository.save).toHaveBeenCalled();
      expect(paymentGateway.getAcceptanceToken).toHaveBeenCalled();
      expect(paymentGateway.tokenizeCard).toHaveBeenCalledWith({
        number: '4242424242424242',
        cvc: '123',
        expMonth: '12',
        expYear: '28',
        cardHolder: 'TEST USER',
      });
      expect(paymentGateway.createPayment).toHaveBeenCalled();
      expect(productRepository.updateStock).toHaveBeenCalledWith('prod-1', 9);
      expect(transactionRepository.update).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // DECLINED PAYMENT
  // ========================================================================

  describe('Payment DECLINED', () => {
    it('should mark the transaction as declined when payment is declined', async () => {
      setupHappyPath();
      paymentGateway.createPayment.mockResolvedValue(
        Result.ok({
          transactionId: 'biz-txn-002',
          reference: 'REF-002',
          status: 'DECLINED',
          statusMessage: 'Insufficient funds',
          paymentMethodType: 'CARD',
          amountInCents: 155000000,
          currency: 'COP',
        }),
      );

      const result = await useCase.execute(mockDto);

      expect(result.isSuccess).toBe(true);
      expect(productRepository.updateStock).not.toHaveBeenCalled();
      expect(transactionRepository.update).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // PENDING PAYMENT
  // ========================================================================

  describe('Payment PENDING', () => {
    it('should leave the transaction as pending when payment status is pending', async () => {
      setupHappyPath();
      paymentGateway.createPayment.mockResolvedValue(
        Result.ok({
          transactionId: 'biz-txn-003',
          reference: 'REF-003',
          status: 'PENDING',
          statusMessage: 'Waiting for confirmation',
          paymentMethodType: 'CARD',
          amountInCents: 155000000,
          currency: 'COP',
        }),
      );

      const result = await useCase.execute(mockDto);

      expect(result.isSuccess).toBe(true);
      expect(productRepository.updateStock).not.toHaveBeenCalled();
      expect(transactionRepository.update).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // PRODUCT VALIDATION FAILURES
  // ========================================================================

  describe('Product validation failures', () => {
    it('should fail with ProductNotFoundException when product does not exist', async () => {
      productRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(mockDto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(ProductNotFoundException);
      expect(result.error.message).toContain('prod-1');
      // Should not proceed past validation
      expect(customerRepository.findByEmail).not.toHaveBeenCalled();
      expect(transactionRepository.save).not.toHaveBeenCalled();
    });

    it('should fail with InsufficientStockException when stock is insufficient', async () => {
      const lowStockProduct = new Product({
        id: 'prod-1',
        name: 'Test Product',
        description: 'A test product',
        price: 50000,
        stock: 0,
      });
      productRepository.findById.mockResolvedValue(lowStockProduct);

      const result = await useCase.execute(mockDto);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InsufficientStockException);
      expect(result.error.message).toContain('Insufficient stock');
      expect(customerRepository.findByEmail).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // CUSTOMER CREATION FAILURES
  // ========================================================================

  describe('Customer creation failures', () => {
    it('should fail when customer creation throws an error', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      customerRepository.findByEmail.mockResolvedValue(null);
      customerRepository.save.mockRejectedValue(new Error('Customer save failed'));

      const result = await useCase.execute(mockDto);

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('Customer save failed');
      expect(deliveryRepository.save).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // EXISTING CUSTOMER (ensureCustomer reuses)
  // ========================================================================

  describe('Existing customer', () => {
    it('should reuse an existing customer found by email without creating a new one', async () => {
      setupHappyPath();
      customerRepository.findByEmail.mockResolvedValue(mockCustomer);

      const result = await useCase.execute(mockDto);

      expect(result.isSuccess).toBe(true);
      expect(customerRepository.findByEmail).toHaveBeenCalledWith('test@test.com');
      expect(customerRepository.save).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // DELIVERY CREATION FAILURES
  // ========================================================================

  describe('Delivery creation failures', () => {
    it('should fail when delivery creation throws an error', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      customerRepository.findByEmail.mockResolvedValue(mockCustomer);
      deliveryRepository.save.mockRejectedValue(new Error('Delivery save failed'));

      const result = await useCase.execute(mockDto);

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('Delivery save failed');
      expect(transactionRepository.save).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // TRANSACTION CREATION FAILURES
  // ========================================================================

  describe('Transaction creation failures', () => {
    it('should fail when transaction creation throws an error', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      customerRepository.findByEmail.mockResolvedValue(mockCustomer);
      deliveryRepository.save.mockResolvedValue(mockDelivery);
      transactionRepository.save.mockRejectedValue(new Error('Transaction save failed'));

      const result = await useCase.execute(mockDto);

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('Transaction save failed');
      expect(paymentGateway.getAcceptanceToken).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // ACCEPTANCE TOKEN FAILURE
  // ========================================================================

  describe('Acceptance token failure', () => {
    it('should mark the transaction as error when acceptance token retrieval fails', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      customerRepository.findByEmail.mockResolvedValue(mockCustomer);
      deliveryRepository.save.mockResolvedValue(mockDelivery);
      transactionRepository.save.mockResolvedValue(mockTransaction);
      transactionRepository.update.mockImplementation(async (txn) => txn);
      paymentGateway.getAcceptanceToken.mockResolvedValue(
        Result.fail(new Error('Failed to get acceptance token')),
      );

      const result = await useCase.execute(mockDto);

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('Failed to get acceptance token');
      expect(transactionRepository.update).toHaveBeenCalled();
      expect(paymentGateway.tokenizeCard).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // CARD TOKENIZATION FAILURE
  // ========================================================================

  describe('Card tokenization failure', () => {
    it('should mark the transaction as error when card tokenization fails', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      customerRepository.findByEmail.mockResolvedValue(mockCustomer);
      deliveryRepository.save.mockResolvedValue(mockDelivery);
      transactionRepository.save.mockResolvedValue(mockTransaction);
      transactionRepository.update.mockImplementation(async (txn) => txn);
      paymentGateway.getAcceptanceToken.mockResolvedValue(
        Result.ok({ acceptanceToken: 'acceptance-token-123', permalink: 'https://example.com', type: 'END_USER_POLICY' }),
      );
      paymentGateway.tokenizeCard.mockResolvedValue(
        Result.fail(new Error('Invalid card number')),
      );

      const result = await useCase.execute(mockDto);

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('Invalid card number');
      expect(transactionRepository.update).toHaveBeenCalled();
      expect(paymentGateway.createPayment).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // PAYMENT GATEWAY FAILURE
  // ========================================================================

  describe('Payment gateway failure', () => {
    it('should mark the transaction as error when payment creation fails', async () => {
      productRepository.findById.mockResolvedValue(mockProduct);
      customerRepository.findByEmail.mockResolvedValue(mockCustomer);
      deliveryRepository.save.mockResolvedValue(mockDelivery);
      transactionRepository.save.mockResolvedValue(mockTransaction);
      transactionRepository.update.mockImplementation(async (txn) => txn);
      paymentGateway.getAcceptanceToken.mockResolvedValue(
        Result.ok({ acceptanceToken: 'acceptance-token-123', permalink: 'https://example.com', type: 'END_USER_POLICY' }),
      );
      paymentGateway.tokenizeCard.mockResolvedValue(
        Result.ok({ token: 'card-token-123', brand: 'VISA', lastFour: '4242', expiresAt: '2028-12-01' }),
      );
      paymentGateway.createPayment.mockResolvedValue(
        Result.fail(new Error('Payment gateway timeout')),
      );

      const result = await useCase.execute(mockDto);

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('Payment gateway timeout');
      expect(transactionRepository.update).toHaveBeenCalled();
      expect(productRepository.updateStock).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // AMOUNT CALCULATIONS
  // ========================================================================

  describe('Amount calculations', () => {
    it('should correctly calculate amounts with base and delivery fees', async () => {
      setupHappyPath();

      // Use a product with a specific price and quantity > 1
      const expensiveProduct = new Product({
        id: 'prod-1',
        name: 'Expensive Product',
        description: 'An expensive product',
        price: 100000,
        stock: 10,
      });
      productRepository.findById.mockResolvedValue(expensiveProduct);

      const dtoWithQuantity = { ...mockDto, quantity: 2 };

      // The transaction save should receive a transaction with the calculated amounts
      transactionRepository.save.mockImplementation(async (txn) => {
        // productAmount = 100000 * 2 = 200000
        // totalAmount = 200000 + 500000 + 1000000 = 1700000
        expect(txn.productAmount).toBe(200000);
        expect(txn.baseFee).toBe(500000);
        expect(txn.deliveryFee).toBe(1000000);
        expect(txn.totalAmount).toBe(1700000);
        return new Transaction({
          id: 'txn-calc',
          customerId: 'cust-1',
          productId: 'prod-1',
          deliveryId: 'del-1',
          quantity: 2,
          productAmount: 200000,
          baseFee: 500000,
          deliveryFee: 1000000,
          totalAmount: 1700000,
          status: 'PENDING',
        });
      });

      const result = await useCase.execute(dtoWithQuantity);

      expect(result.isSuccess).toBe(true);
      expect(transactionRepository.save).toHaveBeenCalled();
    });

    it('should send the correct amountInCents to the payment gateway', async () => {
      setupHappyPath();

      await useCase.execute(mockDto);

      // totalAmount = 50000 + 500000 + 1000000 = 1550000
      // amountInCents = Math.round(1550000 * 100) = 155000000
      expect(paymentGateway.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          amountInCents: 155000000,
          currency: 'COP',
          customerEmail: 'test@test.com',
        }),
        'acceptance-token-123',
      );
    });
  });

  // ========================================================================
  // PAYMENT DETAILS
  // ========================================================================

  describe('Payment details', () => {
    it('should set payment details on the transaction after successful payment', async () => {
      setupHappyPath();

      // Capture the transaction passed to update
      transactionRepository.update.mockImplementation(async (txn) => {
        expect(txn.paymentMethod).toBe('CARD');
        expect(txn.cardLastFour).toBe('4242');
        expect(txn.businessTransactionId).toBe('biz-txn-001');
        return txn;
      });

      const result = await useCase.execute(mockDto);

      expect(result.isSuccess).toBe(true);
      expect(transactionRepository.update).toHaveBeenCalled();
    });

    it('should pass installments from the DTO to the payment gateway', async () => {
      setupHappyPath();

      const dtoWithInstallments = { ...mockDto, installments: 3 };

      await useCase.execute(dtoWithInstallments);

      expect(paymentGateway.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: expect.objectContaining({
            installments: 3,
          }),
        }),
        'acceptance-token-123',
      );
    });

    it('should default installments to 1 when not provided', async () => {
      setupHappyPath();

      const dtoNoInstallments = { ...mockDto };
      delete (dtoNoInstallments as any).installments;

      await useCase.execute(dtoNoInstallments);

      expect(paymentGateway.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: expect.objectContaining({
            installments: 1,
          }),
        }),
        'acceptance-token-123',
      );
    });
  });

  // ========================================================================
  // STOCK UPDATE ON APPROVAL
  // ========================================================================

  describe('Stock update on approval', () => {
    it('should decrease stock by the ordered quantity when payment is approved', async () => {
      setupHappyPath();

      await useCase.execute(mockDto);

      // Original stock is 10, quantity is 1, so new stock = 9
      expect(productRepository.updateStock).toHaveBeenCalledWith('prod-1', 9);
    });

    it('should not update stock when payment is declined', async () => {
      setupHappyPath();
      paymentGateway.createPayment.mockResolvedValue(
        Result.ok({
          transactionId: 'biz-txn-declined',
          reference: 'REF-DEC',
          status: 'DECLINED',
          statusMessage: 'Card rejected',
          paymentMethodType: 'CARD',
          amountInCents: 155000000,
          currency: 'COP',
        }),
      );

      await useCase.execute(mockDto);

      expect(productRepository.updateStock).not.toHaveBeenCalled();
    });

    it('should not update stock when payment is pending', async () => {
      setupHappyPath();
      paymentGateway.createPayment.mockResolvedValue(
        Result.ok({
          transactionId: 'biz-txn-pending',
          reference: 'REF-PEND',
          status: 'PENDING',
          paymentMethodType: 'CARD',
          amountInCents: 155000000,
          currency: 'COP',
        }),
      );

      await useCase.execute(mockDto);

      expect(productRepository.updateStock).not.toHaveBeenCalled();
    });
  });
});
