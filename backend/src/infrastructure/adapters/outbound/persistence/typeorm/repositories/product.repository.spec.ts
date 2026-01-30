/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../../../../../domain/entities/product.entity';
import { ProductOrmEntity } from '../entities/product.orm-entity';
import { ProductMapper } from '../mappers/product.mapper';
import { ProductRepository } from './product.repository';

describe('ProductRepository', () => {
  let repository: ProductRepository;
  let ormRepository: Repository<ProductOrmEntity>;

  const mockProductEntity: ProductOrmEntity = {
    id: 'product-1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100000,
    stock: 10,
    imageUrl: 'https://example.com/image.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockProduct: Product = {
    id: 'product-1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100000,
    stock: 10,
    imageUrl: 'https://example.com/image.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockOrmRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        {
          provide: getRepositoryToken(ProductOrmEntity),
          useValue: mockOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<ProductRepository>(ProductRepository);
    ormRepository = module.get<Repository<ProductOrmEntity>>(
      getRepositoryToken(ProductOrmEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all products ordered by createdAt DESC', async () => {
      const mockEntities = [mockProductEntity];
      mockOrmRepository.find.mockResolvedValue(mockEntities);

      const result = await repository.findAll();

      expect(ormRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(ProductMapper.toDomain(mockProductEntity));
    });

    it('should return empty array when no products exist', async () => {
      mockOrmRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('should map multiple products correctly', async () => {
      const mockEntities = [
        mockProductEntity,
        { ...mockProductEntity, id: 'product-2', name: 'Product 2' },
      ];
      mockOrmRepository.find.mockResolvedValue(mockEntities);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('product-1');
      expect(result[1].id).toBe('product-2');
    });
  });

  describe('findById', () => {
    it('should return a product when found', async () => {
      mockOrmRepository.findOne.mockResolvedValue(mockProductEntity);

      const result = await repository.findById('product-1');

      expect(ormRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'product-1' },
      });
      expect(result).toEqual(ProductMapper.toDomain(mockProductEntity));
    });

    it('should return null when product not found', async () => {
      mockOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });

    it('should handle different product ids', async () => {
      mockOrmRepository.findOne.mockResolvedValue(mockProductEntity);

      await repository.findById('test-id-123');

      expect(ormRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
      });
    });
  });

  describe('findByIdWithLock', () => {
    it('should return product with pessimistic write lock', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        setLock: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockProductEntity),
      };

      mockOrmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await repository.findByIdWithLock('product-1');

      expect(ormRepository.createQueryBuilder).toHaveBeenCalledWith('product');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('product.id = :id', {
        id: 'product-1',
      });
      expect(mockQueryBuilder.setLock).toHaveBeenCalledWith(
        'pessimistic_write',
      );
      expect(result).toEqual(ProductMapper.toDomain(mockProductEntity));
    });

    it('should return null when product not found with lock', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        setLock: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockOrmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await repository.findByIdWithLock('non-existent');

      expect(result).toBeNull();
    });

    it('should apply correct lock parameters', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        setLock: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockProductEntity),
      };

      mockOrmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await repository.findByIdWithLock('product-1');

      expect(mockQueryBuilder.setLock).toHaveBeenCalledWith(
        'pessimistic_write',
      );
    });
  });

  describe('save', () => {
    it('should save a new product', async () => {
      mockOrmRepository.save.mockResolvedValue(mockProductEntity);

      const result = await repository.save(mockProduct);

      expect(ormRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockProduct.id,
          name: mockProduct.name,
          price: mockProduct.price,
        }),
      );
      expect(result).toEqual(ProductMapper.toDomain(mockProductEntity));
    });

    it('should update an existing product', async () => {
      const updatedProduct = {
        ...mockProduct,
        name: 'Updated Product',
        stock: 20,
      };
      const updatedEntity = {
        ...mockProductEntity,
        name: 'Updated Product',
        stock: 20,
      };

      mockOrmRepository.save.mockResolvedValue(updatedEntity);

      const result = await repository.save(updatedProduct);

      expect(result.name).toBe('Updated Product');
      expect(result.stock).toBe(20);
    });

    it('should handle product with all fields', async () => {
      mockOrmRepository.save.mockResolvedValue(mockProductEntity);

      const result = await repository.save(mockProduct);

      expect(result.id).toBe(mockProduct.id);
      expect(result.name).toBe(mockProduct.name);
      expect(result.description).toBe(mockProduct.description);
      expect(result.price).toBe(mockProduct.price);
      expect(result.stock).toBe(mockProduct.stock);
      expect(result.imageUrl).toBe(mockProduct.imageUrl);
    });
  });

  describe('updateStock', () => {
    it('should update product stock', async () => {
      mockOrmRepository.update.mockResolvedValue({ affected: 1 });

      await repository.updateStock('product-1', 15);

      expect(ormRepository.update).toHaveBeenCalledWith('product-1', {
        stock: 15,
      });
    });

    it('should handle zero stock update', async () => {
      mockOrmRepository.update.mockResolvedValue({ affected: 1 });

      await repository.updateStock('product-1', 0);

      expect(ormRepository.update).toHaveBeenCalledWith('product-1', {
        stock: 0,
      });
    });

    it('should handle large stock update', async () => {
      mockOrmRepository.update.mockResolvedValue({ affected: 1 });

      await repository.updateStock('product-1', 1000);

      expect(ormRepository.update).toHaveBeenCalledWith('product-1', {
        stock: 1000,
      });
    });

    it('should not throw when updating non-existent product', async () => {
      mockOrmRepository.update.mockResolvedValue({ affected: 0 });

      await expect(
        repository.updateStock('non-existent', 10),
      ).resolves.not.toThrow();
    });
  });
});
