import { Delivery } from '../../entities/delivery.entity';

export interface DeliveryRepositoryPort {
  findById(id: string): Promise<Delivery | null>;
  findByCustomerId(customerId: string): Promise<Delivery[]>;
  save(delivery: Delivery): Promise<Delivery>;
}

export const DELIVERY_REPOSITORY = Symbol('DELIVERY_REPOSITORY');
