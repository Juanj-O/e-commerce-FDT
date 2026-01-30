import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductOrmEntity } from '../adapters/outbound/persistence/typeorm/entities/product.orm-entity';
import { CustomerOrmEntity } from '../adapters/outbound/persistence/typeorm/entities/customer.orm-entity';
import { DeliveryOrmEntity } from '../adapters/outbound/persistence/typeorm/entities/delivery.orm-entity';
import { TransactionOrmEntity } from '../adapters/outbound/persistence/typeorm/entities/transaction.orm-entity';
import { ProductSeeder } from '../adapters/outbound/persistence/seeders/product.seeder';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USER', 'postgres'),
        password: configService.get<string>('DATABASE_PASSWORD', 'postgres123'),
        database: configService.get<string>('DATABASE_NAME', 'ecommerce'),
        entities: [
          ProductOrmEntity,
          CustomerOrmEntity,
          DeliveryOrmEntity,
          TransactionOrmEntity,
        ],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([ProductOrmEntity]),
  ],
  providers: [ProductSeeder],
  exports: [ProductSeeder],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private readonly productSeeder: ProductSeeder) {}

  async onModuleInit() {
    await this.productSeeder.seed();
  }
}
