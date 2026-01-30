import { Customer, CustomerProps } from './customer.entity';

describe('Customer', () => {
  const baseProps: CustomerProps = {
    id: 'cust-001',
    email: 'john@example.com',
    fullName: 'John Doe',
    phone: '+573001234567',
    createdAt: new Date('2025-01-01T00:00:00Z'),
  };

  describe('constructor', () => {
    it('should create a customer with all properties provided', () => {
      const customer = new Customer(baseProps);
      expect(customer.id).toBe('cust-001');
      expect(customer.email).toBe('john@example.com');
      expect(customer.fullName).toBe('John Doe');
      expect(customer.phone).toBe('+573001234567');
      expect(customer.createdAt).toEqual(new Date('2025-01-01T00:00:00Z'));
    });

    it('should default id to empty string when not provided', () => {
      const customer = new Customer({
        email: 'test@test.com',
        fullName: 'Test User',
      });
      expect(customer.id).toBe('');
    });

    it('should default createdAt to a Date when not provided', () => {
      const before = new Date();
      const customer = new Customer({
        email: 'test@test.com',
        fullName: 'Test User',
      });
      const after = new Date();
      expect(customer.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(customer.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should allow phone to be undefined', () => {
      const customer = new Customer({
        email: 'test@test.com',
        fullName: 'Test User',
      });
      expect(customer.phone).toBeUndefined();
    });

    it('should create a customer with only required fields', () => {
      const customer = new Customer({
        email: 'minimal@test.com',
        fullName: 'Minimal User',
      });
      expect(customer.id).toBe('');
      expect(customer.email).toBe('minimal@test.com');
      expect(customer.fullName).toBe('Minimal User');
      expect(customer.phone).toBeUndefined();
      expect(customer.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('getters', () => {
    let customer: Customer;

    beforeEach(() => {
      customer = new Customer(baseProps);
    });

    it('should return the id', () => {
      expect(customer.id).toBe('cust-001');
    });

    it('should return the email', () => {
      expect(customer.email).toBe('john@example.com');
    });

    it('should return the fullName', () => {
      expect(customer.fullName).toBe('John Doe');
    });

    it('should return the phone', () => {
      expect(customer.phone).toBe('+573001234567');
    });

    it('should return the createdAt', () => {
      expect(customer.createdAt).toEqual(new Date('2025-01-01T00:00:00Z'));
    });
  });

  describe('toJSON', () => {
    it('should return a plain object with all properties', () => {
      const customer = new Customer(baseProps);
      const json = customer.toJSON();
      expect(json).toEqual({
        id: 'cust-001',
        email: 'john@example.com',
        fullName: 'John Doe',
        phone: '+573001234567',
        createdAt: new Date('2025-01-01T00:00:00Z'),
      });
    });

    it('should return undefined phone when not set', () => {
      const customer = new Customer({
        email: 'test@test.com',
        fullName: 'Test User',
      });
      const json = customer.toJSON();
      expect(json.phone).toBeUndefined();
    });

    it('should return empty string id when not set', () => {
      const customer = new Customer({
        email: 'test@test.com',
        fullName: 'Test User',
      });
      const json = customer.toJSON();
      expect(json.id).toBe('');
    });

    it('should return a new object each time toJSON is called', () => {
      const customer = new Customer(baseProps);
      const json1 = customer.toJSON();
      const json2 = customer.toJSON();
      expect(json1).toEqual(json2);
      expect(json1).not.toBe(json2);
    });

    it('should include all fields in the JSON output', () => {
      const customer = new Customer(baseProps);
      const json = customer.toJSON();
      expect(Object.keys(json)).toEqual(
        expect.arrayContaining(['id', 'email', 'fullName', 'phone', 'createdAt']),
      );
      expect(Object.keys(json)).toHaveLength(5);
    });
  });
});
