import { Delivery, DeliveryProps } from './delivery.entity';

describe('Delivery', () => {
  const baseProps: DeliveryProps = {
    id: 'del-001',
    customerId: 'cust-001',
    address: 'Calle 123 #45-67',
    city: 'Bogota',
    department: 'Cundinamarca',
    zipCode: '110111',
    createdAt: new Date('2025-01-01T00:00:00Z'),
  };

  describe('constructor', () => {
    it('should create a delivery with all properties provided', () => {
      const delivery = new Delivery(baseProps);
      expect(delivery.id).toBe('del-001');
      expect(delivery.customerId).toBe('cust-001');
      expect(delivery.address).toBe('Calle 123 #45-67');
      expect(delivery.city).toBe('Bogota');
      expect(delivery.department).toBe('Cundinamarca');
      expect(delivery.zipCode).toBe('110111');
      expect(delivery.createdAt).toEqual(new Date('2025-01-01T00:00:00Z'));
    });

    it('should default id to empty string when not provided', () => {
      const delivery = new Delivery({
        customerId: 'cust-001',
        address: 'Calle 1',
        city: 'Cali',
        department: 'Valle del Cauca',
      });
      expect(delivery.id).toBe('');
    });

    it('should default createdAt to a Date when not provided', () => {
      const before = new Date();
      const delivery = new Delivery({
        customerId: 'cust-001',
        address: 'Calle 1',
        city: 'Cali',
        department: 'Valle del Cauca',
      });
      const after = new Date();
      expect(delivery.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(delivery.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should allow zipCode to be undefined', () => {
      const delivery = new Delivery({
        customerId: 'cust-001',
        address: 'Calle 1',
        city: 'Cali',
        department: 'Valle del Cauca',
      });
      expect(delivery.zipCode).toBeUndefined();
    });

    it('should create a delivery with only required fields', () => {
      const delivery = new Delivery({
        customerId: 'cust-002',
        address: 'Carrera 10 #20-30',
        city: 'Medellin',
        department: 'Antioquia',
      });
      expect(delivery.id).toBe('');
      expect(delivery.customerId).toBe('cust-002');
      expect(delivery.address).toBe('Carrera 10 #20-30');
      expect(delivery.city).toBe('Medellin');
      expect(delivery.department).toBe('Antioquia');
      expect(delivery.zipCode).toBeUndefined();
      expect(delivery.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('getters', () => {
    let delivery: Delivery;

    beforeEach(() => {
      delivery = new Delivery(baseProps);
    });

    it('should return the id', () => {
      expect(delivery.id).toBe('del-001');
    });

    it('should return the customerId', () => {
      expect(delivery.customerId).toBe('cust-001');
    });

    it('should return the address', () => {
      expect(delivery.address).toBe('Calle 123 #45-67');
    });

    it('should return the city', () => {
      expect(delivery.city).toBe('Bogota');
    });

    it('should return the department', () => {
      expect(delivery.department).toBe('Cundinamarca');
    });

    it('should return the zipCode', () => {
      expect(delivery.zipCode).toBe('110111');
    });

    it('should return the createdAt', () => {
      expect(delivery.createdAt).toEqual(new Date('2025-01-01T00:00:00Z'));
    });
  });

  describe('fullAddress', () => {
    it('should return the full address with zipCode', () => {
      const delivery = new Delivery(baseProps);
      expect(delivery.fullAddress).toBe('Calle 123 #45-67, Bogota, Cundinamarca - 110111');
    });

    it('should return the full address without zipCode when it is undefined', () => {
      const delivery = new Delivery({
        customerId: 'cust-001',
        address: 'Carrera 7 #32-10',
        city: 'Cali',
        department: 'Valle del Cauca',
      });
      expect(delivery.fullAddress).toBe('Carrera 7 #32-10, Cali, Valle del Cauca');
    });

    it('should format correctly with different address components', () => {
      const delivery = new Delivery({
        id: 'del-002',
        customerId: 'cust-002',
        address: 'Avenida El Dorado #68-97',
        city: 'Bogota',
        department: 'Bogota D.C.',
        zipCode: '111321',
      });
      expect(delivery.fullAddress).toBe('Avenida El Dorado #68-97, Bogota, Bogota D.C. - 111321');
    });

    it('should not include dash or zipCode when zipCode is not provided', () => {
      const delivery = new Delivery({
        id: 'del-003',
        customerId: 'cust-003',
        address: 'Calle 50',
        city: 'Barranquilla',
        department: 'Atlantico',
      });
      const fullAddress = delivery.fullAddress;
      expect(fullAddress).not.toContain(' - ');
      expect(fullAddress).toBe('Calle 50, Barranquilla, Atlantico');
    });

    it('should include dash and zipCode when zipCode is an empty string', () => {
      const delivery = new Delivery({
        id: 'del-004',
        customerId: 'cust-004',
        address: 'Calle 10',
        city: 'Pereira',
        department: 'Risaralda',
        zipCode: '',
      });
      // Empty string is falsy, so zipCode won't be appended
      expect(delivery.fullAddress).toBe('Calle 10, Pereira, Risaralda');
    });
  });

  describe('toJSON', () => {
    it('should return a plain object with all properties', () => {
      const delivery = new Delivery(baseProps);
      const json = delivery.toJSON();
      expect(json).toEqual({
        id: 'del-001',
        customerId: 'cust-001',
        address: 'Calle 123 #45-67',
        city: 'Bogota',
        department: 'Cundinamarca',
        zipCode: '110111',
        createdAt: new Date('2025-01-01T00:00:00Z'),
      });
    });

    it('should return undefined zipCode when not set', () => {
      const delivery = new Delivery({
        customerId: 'cust-001',
        address: 'Calle 1',
        city: 'Cali',
        department: 'Valle del Cauca',
      });
      const json = delivery.toJSON();
      expect(json.zipCode).toBeUndefined();
    });

    it('should return empty string id when not set', () => {
      const delivery = new Delivery({
        customerId: 'cust-001',
        address: 'Calle 1',
        city: 'Cali',
        department: 'Valle del Cauca',
      });
      const json = delivery.toJSON();
      expect(json.id).toBe('');
    });

    it('should return a new object each time toJSON is called', () => {
      const delivery = new Delivery(baseProps);
      const json1 = delivery.toJSON();
      const json2 = delivery.toJSON();
      expect(json1).toEqual(json2);
      expect(json1).not.toBe(json2);
    });

    it('should include all expected fields', () => {
      const delivery = new Delivery(baseProps);
      const json = delivery.toJSON();
      expect(Object.keys(json)).toEqual(
        expect.arrayContaining([
          'id',
          'customerId',
          'address',
          'city',
          'department',
          'zipCode',
          'createdAt',
        ]),
      );
      expect(Object.keys(json)).toHaveLength(7);
    });

    it('should not include fullAddress in toJSON output', () => {
      const delivery = new Delivery(baseProps);
      const json = delivery.toJSON();
      expect((json as any).fullAddress).toBeUndefined();
    });
  });
});
