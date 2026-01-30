import { Product, ProductProps } from './product.entity';

describe('Product', () => {
  const baseProps: ProductProps = {
    id: 'prod-001',
    name: 'Test Product',
    description: 'A product for testing',
    price: 29.99,
    stock: 100,
    imageUrl: 'https://example.com/image.png',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-02T00:00:00Z'),
  };

  describe('constructor', () => {
    it('should create a product with all properties provided', () => {
      const product = new Product(baseProps);
      expect(product.id).toBe('prod-001');
      expect(product.name).toBe('Test Product');
      expect(product.description).toBe('A product for testing');
      expect(product.price).toBe(29.99);
      expect(product.stock).toBe(100);
      expect(product.imageUrl).toBe('https://example.com/image.png');
      expect(product.createdAt).toEqual(new Date('2025-01-01T00:00:00Z'));
      expect(product.updatedAt).toEqual(new Date('2025-01-02T00:00:00Z'));
    });

    it('should default id to empty string when not provided', () => {
      const product = new Product({
        name: 'No ID',
        description: 'desc',
        price: 10,
        stock: 5,
      });
      expect(product.id).toBe('');
    });

    it('should default createdAt to a Date when not provided', () => {
      const before = new Date();
      const product = new Product({
        name: 'No Dates',
        description: 'desc',
        price: 10,
        stock: 5,
      });
      const after = new Date();
      expect(product.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(product.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should default updatedAt to a Date when not provided', () => {
      const before = new Date();
      const product = new Product({
        name: 'No Dates',
        description: 'desc',
        price: 10,
        stock: 5,
      });
      const after = new Date();
      expect(product.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(product.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should allow imageUrl to be undefined', () => {
      const product = new Product({
        name: 'No Image',
        description: 'desc',
        price: 10,
        stock: 5,
      });
      expect(product.imageUrl).toBeUndefined();
    });
  });

  describe('getters', () => {
    let product: Product;

    beforeEach(() => {
      product = new Product(baseProps);
    });

    it('should return the id', () => {
      expect(product.id).toBe('prod-001');
    });

    it('should return the name', () => {
      expect(product.name).toBe('Test Product');
    });

    it('should return the description', () => {
      expect(product.description).toBe('A product for testing');
    });

    it('should return the price', () => {
      expect(product.price).toBe(29.99);
    });

    it('should return the stock', () => {
      expect(product.stock).toBe(100);
    });

    it('should return the imageUrl', () => {
      expect(product.imageUrl).toBe('https://example.com/image.png');
    });

    it('should return the createdAt', () => {
      expect(product.createdAt).toEqual(new Date('2025-01-01T00:00:00Z'));
    });

    it('should return the updatedAt', () => {
      expect(product.updatedAt).toEqual(new Date('2025-01-02T00:00:00Z'));
    });
  });

  describe('hasStock', () => {
    it('should return true when stock is greater than the requested quantity', () => {
      const product = new Product({ ...baseProps, stock: 10 });
      expect(product.hasStock(5)).toBe(true);
    });

    it('should return true when stock equals the requested quantity', () => {
      const product = new Product({ ...baseProps, stock: 10 });
      expect(product.hasStock(10)).toBe(true);
    });

    it('should return false when stock is less than the requested quantity', () => {
      const product = new Product({ ...baseProps, stock: 10 });
      expect(product.hasStock(11)).toBe(false);
    });

    it('should return true when requesting 0 quantity', () => {
      const product = new Product({ ...baseProps, stock: 0 });
      expect(product.hasStock(0)).toBe(true);
    });

    it('should return false when stock is 0 and requesting 1', () => {
      const product = new Product({ ...baseProps, stock: 0 });
      expect(product.hasStock(1)).toBe(false);
    });

    it('should return true when requesting 1 from stock of 1', () => {
      const product = new Product({ ...baseProps, stock: 1 });
      expect(product.hasStock(1)).toBe(true);
    });
  });

  describe('decreaseStock', () => {
    it('should decrease stock by the given quantity', () => {
      const product = new Product({ ...baseProps, stock: 50 });
      product.decreaseStock(10);
      expect(product.stock).toBe(40);
    });

    it('should decrease stock to zero when quantity equals stock', () => {
      const product = new Product({ ...baseProps, stock: 5 });
      product.decreaseStock(5);
      expect(product.stock).toBe(0);
    });

    it('should update updatedAt after decreasing stock', () => {
      const fixedDate = new Date('2020-01-01T00:00:00Z');
      const product = new Product({ ...baseProps, stock: 10, updatedAt: fixedDate });
      const beforeDecrease = new Date();
      product.decreaseStock(1);
      expect(product.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeDecrease.getTime());
    });

    it('should throw "Insufficient stock" when quantity exceeds stock', () => {
      const product = new Product({ ...baseProps, stock: 5 });
      expect(() => product.decreaseStock(6)).toThrow('Insufficient stock');
    });

    it('should throw "Insufficient stock" when stock is 0 and quantity is 1', () => {
      const product = new Product({ ...baseProps, stock: 0 });
      expect(() => product.decreaseStock(1)).toThrow('Insufficient stock');
    });

    it('should not modify stock when throwing insufficient stock error', () => {
      const product = new Product({ ...baseProps, stock: 5 });
      try {
        product.decreaseStock(10);
      } catch {
        // expected
      }
      expect(product.stock).toBe(5);
    });

    it('should allow decreasing stock multiple times', () => {
      const product = new Product({ ...baseProps, stock: 20 });
      product.decreaseStock(5);
      product.decreaseStock(5);
      product.decreaseStock(5);
      expect(product.stock).toBe(5);
    });

    it('should allow decreasing by 0 without error', () => {
      const product = new Product({ ...baseProps, stock: 10 });
      product.decreaseStock(0);
      expect(product.stock).toBe(10);
    });
  });

  describe('increaseStock', () => {
    it('should increase stock by the given quantity', () => {
      const product = new Product({ ...baseProps, stock: 10 });
      product.increaseStock(5);
      expect(product.stock).toBe(15);
    });

    it('should increase stock from zero', () => {
      const product = new Product({ ...baseProps, stock: 0 });
      product.increaseStock(20);
      expect(product.stock).toBe(20);
    });

    it('should update updatedAt after increasing stock', () => {
      const fixedDate = new Date('2020-01-01T00:00:00Z');
      const product = new Product({ ...baseProps, stock: 10, updatedAt: fixedDate });
      const beforeIncrease = new Date();
      product.increaseStock(5);
      expect(product.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeIncrease.getTime());
    });

    it('should allow increasing by 0', () => {
      const product = new Product({ ...baseProps, stock: 10 });
      product.increaseStock(0);
      expect(product.stock).toBe(10);
    });

    it('should allow increasing stock multiple times', () => {
      const product = new Product({ ...baseProps, stock: 0 });
      product.increaseStock(10);
      product.increaseStock(20);
      product.increaseStock(30);
      expect(product.stock).toBe(60);
    });
  });

  describe('toJSON', () => {
    it('should return a plain object with all properties', () => {
      const product = new Product(baseProps);
      const json = product.toJSON();
      expect(json).toEqual({
        id: 'prod-001',
        name: 'Test Product',
        description: 'A product for testing',
        price: 29.99,
        stock: 100,
        imageUrl: 'https://example.com/image.png',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-02T00:00:00Z'),
      });
    });

    it('should return undefined imageUrl when not set', () => {
      const product = new Product({
        name: 'No Image',
        description: 'desc',
        price: 10,
        stock: 5,
      });
      const json = product.toJSON();
      expect(json.imageUrl).toBeUndefined();
    });

    it('should reflect updated stock in toJSON', () => {
      const product = new Product({ ...baseProps, stock: 50 });
      product.decreaseStock(10);
      const json = product.toJSON();
      expect(json.stock).toBe(40);
    });

    it('should reflect updated updatedAt after stock change', () => {
      const fixedDate = new Date('2020-01-01T00:00:00Z');
      const product = new Product({ ...baseProps, updatedAt: fixedDate });
      product.increaseStock(1);
      const json = product.toJSON();
      expect(json.updatedAt.getTime()).toBeGreaterThan(fixedDate.getTime());
    });

    it('should return a new object each time toJSON is called', () => {
      const product = new Product(baseProps);
      const json1 = product.toJSON();
      const json2 = product.toJSON();
      expect(json1).toEqual(json2);
      expect(json1).not.toBe(json2);
    });
  });
});
