import { Transaction, TransactionProps, TransactionStatus } from './transaction.entity';

describe('Transaction', () => {
  const baseProps: TransactionProps = {
    id: 'txn-001',
    customerId: 'cust-001',
    productId: 'prod-001',
    deliveryId: 'del-001',
    quantity: 2,
    productAmount: 5000,
    baseFee: 500,
    deliveryFee: 1000,
    totalAmount: 6500,
    status: 'PENDING',
    businessTransactionId: undefined,
    businessReference: undefined,
    paymentMethod: undefined,
    cardLastFour: undefined,
    errorMessage: undefined,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-02T00:00:00Z'),
  };

  describe('constructor', () => {
    it('should create a transaction with all properties provided', () => {
      const txn = new Transaction(baseProps);
      expect(txn.id).toBe('txn-001');
      expect(txn.customerId).toBe('cust-001');
      expect(txn.productId).toBe('prod-001');
      expect(txn.deliveryId).toBe('del-001');
      expect(txn.quantity).toBe(2);
      expect(txn.productAmount).toBe(5000);
      expect(txn.baseFee).toBe(500);
      expect(txn.deliveryFee).toBe(1000);
      expect(txn.totalAmount).toBe(6500);
      expect(txn.status).toBe('PENDING');
      expect(txn.createdAt).toEqual(new Date('2025-01-01T00:00:00Z'));
      expect(txn.updatedAt).toEqual(new Date('2025-01-02T00:00:00Z'));
    });

    it('should default id to empty string when not provided', () => {
      const txn = new Transaction({
        customerId: 'cust-001',
        productId: 'prod-001',
        quantity: 1,
        productAmount: 1000,
        baseFee: 100,
        deliveryFee: 200,
        totalAmount: 1300,
      });
      expect(txn.id).toBe('');
    });

    it('should default status to PENDING when not provided', () => {
      const txn = new Transaction({
        customerId: 'cust-001',
        productId: 'prod-001',
        quantity: 1,
        productAmount: 1000,
        baseFee: 100,
        deliveryFee: 200,
        totalAmount: 1300,
      });
      expect(txn.status).toBe('PENDING');
    });

    it('should default createdAt to a Date when not provided', () => {
      const before = new Date();
      const txn = new Transaction({
        customerId: 'cust-001',
        productId: 'prod-001',
        quantity: 1,
        productAmount: 1000,
        baseFee: 100,
        deliveryFee: 200,
        totalAmount: 1300,
      });
      const after = new Date();
      expect(txn.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(txn.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should default updatedAt to a Date when not provided', () => {
      const before = new Date();
      const txn = new Transaction({
        customerId: 'cust-001',
        productId: 'prod-001',
        quantity: 1,
        productAmount: 1000,
        baseFee: 100,
        deliveryFee: 200,
        totalAmount: 1300,
      });
      const after = new Date();
      expect(txn.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(txn.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should accept a non-PENDING initial status', () => {
      const txn = new Transaction({ ...baseProps, status: 'APPROVED' });
      expect(txn.status).toBe('APPROVED');
    });

    it('should allow optional fields to be undefined', () => {
      const txn = new Transaction({
        customerId: 'cust-001',
        productId: 'prod-001',
        quantity: 1,
        productAmount: 1000,
        baseFee: 100,
        deliveryFee: 200,
        totalAmount: 1300,
      });
      expect(txn.deliveryId).toBeUndefined();
      expect(txn.businessTransactionId).toBeUndefined();
      expect(txn.businessReference).toBeUndefined();
      expect(txn.paymentMethod).toBeUndefined();
      expect(txn.cardLastFour).toBeUndefined();
      expect(txn.errorMessage).toBeUndefined();
    });
  });

  describe('getters', () => {
    let txn: Transaction;

    beforeEach(() => {
      txn = new Transaction(baseProps);
    });

    it('should return the id', () => {
      expect(txn.id).toBe('txn-001');
    });

    it('should return the customerId', () => {
      expect(txn.customerId).toBe('cust-001');
    });

    it('should return the productId', () => {
      expect(txn.productId).toBe('prod-001');
    });

    it('should return the deliveryId', () => {
      expect(txn.deliveryId).toBe('del-001');
    });

    it('should return the quantity', () => {
      expect(txn.quantity).toBe(2);
    });

    it('should return the productAmount', () => {
      expect(txn.productAmount).toBe(5000);
    });

    it('should return the baseFee', () => {
      expect(txn.baseFee).toBe(500);
    });

    it('should return the deliveryFee', () => {
      expect(txn.deliveryFee).toBe(1000);
    });

    it('should return the totalAmount', () => {
      expect(txn.totalAmount).toBe(6500);
    });

    it('should return the status', () => {
      expect(txn.status).toBe('PENDING');
    });

    it('should return the createdAt', () => {
      expect(txn.createdAt).toEqual(new Date('2025-01-01T00:00:00Z'));
    });

    it('should return the updatedAt', () => {
      expect(txn.updatedAt).toEqual(new Date('2025-01-02T00:00:00Z'));
    });

    it('should return businessTransactionId', () => {
      const txnWithBiz = new Transaction({
        ...baseProps,
        businessTransactionId: 'biz-123',
      });
      expect(txnWithBiz.businessTransactionId).toBe('biz-123');
    });

    it('should return businessReference', () => {
      const txnWithRef = new Transaction({
        ...baseProps,
        businessReference: 'ref-abc',
      });
      expect(txnWithRef.businessReference).toBe('ref-abc');
    });

    it('should return paymentMethod', () => {
      const txnWithPM = new Transaction({
        ...baseProps,
        paymentMethod: 'CARD',
      });
      expect(txnWithPM.paymentMethod).toBe('CARD');
    });

    it('should return cardLastFour', () => {
      const txnWithCard = new Transaction({
        ...baseProps,
        cardLastFour: '4242',
      });
      expect(txnWithCard.cardLastFour).toBe('4242');
    });

    it('should return errorMessage', () => {
      const txnWithErr = new Transaction({
        ...baseProps,
        errorMessage: 'Payment declined',
      });
      expect(txnWithErr.errorMessage).toBe('Payment declined');
    });
  });

  describe('isPending', () => {
    it('should return true when status is PENDING', () => {
      const txn = new Transaction({ ...baseProps, status: 'PENDING' });
      expect(txn.isPending).toBe(true);
    });

    it('should return false when status is APPROVED', () => {
      const txn = new Transaction({ ...baseProps, status: 'APPROVED' });
      expect(txn.isPending).toBe(false);
    });

    it('should return false when status is DECLINED', () => {
      const txn = new Transaction({ ...baseProps, status: 'DECLINED' });
      expect(txn.isPending).toBe(false);
    });

    it('should return false when status is ERROR', () => {
      const txn = new Transaction({ ...baseProps, status: 'ERROR' });
      expect(txn.isPending).toBe(false);
    });

    it('should return false when status is VOIDED', () => {
      const txn = new Transaction({ ...baseProps, status: 'VOIDED' });
      expect(txn.isPending).toBe(false);
    });
  });

  describe('isApproved', () => {
    it('should return true when status is APPROVED', () => {
      const txn = new Transaction({ ...baseProps, status: 'APPROVED' });
      expect(txn.isApproved).toBe(true);
    });

    it('should return false when status is PENDING', () => {
      const txn = new Transaction({ ...baseProps, status: 'PENDING' });
      expect(txn.isApproved).toBe(false);
    });

    it('should return false when status is DECLINED', () => {
      const txn = new Transaction({ ...baseProps, status: 'DECLINED' });
      expect(txn.isApproved).toBe(false);
    });

    it('should return false when status is ERROR', () => {
      const txn = new Transaction({ ...baseProps, status: 'ERROR' });
      expect(txn.isApproved).toBe(false);
    });

    it('should return false when status is VOIDED', () => {
      const txn = new Transaction({ ...baseProps, status: 'VOIDED' });
      expect(txn.isApproved).toBe(false);
    });
  });

  describe('isDeclined', () => {
    it('should return true when status is DECLINED', () => {
      const txn = new Transaction({ ...baseProps, status: 'DECLINED' });
      expect(txn.isDeclined).toBe(true);
    });

    it('should return false when status is PENDING', () => {
      const txn = new Transaction({ ...baseProps, status: 'PENDING' });
      expect(txn.isDeclined).toBe(false);
    });

    it('should return false when status is APPROVED', () => {
      const txn = new Transaction({ ...baseProps, status: 'APPROVED' });
      expect(txn.isDeclined).toBe(false);
    });

    it('should return false when status is ERROR', () => {
      const txn = new Transaction({ ...baseProps, status: 'ERROR' });
      expect(txn.isDeclined).toBe(false);
    });

    it('should return false when status is VOIDED', () => {
      const txn = new Transaction({ ...baseProps, status: 'VOIDED' });
      expect(txn.isDeclined).toBe(false);
    });
  });

  describe('approve', () => {
    it('should set status to APPROVED', () => {
      const txn = new Transaction(baseProps);
      txn.approve('biz-txn-123', 'ref-456');
      expect(txn.status).toBe('APPROVED');
      expect(txn.isApproved).toBe(true);
    });

    it('should set businessTransactionId', () => {
      const txn = new Transaction(baseProps);
      txn.approve('biz-txn-123', 'ref-456');
      expect(txn.businessTransactionId).toBe('biz-txn-123');
    });

    it('should set businessReference', () => {
      const txn = new Transaction(baseProps);
      txn.approve('biz-txn-123', 'ref-456');
      expect(txn.businessReference).toBe('ref-456');
    });

    it('should update updatedAt', () => {
      const fixedDate = new Date('2020-01-01T00:00:00Z');
      const txn = new Transaction({ ...baseProps, updatedAt: fixedDate });
      const beforeApprove = new Date();
      txn.approve('biz-txn-123', 'ref-456');
      expect(txn.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeApprove.getTime());
    });

    it('should change isPending to false after approval', () => {
      const txn = new Transaction(baseProps);
      expect(txn.isPending).toBe(true);
      txn.approve('biz-txn-123', 'ref-456');
      expect(txn.isPending).toBe(false);
    });
  });

  describe('decline', () => {
    it('should set status to DECLINED', () => {
      const txn = new Transaction(baseProps);
      txn.decline('Insufficient funds');
      expect(txn.status).toBe('DECLINED');
      expect(txn.isDeclined).toBe(true);
    });

    it('should set errorMessage', () => {
      const txn = new Transaction(baseProps);
      txn.decline('Card expired');
      expect(txn.errorMessage).toBe('Card expired');
    });

    it('should update updatedAt', () => {
      const fixedDate = new Date('2020-01-01T00:00:00Z');
      const txn = new Transaction({ ...baseProps, updatedAt: fixedDate });
      const beforeDecline = new Date();
      txn.decline('Declined');
      expect(txn.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeDecline.getTime());
    });

    it('should change isPending to false after decline', () => {
      const txn = new Transaction(baseProps);
      expect(txn.isPending).toBe(true);
      txn.decline('Declined');
      expect(txn.isPending).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set status to ERROR', () => {
      const txn = new Transaction(baseProps);
      txn.setError('Gateway timeout');
      expect(txn.status).toBe('ERROR');
    });

    it('should set errorMessage', () => {
      const txn = new Transaction(baseProps);
      txn.setError('Gateway timeout');
      expect(txn.errorMessage).toBe('Gateway timeout');
    });

    it('should update updatedAt', () => {
      const fixedDate = new Date('2020-01-01T00:00:00Z');
      const txn = new Transaction({ ...baseProps, updatedAt: fixedDate });
      const beforeError = new Date();
      txn.setError('Error occurred');
      expect(txn.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeError.getTime());
    });

    it('should change isPending to false after setting error', () => {
      const txn = new Transaction(baseProps);
      expect(txn.isPending).toBe(true);
      txn.setError('Error');
      expect(txn.isPending).toBe(false);
    });

    it('should result in isApproved false and isDeclined false', () => {
      const txn = new Transaction(baseProps);
      txn.setError('Some error');
      expect(txn.isApproved).toBe(false);
      expect(txn.isDeclined).toBe(false);
    });
  });

  describe('setDelivery', () => {
    it('should set deliveryId', () => {
      const txn = new Transaction({
        ...baseProps,
        deliveryId: undefined,
      });
      txn.setDelivery('del-new-001');
      expect(txn.deliveryId).toBe('del-new-001');
    });

    it('should overwrite an existing deliveryId', () => {
      const txn = new Transaction({ ...baseProps, deliveryId: 'del-old' });
      txn.setDelivery('del-new');
      expect(txn.deliveryId).toBe('del-new');
    });

    it('should update updatedAt', () => {
      const fixedDate = new Date('2020-01-01T00:00:00Z');
      const txn = new Transaction({ ...baseProps, updatedAt: fixedDate });
      const beforeSet = new Date();
      txn.setDelivery('del-002');
      expect(txn.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeSet.getTime());
    });
  });

  describe('setPaymentDetails', () => {
    it('should set paymentMethod and cardLastFour', () => {
      const txn = new Transaction(baseProps);
      txn.setPaymentDetails('CARD', '4242');
      expect(txn.paymentMethod).toBe('CARD');
      expect(txn.cardLastFour).toBe('4242');
    });

    it('should set businessTransactionId when provided', () => {
      const txn = new Transaction(baseProps);
      txn.setPaymentDetails('CARD', '1234', 'biz-txn-999');
      expect(txn.businessTransactionId).toBe('biz-txn-999');
    });

    it('should not change businessTransactionId when not provided', () => {
      const txn = new Transaction({
        ...baseProps,
        businessTransactionId: 'existing-biz',
      });
      txn.setPaymentDetails('NEQUI', '0000');
      expect(txn.businessTransactionId).toBe('existing-biz');
    });

    it('should not set businessTransactionId when provided as undefined', () => {
      const txn = new Transaction({
        ...baseProps,
        businessTransactionId: 'existing-biz',
      });
      txn.setPaymentDetails('PSE', '5678', undefined);
      expect(txn.businessTransactionId).toBe('existing-biz');
    });

    it('should update updatedAt', () => {
      const fixedDate = new Date('2020-01-01T00:00:00Z');
      const txn = new Transaction({ ...baseProps, updatedAt: fixedDate });
      const beforeSet = new Date();
      txn.setPaymentDetails('CARD', '9999');
      expect(txn.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeSet.getTime());
    });

    it('should overwrite existing payment details', () => {
      const txn = new Transaction({
        ...baseProps,
        paymentMethod: 'OLD_METHOD',
        cardLastFour: '0000',
      });
      txn.setPaymentDetails('NEW_METHOD', '1111');
      expect(txn.paymentMethod).toBe('NEW_METHOD');
      expect(txn.cardLastFour).toBe('1111');
    });
  });

  describe('toJSON', () => {
    it('should return a plain object with all properties', () => {
      const txn = new Transaction(baseProps);
      const json = txn.toJSON();
      expect(json).toEqual({
        id: 'txn-001',
        customerId: 'cust-001',
        productId: 'prod-001',
        deliveryId: 'del-001',
        quantity: 2,
        productAmount: 5000,
        baseFee: 500,
        deliveryFee: 1000,
        totalAmount: 6500,
        status: 'PENDING',
        businessTransactionId: undefined,
        businessReference: undefined,
        paymentMethod: undefined,
        cardLastFour: undefined,
        errorMessage: undefined,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-02T00:00:00Z'),
      });
    });

    it('should reflect status changes in toJSON', () => {
      const txn = new Transaction(baseProps);
      txn.approve('biz-123', 'ref-456');
      const json = txn.toJSON();
      expect(json.status).toBe('APPROVED');
      expect(json.businessTransactionId).toBe('biz-123');
      expect(json.businessReference).toBe('ref-456');
    });

    it('should reflect decline in toJSON', () => {
      const txn = new Transaction(baseProps);
      txn.decline('No funds');
      const json = txn.toJSON();
      expect(json.status).toBe('DECLINED');
      expect(json.errorMessage).toBe('No funds');
    });

    it('should reflect setError in toJSON', () => {
      const txn = new Transaction(baseProps);
      txn.setError('Timeout');
      const json = txn.toJSON();
      expect(json.status).toBe('ERROR');
      expect(json.errorMessage).toBe('Timeout');
    });

    it('should reflect setDelivery in toJSON', () => {
      const txn = new Transaction({ ...baseProps, deliveryId: undefined });
      txn.setDelivery('new-del');
      const json = txn.toJSON();
      expect(json.deliveryId).toBe('new-del');
    });

    it('should reflect setPaymentDetails in toJSON', () => {
      const txn = new Transaction(baseProps);
      txn.setPaymentDetails('CARD', '4242', 'biz-abc');
      const json = txn.toJSON();
      expect(json.paymentMethod).toBe('CARD');
      expect(json.cardLastFour).toBe('4242');
      expect(json.businessTransactionId).toBe('biz-abc');
    });

    it('should return a new object each time toJSON is called', () => {
      const txn = new Transaction(baseProps);
      const json1 = txn.toJSON();
      const json2 = txn.toJSON();
      expect(json1).toEqual(json2);
      expect(json1).not.toBe(json2);
    });
  });
});
