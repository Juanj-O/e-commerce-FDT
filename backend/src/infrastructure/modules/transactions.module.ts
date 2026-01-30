import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetTransactionUseCase } from '../../application/use-cases/transactions/get-transaction.use-case';
import { ProcessPaymentUseCase } from '../../application/use-cases/transactions/process-payment.use-case';
import { CUSTOMER_REPOSITORY } from '../../domain/ports/outbound/customer.repository.port';
import { DELIVERY_REPOSITORY } from '../../domain/ports/outbound/delivery.repository.port';
import { PAYMENT_GATEWAY } from '../../domain/ports/outbound/payment-gateway.port';
import { PRODUCT_REPOSITORY } from '../../domain/ports/outbound/product.repository.port';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/outbound/transaction.repository.port';
import { TransactionsController } from '../adapters/inbound/transactions.controller';
import { BusinessAdapter } from '../adapters/outbound/external/business/business.adapter';
import { CustomerOrmEntity } from '../adapters/outbound/persistence/typeorm/entities/customer.orm-entity';
import { DeliveryOrmEntity } from '../adapters/outbound/persistence/typeorm/entities/delivery.orm-entity';
import { ProductOrmEntity } from '../adapters/outbound/persistence/typeorm/entities/product.orm-entity';
import { TransactionOrmEntity } from '../adapters/outbound/persistence/typeorm/entities/transaction.orm-entity';
import { CustomerRepository } from '../adapters/outbound/persistence/typeorm/repositories/customer.repository';
import { DeliveryRepository } from '../adapters/outbound/persistence/typeorm/repositories/delivery.repository';
import { ProductRepository } from '../adapters/outbound/persistence/typeorm/repositories/product.repository';
import { TransactionRepository } from '../adapters/outbound/persistence/typeorm/repositories/transaction.repository';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      TransactionOrmEntity,
      CustomerOrmEntity,
      DeliveryOrmEntity,
      ProductOrmEntity,
    ]),
  ],
  controllers: [TransactionsController],
  providers: [
    ProcessPaymentUseCase,
    GetTransactionUseCase,
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TransactionRepository,
    },
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: CustomerRepository,
    },
    {
      provide: DELIVERY_REPOSITORY,
      useClass: DeliveryRepository,
    },
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
    {
      provide: PAYMENT_GATEWAY,
      useClass: BusinessAdapter,
    },
  ],
  exports: [TRANSACTION_REPOSITORY],
})
export class TransactionsModule {}
