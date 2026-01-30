import { NotFoundException } from '@nestjs/common';
import { Product } from '../../../domain/entities/product.entity';
import { Result } from '../../../shared/result';
import { ProductsController } from './products.controller';

describe('ProductsController', () => {
  let controller: ProductsController;
  let mockGetProductsUseCase: { execute: jest.Mock };
  let mockGetProductByIdUseCase: { execute: jest.Mock };

  beforeEach(() => {
    mockGetProductsUseCase = { execute: jest.fn() };
    mockGetProductByIdUseCase = { execute: jest.fn() };

    controller = new ProductsController(
      mockGetProductsUseCase as any,
      mockGetProductByIdUseCase as any,
    );
  });

  describe('findAll', () => {
    it('should return success with an array of products when use case succeeds', async () => {
      const now = new Date();
      const products = [
        new Product({
          id: 'prod-1',
          name: 'Product A',
          description: 'Description A',
          price: 10000,
          stock: 5,
          imageUrl: 'http://img.test/a.png',
          createdAt: now,
          updatedAt: now,
        }),
        new Product({
          id: 'prod-2',
          name: 'Product B',
          description: 'Description B',
          price: 25000,
          stock: 10,
          imageUrl: 'http://img.test/b.png',
          createdAt: now,
          updatedAt: now,
        }),
      ];

      mockGetProductsUseCase.execute.mockResolvedValue(Result.ok(products));

      const result = await controller.findAll();

      expect(result).toEqual({
        success: true,
        data: products.map((p) => p.toJSON()),
      });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('prod-1');
      expect(result.data[1].id).toBe('prod-2');
      expect(mockGetProductsUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return success with an empty array when no products exist', async () => {
      mockGetProductsUseCase.execute.mockResolvedValue(Result.ok([]));

      const result = await controller.findAll();

      expect(result).toEqual({ success: true, data: [] });
      expect(result.data).toHaveLength(0);
    });

    it('should throw the error from result when use case fails', async () => {
      const error = new Error('Database connection failed');
      mockGetProductsUseCase.execute.mockResolvedValue(Result.fail(error));

      await expect(controller.findAll()).rejects.toThrow('Database connection failed');
      expect(mockGetProductsUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return success with the product data when use case succeeds', async () => {
      const now = new Date();
      const product = new Product({
        id: 'prod-1',
        name: 'Product A',
        description: 'Description A',
        price: 15000,
        stock: 3,
        imageUrl: 'http://img.test/a.png',
        createdAt: now,
        updatedAt: now,
      });

      mockGetProductByIdUseCase.execute.mockResolvedValue(Result.ok(product));

      const result = await controller.findOne('prod-1');

      expect(result).toEqual({
        success: true,
        data: product.toJSON(),
      });
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('prod-1');
      expect(result.data.name).toBe('Product A');
      expect(result.data.price).toBe(15000);
      expect(mockGetProductByIdUseCase.execute).toHaveBeenCalledWith('prod-1');
    });

    it('should throw NotFoundException when use case returns failure', async () => {
      const error = new Error('Product with id not-exist not found');
      mockGetProductByIdUseCase.execute.mockResolvedValue(Result.fail(error));

      await expect(controller.findOne('not-exist')).rejects.toThrow(NotFoundException);
      expect(mockGetProductByIdUseCase.execute).toHaveBeenCalledWith('not-exist');
    });

    it('should pass the id parameter to the use case', async () => {
      const product = new Product({
        id: 'uuid-123',
        name: 'Test',
        description: 'Test desc',
        price: 100,
        stock: 1,
      });
      mockGetProductByIdUseCase.execute.mockResolvedValue(Result.ok(product));

      await controller.findOne('uuid-123');

      expect(mockGetProductByIdUseCase.execute).toHaveBeenCalledWith('uuid-123');
      expect(mockGetProductByIdUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });
});
