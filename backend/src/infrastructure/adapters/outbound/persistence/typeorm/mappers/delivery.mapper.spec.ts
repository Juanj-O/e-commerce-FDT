import { Delivery } from '../../../../../../domain/entities/delivery.entity';
import { DeliveryMapper } from './delivery.mapper';

describe('DeliveryMapper', () => {
  const now = new Date('2025-01-15T10:00:00.000Z');

  describe('toDomain', () => {
    it('should map an ORM entity to a domain Delivery with all fields', () => {
      const ormEntity = {
        id: 'del-uuid-1',
        customerId: 'cust-uuid-1',
        address: 'Calle 123 #45-67',
        city: 'Bogota',
        department: 'Cundinamarca',
        zipCode: '110111',
        createdAt: now,
      };

      const delivery = DeliveryMapper.toDomain(ormEntity as any);

      expect(delivery).toBeInstanceOf(Delivery);
      expect(delivery.id).toBe('del-uuid-1');
      expect(delivery.customerId).toBe('cust-uuid-1');
      expect(delivery.address).toBe('Calle 123 #45-67');
      expect(delivery.city).toBe('Bogota');
      expect(delivery.department).toBe('Cundinamarca');
      expect(delivery.zipCode).toBe('110111');
      expect(delivery.createdAt).toBe(now);
    });

    it('should handle null zipCode value', () => {
      const ormEntity = {
        id: 'del-uuid-2',
        customerId: 'cust-uuid-2',
        address: 'Carrera 10 #20-30',
        city: 'Medellin',
        department: 'Antioquia',
        zipCode: null,
        createdAt: now,
      };

      const delivery = DeliveryMapper.toDomain(ormEntity as any);

      expect(delivery).toBeInstanceOf(Delivery);
      expect(delivery.id).toBe('del-uuid-2');
      expect(delivery.address).toBe('Carrera 10 #20-30');
      expect(delivery.city).toBe('Medellin');
      expect(delivery.department).toBe('Antioquia');
      expect(delivery.zipCode).toBeNull();
    });

    it('should preserve the createdAt date from the ORM entity', () => {
      const specificDate = new Date('2024-12-25T08:00:00.000Z');
      const ormEntity = {
        id: 'del-uuid-3',
        customerId: 'cust-uuid-3',
        address: 'Avenida 5 #15-25',
        city: 'Cali',
        department: 'Valle del Cauca',
        zipCode: '760001',
        createdAt: specificDate,
      };

      const delivery = DeliveryMapper.toDomain(ormEntity as any);

      expect(delivery.createdAt).toBe(specificDate);
    });
  });

  describe('toOrm', () => {
    it('should map a domain Delivery to a partial ORM entity with all fields', () => {
      const delivery = new Delivery({
        id: 'del-uuid-1',
        customerId: 'cust-uuid-1',
        address: 'Calle 123 #45-67',
        city: 'Bogota',
        department: 'Cundinamarca',
        zipCode: '110111',
        createdAt: now,
      });

      const ormPartial = DeliveryMapper.toOrm(delivery);

      expect(ormPartial.id).toBe('del-uuid-1');
      expect(ormPartial.customerId).toBe('cust-uuid-1');
      expect(ormPartial.address).toBe('Calle 123 #45-67');
      expect(ormPartial.city).toBe('Bogota');
      expect(ormPartial.department).toBe('Cundinamarca');
      expect(ormPartial.zipCode).toBe('110111');
    });

    it('should return undefined for id when domain entity has an empty string id', () => {
      const delivery = new Delivery({
        customerId: 'cust-uuid-1',
        address: 'New Address 100',
        city: 'Barranquilla',
        department: 'Atlantico',
        zipCode: '080001',
      });

      const ormPartial = DeliveryMapper.toOrm(delivery);

      expect(ormPartial.id).toBeUndefined();
      expect(ormPartial.customerId).toBe('cust-uuid-1');
      expect(ormPartial.address).toBe('New Address 100');
      expect(ormPartial.city).toBe('Barranquilla');
      expect(ormPartial.department).toBe('Atlantico');
      expect(ormPartial.zipCode).toBe('080001');
    });

    it('should not include createdAt in the ORM partial', () => {
      const delivery = new Delivery({
        id: 'del-uuid-1',
        customerId: 'cust-uuid-1',
        address: 'Calle 123 #45-67',
        city: 'Bogota',
        department: 'Cundinamarca',
        zipCode: '110111',
        createdAt: now,
      });

      const ormPartial = DeliveryMapper.toOrm(delivery);

      expect(ormPartial).not.toHaveProperty('createdAt');
    });

    it('should handle undefined zipCode in domain entity', () => {
      const delivery = new Delivery({
        id: 'del-uuid-4',
        customerId: 'cust-uuid-4',
        address: 'Transversal 50 #30-10',
        city: 'Cartagena',
        department: 'Bolivar',
      });

      const ormPartial = DeliveryMapper.toOrm(delivery);

      expect(ormPartial.id).toBe('del-uuid-4');
      expect(ormPartial.customerId).toBe('cust-uuid-4');
      expect(ormPartial.address).toBe('Transversal 50 #30-10');
      expect(ormPartial.city).toBe('Cartagena');
      expect(ormPartial.department).toBe('Bolivar');
      expect(ormPartial.zipCode).toBeUndefined();
    });
  });
});
