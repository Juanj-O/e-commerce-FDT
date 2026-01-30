import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../../../../../domain/entities/customer.entity';
import { CustomerOrmEntity } from '../entities/customer.orm-entity';
import { CustomerMapper } from '../mappers/customer.mapper';
import { CustomerRepository } from './customer.repository';

describe('CustomerRepository', () => {
  let repository: CustomerRepository;
  let ormRepository: Repository<CustomerOrmEntity>;

  const mockCustomerEntity: CustomerOrmEntity = {
    id: 'customer-1',
    email: 'test@example.com',
    fullName: 'Test User',
    phone: '+57 300 123 4567',
    createdAt: new Date('2024-01-01'),
  };

  const mockCustomer = new Customer({
    id: 'customer-1',
    email: 'test@example.com',
    fullName: 'Test User',
    phone: '+57 300 123 4567',
    createdAt: new Date('2024-01-01'),
  });

  const mockOrmRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerRepository,
        {
          provide: getRepositoryToken(CustomerOrmEntity),
          useValue: mockOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<CustomerRepository>(CustomerRepository);
    ormRepository = module.get<Repository<CustomerOrmEntity>>(
      getRepositoryToken(CustomerOrmEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a customer when found', async () => {
      mockOrmRepository.findOne.mockResolvedValue(mockCustomerEntity);

      const result = await repository.findById('customer-1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(ormRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'customer-1' },
      });
      expect(result).toEqual(CustomerMapper.toDomain(mockCustomerEntity));
    });

    it('should return null when customer not found', async () => {
      mockOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });

    it('should handle different customer ids', async () => {
      mockOrmRepository.findOne.mockResolvedValue(mockCustomerEntity);

      await repository.findById('test-id-123');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(ormRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return a customer when found by email', async () => {
      mockOrmRepository.findOne.mockResolvedValue(mockCustomerEntity);

      const result = await repository.findByEmail('test@example.com');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(ormRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(CustomerMapper.toDomain(mockCustomerEntity));
    });

    it('should return null when customer not found by email', async () => {
      mockOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should handle case-sensitive email search', async () => {
      mockOrmRepository.findOne.mockResolvedValue(null);

      await repository.findByEmail('TEST@EXAMPLE.COM');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(ormRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'TEST@EXAMPLE.COM' },
      });
    });

    it('should handle email with special characters', async () => {
      const specialEmail = 'test+tag@example.co.uk';
      mockOrmRepository.findOne.mockResolvedValue({
        ...mockCustomerEntity,
        email: specialEmail,
      });

      const result = await repository.findByEmail(specialEmail);

      expect(result?.email).toBe(specialEmail);
    });
  });

  describe('save', () => {
    it('should save a new customer', async () => {
      mockOrmRepository.save.mockResolvedValue(mockCustomerEntity);

      const result = await repository.save(mockCustomer);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(ormRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockCustomer.id,
          email: mockCustomer.email,
          fullName: mockCustomer.fullName,
          phone: mockCustomer.phone,
        }),
      );
      expect(result).toEqual(CustomerMapper.toDomain(mockCustomerEntity));
    });

    it('should update an existing customer', async () => {
      const updatedCustomer = new Customer({
        id: mockCustomer.id,
        email: mockCustomer.email,
        fullName: 'Updated Name',
        phone: '+57 301 999 8888',
        createdAt: mockCustomer.createdAt,
      });
      const updatedEntity = {
        ...mockCustomerEntity,
        fullName: 'Updated Name',
        phone: '+57 301 999 8888',
      };

      mockOrmRepository.save.mockResolvedValue(updatedEntity);

      const result = await repository.save(updatedCustomer);

      expect(result.fullName).toBe('Updated Name');
      expect(result.phone).toBe('+57 301 999 8888');
    });

    it('should preserve customer email on update', async () => {
      mockOrmRepository.save.mockResolvedValue(mockCustomerEntity);

      const result = await repository.save(mockCustomer);

      expect(result.email).toBe(mockCustomer.email);
    });

    it('should handle customer with all fields', async () => {
      mockOrmRepository.save.mockResolvedValue(mockCustomerEntity);

      const result = await repository.save(mockCustomer);

      expect(result.id).toBe(mockCustomer.id);
      expect(result.email).toBe(mockCustomer.email);
      expect(result.fullName).toBe(mockCustomer.fullName);
      expect(result.phone).toBe(mockCustomer.phone);
      expect(result.createdAt).toEqual(mockCustomer.createdAt);
    });
  });
});
