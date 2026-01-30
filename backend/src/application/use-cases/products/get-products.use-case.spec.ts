import { Product } from '../../../domain/entities/product.entity';
import type { ProductRepositoryPort } from '../../../domain/ports/outbound/product.repository.port';
import { GetProductsUseCase } from './get-products.use-case';

describe('GetProductsUseCase', () => {
  let useCase: GetProductsUseCase;
  let productRepository: jest.Mocked<ProductRepositoryPort>;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    productRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIdWithLock: jest.fn(),
      save: jest.fn(),
      updateStock: jest.fn(),
    };

    useCase = new GetProductsUseCase(productRepository);
  });

  it('should return a list of products on success', async () => {
    const products = [
      new Product({ id: 'prod-1', name: 'Product 1', description: 'Desc 1', price: 50000, stock: 10 }),
      new Product({ id: 'prod-2', name: 'Product 2', description: 'Desc 2', price: 75000, stock: 5 }),
    ];
    productRepository.findAll.mockResolvedValue(products);

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.value).toHaveLength(2);
    expect(result.value[0].id).toBe('prod-1');
    expect(result.value[1].id).toBe('prod-2');
    expect(productRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return an empty array when there are no products', async () => {
    productRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual([]);
    expect(result.value).toHaveLength(0);
    expect(productRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return a failure result when the repository throws an Error', async () => {
    const error = new Error('Database connection failed');
    productRepository.findAll.mockRejectedValue(error);

    const result = await useCase.execute();

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe(error);
    expect(result.error.message).toBe('Database connection failed');
    expect(productRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should wrap non-Error thrown values in a generic Error', async () => {
    productRepository.findAll.mockRejectedValue('string error');

    const result = await useCase.execute();

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error.message).toBe('Failed to get products');
  });
});
