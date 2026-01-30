import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { CustomerOrmEntity } from './customer.orm-entity';
import { DeliveryOrmEntity } from './delivery.orm-entity';
import { ProductOrmEntity } from './product.orm-entity';

@Entity('transactions')
export class TransactionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @Column({ type: 'uuid', name: 'delivery_id', nullable: true })
  deliveryId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'product_amount' })
  productAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'base_fee' })
  baseFee: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'delivery_fee' })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'business_transaction_id',
  })
  businessTransactionId: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'business_reference',
  })
  businessReference: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'payment_method',
  })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 4, nullable: true, name: 'card_last_four' })
  cardLastFour: string;

  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => CustomerOrmEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerOrmEntity;

  @ManyToOne(() => ProductOrmEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductOrmEntity;

  @ManyToOne(() => DeliveryOrmEntity)
  @JoinColumn({ name: 'delivery_id' })
  delivery: DeliveryOrmEntity;
}
