import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { Customer } from '../../../domain/entities/customer.entity';
import { Delivery } from '../../../domain/entities/delivery.entity';
import { Product } from '../../../domain/entities/product.entity';
import { Transaction } from '../../../domain/entities/transaction.entity';
import {
    InsufficientStockException,
    ProductNotFoundException,
} from '../../../domain/exceptions/domain.exception';
import type { CustomerRepositoryPort } from '../../../domain/ports/outbound/customer.repository.port';
import { CUSTOMER_REPOSITORY } from '../../../domain/ports/outbound/customer.repository.port';
import type { DeliveryRepositoryPort } from '../../../domain/ports/outbound/delivery.repository.port';
import { DELIVERY_REPOSITORY } from '../../../domain/ports/outbound/delivery.repository.port';
import type { PaymentGatewayPort } from '../../../domain/ports/outbound/payment-gateway.port';
import { PAYMENT_GATEWAY } from '../../../domain/ports/outbound/payment-gateway.port';
import type { ProductRepositoryPort } from '../../../domain/ports/outbound/product.repository.port';
import { PRODUCT_REPOSITORY } from '../../../domain/ports/outbound/product.repository.port';
import type { TransactionRepositoryPort } from '../../../domain/ports/outbound/transaction.repository.port';
import { TRANSACTION_REPOSITORY } from '../../../domain/ports/outbound/transaction.repository.port';
import { Result } from '../../../shared/result';
import { CreateTransactionDto } from '../../dtos/create-transaction.dto';

export interface ProcessPaymentResult {
  transaction: Transaction;
  customer: Customer;
  delivery: Delivery;
}

/**
 * Process Payment Use Case - Railway Oriented Programming
 * Each step returns a Result, allowing for clean error handling without exceptions
 */
@Injectable()
export class ProcessPaymentUseCase {
  private readonly logger = new Logger(ProcessPaymentUseCase.name);
  private readonly baseFee: number;
  private readonly deliveryFee: number;

  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGatewayPort,
    private readonly configService: ConfigService,
  ) {
    this.baseFee = Number(this.configService.get('BASE_FEE', 500000));
    this.deliveryFee = Number(this.configService.get('DELIVERY_FEE', 1000000));
    
    console.log('⚙️  [USE CASE] Fees configurados:', {
      baseFee: this.baseFee,
      deliveryFee: this.deliveryFee,
      baseFeeType: typeof this.baseFee,
      deliveryFeeType: typeof this.deliveryFee
    });
  }

  /**
   * Execute the payment flow using Railway Oriented Programming
   * Each step is chained and will short-circuit on failure
   */
  async execute(
    dto: CreateTransactionDto,
  ): Promise<Result<ProcessPaymentResult, Error>> {
    this.logger.log(`Starting payment process for product ${dto.productId}`);

    // Step 1: Validate product exists and has sufficient stock
    const productResult = await this.validateProduct(dto.productId, dto.quantity);
    if (productResult.isFailure) {
      return Result.fail(productResult.error);
    }
    const product = productResult.value;

    // Step 2: Create or retrieve customer
    const customerResult = await this.ensureCustomer(dto.customer);
    if (customerResult.isFailure) {
      return Result.fail(customerResult.error);
    }
    const customer = customerResult.value;

    // Step 3: Create delivery record
    const deliveryResult = await this.createDelivery(customer.id, dto.delivery);
    if (deliveryResult.isFailure) {
      return Result.fail(deliveryResult.error);
    }
    const delivery = deliveryResult.value;

    // Step 4: Calculate amounts
    const amounts = this.calculateAmounts(product.price, dto.quantity);
    
    console.log('💰 [USE CASE] Montos calculados:');
    console.log({
      productPrice: product.price,
      quantity: dto.quantity,
      productAmount: amounts.productAmount,
      baseFee: amounts.baseFee,
      deliveryFee: amounts.deliveryFee,
      totalAmount: amounts.totalAmount,
      amountInCents: Math.round(amounts.totalAmount * 100)
    });

    // Step 5: Create pending transaction
    const transactionResult = await this.createPendingTransaction(
      customer.id,
      product.id,
      delivery.id,
      dto.quantity,
      amounts,
    );
    if (transactionResult.isFailure) {
      return Result.fail(transactionResult.error);
    }
    let transaction = transactionResult.value;

    // Step 6: Get Business acceptance token
    const acceptanceResult = await this.paymentGateway.getAcceptanceToken();
    if (acceptanceResult.isFailure) {
      transaction = await this.markTransactionError(transaction, acceptanceResult.error.message);
      return Result.fail(acceptanceResult.error);
    }

    // Step 7: Tokenize credit card
    const tokenResult = await this.paymentGateway.tokenizeCard({
      number: dto.card.number,
      cvc: dto.card.cvc,
      expMonth: dto.card.expMonth,
      expYear: dto.card.expYear,
      cardHolder: dto.card.cardHolder,
    });
    if (tokenResult.isFailure) {
      transaction = await this.markTransactionError(transaction, tokenResult.error.message);
      return Result.fail(tokenResult.error);
    }
    const cardToken = tokenResult.value;

    // Step 8: Process payment with Business
    const reference = `TXN-${uuidv4().substring(0, 8).toUpperCase()}`;
    const paymentRequest = {
      amountInCents: Math.round(amounts.totalAmount * 100),
      currency: 'COP',
      customerEmail: customer.email,
      reference,
      paymentMethod: {
        type: 'CARD',
        token: cardToken.token,
        installments: dto.installments || 1,
      },
      customerData: {
        fullName: customer.fullName,
        phoneNumber: customer.phone,
      },
    };
    
    console.log('📤 [USE CASE] Enviando a Business Gateway:');
    console.log(JSON.stringify(paymentRequest, null, 2));
    console.log('Acceptance Token:', acceptanceResult.value.acceptanceToken);
    
    const paymentResult = await this.paymentGateway.createPayment(
      paymentRequest,
      acceptanceResult.value.acceptanceToken,
    );

    if (paymentResult.isFailure) {
      transaction = await this.markTransactionError(transaction, paymentResult.error.message);
      return Result.fail(paymentResult.error);
    }

    const payment = paymentResult.value;

    // Step 9: Update transaction based on payment status
    transaction.setPaymentDetails('CARD', cardToken.lastFour, payment.transactionId);

    if (payment.status === 'APPROVED') {
      transaction.approve(payment.transactionId, payment.reference);
      // Update stock
      await this.productRepository.updateStock(product.id, product.stock - dto.quantity);
      this.logger.log(`Payment approved for transaction ${transaction.id}`);
    } else if (payment.status === 'DECLINED') {
      transaction.decline(payment.statusMessage || 'Payment declined by issuer');
      this.logger.warn(`Payment declined for transaction ${transaction.id}`);
    } else {
      // PENDING status - will be updated via webhook
      this.logger.log(`Payment pending for transaction ${transaction.id}`);
    }

    transaction = await this.transactionRepository.update(transaction);

    return Result.ok({
      transaction,
      customer,
      delivery,
    });
  }

  private async validateProduct(
    productId: string,
    quantity: number,
  ): Promise<Result<Product, Error>> {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      return Result.fail(new ProductNotFoundException(productId));
    }

    if (!product.hasStock(quantity)) {
      return Result.fail(
        new InsufficientStockException(productId, quantity, product.stock),
      );
    }

    return Result.ok(product);
  }

  private async ensureCustomer(
    customerData: CreateTransactionDto['customer'],
  ): Promise<Result<Customer, Error>> {
    try {
      let customer = await this.customerRepository.findByEmail(customerData.email);

      if (!customer) {
        customer = await this.customerRepository.save(
          new Customer({
            email: customerData.email,
            fullName: customerData.fullName,
            phone: customerData.phone,
          }),
        );
        this.logger.log(`Created new customer ${customer.id}`);
      }

      return Result.ok(customer);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to create customer'),
      );
    }
  }

  private async createDelivery(
    customerId: string,
    deliveryData: CreateTransactionDto['delivery'],
  ): Promise<Result<Delivery, Error>> {
    try {
      const delivery = await this.deliveryRepository.save(
        new Delivery({
          customerId,
          address: deliveryData.address,
          city: deliveryData.city,
          department: deliveryData.department,
          zipCode: deliveryData.zipCode,
        }),
      );

      return Result.ok(delivery);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to create delivery'),
      );
    }
  }

  private calculateAmounts(
    productPrice: number,
    quantity: number,
  ): { productAmount: number; baseFee: number; deliveryFee: number; totalAmount: number } {
    const productAmount = productPrice * quantity;
    const totalAmount = productAmount + this.baseFee + this.deliveryFee;

    return {
      productAmount,
      baseFee: this.baseFee,
      deliveryFee: this.deliveryFee,
      totalAmount,
    };
  }

  private async createPendingTransaction(
    customerId: string,
    productId: string,
    deliveryId: string,
    quantity: number,
    amounts: { productAmount: number; baseFee: number; deliveryFee: number; totalAmount: number },
  ): Promise<Result<Transaction, Error>> {
    try {
      const transaction = new Transaction({
        customerId,
        productId,
        deliveryId,
        quantity,
        productAmount: amounts.productAmount,
        baseFee: amounts.baseFee,
        deliveryFee: amounts.deliveryFee,
        totalAmount: amounts.totalAmount,
        status: 'PENDING',
      });

      const saved = await this.transactionRepository.save(transaction);
      this.logger.log(`Created pending transaction ${saved.id}`);

      return Result.ok(saved);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to create transaction'),
      );
    }
  }

  private async markTransactionError(
    transaction: Transaction,
    errorMessage: string,
  ): Promise<Transaction> {
    transaction.setError(errorMessage);
    const updated = await this.transactionRepository.update(transaction);
    this.logger.error(`Transaction ${transaction.id} marked as error: ${errorMessage}`);
    return updated;
  }
}
