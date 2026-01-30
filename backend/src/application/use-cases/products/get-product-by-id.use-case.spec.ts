import { Product } from '../../../domain/entities/product.entity';
import { ProductNotFoundException } from '../../../domain/exceptions/domain.exception';
import type { ProductRepositoryPort } from '../../../domain/ports/outbound/product.repository.port';
import { GetProductByIdUseCase } from './get-product-by-id.use-case';

describe('GetProductByIdUseCase', () => {
  let useCase: GetProductByIdUseCase;
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

    useCase = new GetProductByIdUseCase(productRepository);
  });

  it('should return the product when found by id', async () => {
    const product = new Product({
      id: 'prod-1',
      name: 'Test Product',
      description: 'A test product',
      price: 50000,
      stock: 10,
    });
    productRepository.findById.mockResolvedValue(product);

    const result = await useCase.execute('prod-1');

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(product);
    expect(result.value.id).toBe('prod-1');
    expect(result.value.name).toBe('Test Product');
    expect(productRepository.findById).toHaveBeenCalledWith('prod-1');
    expect(productRepository.findById).toHaveBeenCalledTimes(1);
  });

  it('should return a failure with ProductNotFoundException when product is not found', async () => {
    productRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute('non-existent-id');

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(ProductNotFoundException);
    expect(result.error.message).toBe('Product with id non-existent-id not found');
    expect((result.error as ProductNotFoundException).code).toBe('PRODUCT_NOT_FOUND');
    expect(productRepository.findById).toHaveBeenCalledWith('non-existent-id');
  });

  it('should propagate repository errors', async () => {
    productRepository.findById.mockRejectedValue(new Error('DB error'));

    await expect(useCase.execute('prod-1')).rejects.toThrow('DB error');
    expect(productRepository.findById).toHaveBeenCalledWith('prod-1');
  });
});
