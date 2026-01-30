import { Product } from '../../../../../../domain/entities/product.entity';
import { ProductMapper } from './product.mapper';

describe('ProductMapper', () => {
  const now = new Date('2025-01-15T10:00:00.000Z');
  const updatedAt = new Date('2025-01-16T12:00:00.000Z');

  describe('toDomain', () => {
    it('should map an ORM entity to a domain Product with all fields', () => {
      const ormEntity = {
        id: 'prod-uuid-1',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with USB receiver',
        price: '49990.50' as any, // decimal columns come as strings from PostgreSQL
        stock: 25,
        imageUrl: 'http://images.test/mouse.png',
        createdAt: now,
        updatedAt: updatedAt,
      };

      const product = ProductMapper.toDomain(ormEntity as any);

      expect(product).toBeInstanceOf(Product);
      expect(product.id).toBe('prod-uuid-1');
      expect(product.name).toBe('Wireless Mouse');
      expect(product.description).toBe('Ergonomic wireless mouse with USB receiver');
      expect(product.price).toBe(49990.5);
      expect(typeof product.price).toBe('number');
      expect(product.stock).toBe(25);
      expect(product.imageUrl).toBe('http://images.test/mouse.png');
      expect(product.createdAt).toBe(now);
      expect(product.updatedAt).toBe(updatedAt);
    });

    it('should convert price from string to number using Number()', () => {
      const ormEntity = {
        id: 'prod-uuid-2',
        name: 'Keyboard',
        description: 'Mechanical keyboard',
        price: '120000.99' as any,
        stock: 10,
        imageUrl: null,
        createdAt: now,
        updatedAt: now,
      };

      const product = ProductMapper.toDomain(ormEntity as any);

      expect(product.price).toBe(120000.99);
      expect(typeof product.price).toBe('number');
    });

    it('should handle integer price values', () => {
      const ormEntity = {
        id: 'prod-uuid-3',
        name: 'Cable',
        description: 'USB-C cable',
        price: 15000,
        stock: 100,
        imageUrl: undefined,
        createdAt: now,
        updatedAt: now,
      };

      const product = ProductMapper.toDomain(ormEntity as any);

      expect(product.price).toBe(15000);
      expect(typeof product.price).toBe('number');
    });
  });

  describe('toOrm', () => {
    it('should map a domain Product to a partial ORM entity with all fields', () => {
      const product = new Product({
        id: 'prod-uuid-1',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with USB receiver',
        price: 49990.5,
        stock: 25,
        imageUrl: 'http://images.test/mouse.png',
        createdAt: now,
        updatedAt: updatedAt,
      });

      const ormPartial = ProductMapper.toOrm(product);

      expect(ormPartial.id).toBe('prod-uuid-1');
      expect(ormPartial.name).toBe('Wireless Mouse');
      expect(ormPartial.description).toBe('Ergonomic wireless mouse with USB receiver');
      expect(ormPartial.price).toBe(49990.5);
      expect(ormPartial.stock).toBe(25);
      expect(ormPartial.imageUrl).toBe('http://images.test/mouse.png');
    });

    it('should return undefined for id when domain entity has an empty string id', () => {
      const product = new Product({
        name: 'New Product',
        description: 'A brand new product',
        price: 30000,
        stock: 50,
      });

      const ormPartial = ProductMapper.toOrm(product);

      expect(ormPartial.id).toBeUndefined();
      expect(ormPartial.name).toBe('New Product');
      expect(ormPartial.description).toBe('A brand new product');
      expect(ormPartial.price).toBe(30000);
      expect(ormPartial.stock).toBe(50);
    });

    it('should not include createdAt or updatedAt in the ORM partial', () => {
      const product = new Product({
        id: 'prod-uuid-1',
        name: 'Test Product',
        description: 'Test description',
        price: 10000,
        stock: 5,
        createdAt: now,
        updatedAt: updatedAt,
      });

      const ormPartial = ProductMapper.toOrm(product);

      expect(ormPartial).not.toHaveProperty('createdAt');
      expect(ormPartial).not.toHaveProperty('updatedAt');
    });

    it('should preserve imageUrl when it is undefined', () => {
      const product = new Product({
        id: 'prod-uuid-4',
        name: 'No Image Product',
        description: 'Product without image',
        price: 5000,
        stock: 10,
      });

      const ormPartial = ProductMapper.toOrm(product);

      expect(ormPartial.imageUrl).toBeUndefined();
    });
  });
});
