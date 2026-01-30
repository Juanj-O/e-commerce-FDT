import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Delivery } from '../../../../../../domain/entities/delivery.entity';
import { DeliveryOrmEntity } from '../entities/delivery.orm-entity';
import { DeliveryRepository } from './delivery.repository';

describe('DeliveryRepository', () => {
  let repository: DeliveryRepository;

  const mockDelivery = new Delivery({
    id: 'delivery-uuid-1',
    customerId: 'customer-uuid-1',
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    department: 'Cundinamarca',
    zipCode: '110111',
    createdAt: new Date('2024-01-15'),
  });

  const mockDeliveryEntity: DeliveryOrmEntity = {
    id: 'delivery-uuid-1',
    customerId: 'customer-uuid-1',
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    department: 'Cundinamarca',
    zipCode: '110111',
    createdAt: new Date('2024-01-15'),
  } as DeliveryOrmEntity;

  const mockOrmRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryRepository,
        {
          provide: getRepositoryToken(DeliveryOrmEntity),
          useValue: mockOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<DeliveryRepository>(DeliveryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a delivery when found', async () => {
      mockOrmRepository.findOne.mockResolvedValue(mockDeliveryEntity);

      const result = await repository.findById('delivery-uuid-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('delivery-uuid-1');
      expect(result?.customerId).toBe('customer-uuid-1');
      expect(result?.address).toBe('Calle 123 #45-67');
      expect(result?.city).toBe('Bogotá');
      expect(result?.department).toBe('Cundinamarca');
    });

    it('should return null when delivery not found', async () => {
      mockOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });

    it('should handle different delivery ids', async () => {
      const anotherDelivery = { ...mockDeliveryEntity, id: 'delivery-uuid-2' };
      mockOrmRepository.findOne.mockResolvedValue(anotherDelivery);

      const result = await repository.findById('delivery-uuid-2');

      expect(result?.id).toBe('delivery-uuid-2');
    });
  });

  describe('findByCustomerId', () => {
    it('should return all deliveries for a customer', async () => {
      const delivery2 = {
        ...mockDeliveryEntity,
        id: 'delivery-uuid-2',
        address: 'Carrera 10 #20-30',
      };
      mockOrmRepository.find.mockResolvedValue([mockDeliveryEntity, delivery2]);

      const result = await repository.findByCustomerId('customer-uuid-1');

      expect(result).toHaveLength(2);
      expect(result[0].address).toBe('Calle 123 #45-67');
      expect(result[1].address).toBe('Carrera 10 #20-30');
    });

    it('should return empty array when no deliveries found', async () => {
      mockOrmRepository.find.mockResolvedValue([]);

      const result = await repository.findByCustomerId('customer-uuid-999');

      expect(result).toEqual([]);
    });

    it('should handle customer with single delivery', async () => {
      mockOrmRepository.find.mockResolvedValue([mockDeliveryEntity]);

      const result = await repository.findByCustomerId('customer-uuid-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('delivery-uuid-1');
    });
  });

  describe('save', () => {
    it('should save a new delivery', async () => {
      const newDelivery = new Delivery({
        customerId: 'customer-uuid-2',
        address: 'Avenida 68 #123-45',
        city: 'Medellín',
        department: 'Antioquia',
        zipCode: '050001',
      });

      const newEntity = {
        id: 'new-delivery-uuid',
        customerId: 'customer-uuid-2',
        address: 'Avenida 68 #123-45',
        city: 'Medellín',
        department: 'Antioquia',
        zipCode: '050001',
        createdAt: new Date(),
      };

      mockOrmRepository.save.mockResolvedValue(newEntity as DeliveryOrmEntity);

      const result = await repository.save(newDelivery);

      expect(result.customerId).toBe('customer-uuid-2');
      expect(result.city).toBe('Medellín');
      expect(result.department).toBe('Antioquia');
    });

    it('should update an existing delivery', async () => {
      const updatedDelivery = new Delivery({
        id: mockDelivery.id,
        customerId: mockDelivery.customerId,
        address: 'Nueva Dirección 456',
        city: mockDelivery.city,
        department: mockDelivery.department,
        zipCode: mockDelivery.zipCode,
        createdAt: mockDelivery.createdAt,
      });

      const updatedEntity = {
        ...mockDeliveryEntity,
        address: 'Nueva Dirección 456',
      };

      mockOrmRepository.save.mockResolvedValue(updatedEntity);

      const result = await repository.save(updatedDelivery);

      expect(result.address).toBe('Nueva Dirección 456');
      expect(result.id).toBe(mockDelivery.id);
    });

    it('should handle delivery without zipCode', async () => {
      const deliveryNoZip = new Delivery({
        customerId: 'customer-uuid-3',
        address: 'Calle Rural Sin Código',
        city: 'Villavicencio',
        department: 'Meta',
      });

      const entityNoZip = {
        id: 'delivery-no-zip',
        customerId: 'customer-uuid-3',
        address: 'Calle Rural Sin Código',
        city: 'Villavicencio',
        department: 'Meta',
        zipCode: undefined,
        createdAt: new Date(),
      };

      mockOrmRepository.save.mockResolvedValue(
        entityNoZip as unknown as DeliveryOrmEntity,
      );

      const result = await repository.save(deliveryNoZip);

      expect(result.zipCode).toBeUndefined();
      expect(result.city).toBe('Villavicencio');
    });

    it('should handle delivery with all fields', async () => {
      mockOrmRepository.save.mockResolvedValue(mockDeliveryEntity);

      const result = await repository.save(mockDelivery);

      expect(result.id).toBe(mockDelivery.id);
      expect(result.customerId).toBe(mockDelivery.customerId);
      expect(result.address).toBe(mockDelivery.address);
      expect(result.city).toBe(mockDelivery.city);
      expect(result.department).toBe(mockDelivery.department);
      expect(result.zipCode).toBe(mockDelivery.zipCode);
      expect(result.createdAt).toEqual(mockDelivery.createdAt);
    });
  });
});
