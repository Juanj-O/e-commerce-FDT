import { Customer } from '../../../../../../domain/entities/customer.entity';
import { CustomerMapper } from './customer.mapper';

describe('CustomerMapper', () => {
  const now = new Date('2025-01-15T10:00:00.000Z');

  describe('toDomain', () => {
    it('should map an ORM entity to a domain Customer with all fields', () => {
      const ormEntity = {
        id: 'cust-uuid-1',
        email: 'john@example.com',
        fullName: 'John Doe',
        phone: '+573001234567',
        createdAt: now,
      };

      const customer = CustomerMapper.toDomain(ormEntity as any);

      expect(customer).toBeInstanceOf(Customer);
      expect(customer.id).toBe('cust-uuid-1');
      expect(customer.email).toBe('john@example.com');
      expect(customer.fullName).toBe('John Doe');
      expect(customer.phone).toBe('+573001234567');
      expect(customer.createdAt).toBe(now);
    });

    it('should handle null phone value', () => {
      const ormEntity = {
        id: 'cust-uuid-2',
        email: 'jane@example.com',
        fullName: 'Jane Smith',
        phone: null,
        createdAt: now,
      };

      const customer = CustomerMapper.toDomain(ormEntity as any);

      expect(customer).toBeInstanceOf(Customer);
      expect(customer.id).toBe('cust-uuid-2');
      expect(customer.email).toBe('jane@example.com');
      expect(customer.fullName).toBe('Jane Smith');
      expect(customer.phone).toBeNull();
    });

    it('should preserve the createdAt date from the ORM entity', () => {
      const specificDate = new Date('2024-06-20T15:30:00.000Z');
      const ormEntity = {
        id: 'cust-uuid-3',
        email: 'test@example.com',
        fullName: 'Test User',
        phone: '+573009876543',
        createdAt: specificDate,
      };

      const customer = CustomerMapper.toDomain(ormEntity as any);

      expect(customer.createdAt).toBe(specificDate);
    });
  });

  describe('toOrm', () => {
    it('should map a domain Customer to a partial ORM entity with all fields', () => {
      const customer = new Customer({
        id: 'cust-uuid-1',
        email: 'john@example.com',
        fullName: 'John Doe',
        phone: '+573001234567',
        createdAt: now,
      });

      const ormPartial = CustomerMapper.toOrm(customer);

      expect(ormPartial.id).toBe('cust-uuid-1');
      expect(ormPartial.email).toBe('john@example.com');
      expect(ormPartial.fullName).toBe('John Doe');
      expect(ormPartial.phone).toBe('+573001234567');
    });

    it('should return undefined for id when domain entity has an empty string id', () => {
      const customer = new Customer({
        email: 'new@example.com',
        fullName: 'New User',
        phone: '+573005555555',
      });

      const ormPartial = CustomerMapper.toOrm(customer);

      expect(ormPartial.id).toBeUndefined();
      expect(ormPartial.email).toBe('new@example.com');
      expect(ormPartial.fullName).toBe('New User');
      expect(ormPartial.phone).toBe('+573005555555');
    });

    it('should not include createdAt in the ORM partial', () => {
      const customer = new Customer({
        id: 'cust-uuid-1',
        email: 'john@example.com',
        fullName: 'John Doe',
        phone: '+573001234567',
        createdAt: now,
      });

      const ormPartial = CustomerMapper.toOrm(customer);

      expect(ormPartial).not.toHaveProperty('createdAt');
    });

    it('should handle undefined phone in domain entity', () => {
      const customer = new Customer({
        id: 'cust-uuid-4',
        email: 'nophone@example.com',
        fullName: 'No Phone User',
      });

      const ormPartial = CustomerMapper.toOrm(customer);

      expect(ormPartial.id).toBe('cust-uuid-4');
      expect(ormPartial.email).toBe('nophone@example.com');
      expect(ormPartial.fullName).toBe('No Phone User');
      expect(ormPartial.phone).toBeUndefined();
    });
  });
});
