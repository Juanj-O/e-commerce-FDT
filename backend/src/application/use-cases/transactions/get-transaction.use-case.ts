import { Inject, Injectable, Logger } from '@nestjs/common';
import { Transaction } from '../../../domain/entities/transaction.entity';
import type { PaymentGatewayPort } from '../../../domain/ports/outbound/payment-gateway.port';
import { PAYMENT_GATEWAY } from '../../../domain/ports/outbound/payment-gateway.port';
import type { ProductRepositoryPort } from '../../../domain/ports/outbound/product.repository.port';
import { PRODUCT_REPOSITORY } from '../../../domain/ports/outbound/product.repository.port';
import type { TransactionRepositoryPort } from '../../../domain/ports/outbound/transaction.repository.port';
import { TRANSACTION_REPOSITORY } from '../../../domain/ports/outbound/transaction.repository.port';
import { Result } from '../../../shared/result';

@Injectable()
export class GetTransactionUseCase {
  private readonly logger = new Logger(GetTransactionUseCase.name);

  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGatewayPort,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Transaction, Error>> {
    let transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      return Result.fail(new Error(`Transaction with id ${id} not found`));
    }

    // Si la transacción está PENDING y tiene businessTransactionId, consultar el estado actual
    if (transaction.status === 'PENDING' && transaction.businessTransactionId) {
      this.logger.log(`Transaction ${id} is PENDING, checking status with Business...`);
      
      const businessResult = await this.paymentGateway.getTransaction(transaction.businessTransactionId);
      
      if (businessResult.isSuccess) {
        const businessStatus = businessResult.value.status;
        this.logger.log(`Business status for ${transaction.businessTransactionId}: ${businessStatus}`);
        
        // Actualizar estado según Business
        if (businessStatus === 'APPROVED' && transaction.status === 'PENDING') {
          transaction.approve(transaction.businessTransactionId, businessResult.value.reference);
          
          // Actualizar stock del producto
          const product = await this.productRepository.findById(transaction.productId);
          if (product) {
            const newStock = product.stock - transaction.quantity;
            await this.productRepository.updateStock(transaction.productId, newStock);
            this.logger.log(`Stock updated for product ${transaction.productId}: ${product.stock} -> ${newStock}`);
          }
          
          transaction = await this.transactionRepository.update(transaction);
          this.logger.log(`Transaction ${id} updated to APPROVED and stock decremented`);
          
        } else if (businessStatus === 'DECLINED' && transaction.status === 'PENDING') {
          transaction.decline(businessResult.value.statusMessage || 'Payment declined by issuer');
          transaction = await this.transactionRepository.update(transaction);
          this.logger.log(`Transaction ${id} updated to DECLINED`);
        }
      }
    }

    return Result.ok(transaction);
  }
}
