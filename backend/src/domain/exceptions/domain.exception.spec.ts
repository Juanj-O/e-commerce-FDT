import {
  DomainException,
  InsufficientStockException,
  ProductNotFoundException,
  TransactionNotFoundException,
  PaymentFailedException,
  InvalidCardException,
  CustomerNotFoundException,
} from './domain.exception';

describe('DomainException', () => {
  // DomainException is abstract, so we test it through its concrete subclasses.
  // Every subclass should share the following behaviors inherited from DomainException.

  describe('common behavior (via subclasses)', () => {
    it('should be an instance of Error', () => {
      const exception = new ProductNotFoundException('prod-1');
      expect(exception).toBeInstanceOf(Error);
    });

    it('should be an instance of DomainException', () => {
      const exception = new ProductNotFoundException('prod-1');
      expect(exception).toBeInstanceOf(DomainException);
    });

    it('should set the name to the constructor name', () => {
      const exception = new ProductNotFoundException('prod-1');
      expect(exception.name).toBe('ProductNotFoundException');
    });

    it('should have a message property', () => {
      const exception = new ProductNotFoundException('prod-1');
      expect(typeof exception.message).toBe('string');
      expect(exception.message.length).toBeGreaterThan(0);
    });

    it('should have a code property', () => {
      const exception = new ProductNotFoundException('prod-1');
      expect(typeof exception.code).toBe('string');
      expect(exception.code.length).toBeGreaterThan(0);
    });
  });
});

describe('InsufficientStockException', () => {
  it('should have code INSUFFICIENT_STOCK', () => {
    const exception = new InsufficientStockException('prod-1', 10, 5);
    expect(exception.code).toBe('INSUFFICIENT_STOCK');
  });

  it('should include productId, requested, and available in the message', () => {
    const exception = new InsufficientStockException('prod-abc', 20, 3);
    expect(exception.message).toBe(
      'Insufficient stock for product prod-abc. Requested: 20, Available: 3',
    );
  });

  it('should set name to InsufficientStockException', () => {
    const exception = new InsufficientStockException('prod-1', 1, 0);
    expect(exception.name).toBe('InsufficientStockException');
  });

  it('should be an instance of DomainException', () => {
    const exception = new InsufficientStockException('prod-1', 5, 2);
    expect(exception).toBeInstanceOf(DomainException);
  });

  it('should be an instance of Error', () => {
    const exception = new InsufficientStockException('prod-1', 5, 2);
    expect(exception).toBeInstanceOf(Error);
  });

  it('should format the message correctly with zero available', () => {
    const exception = new InsufficientStockException('prod-xyz', 1, 0);
    expect(exception.message).toBe(
      'Insufficient stock for product prod-xyz. Requested: 1, Available: 0',
    );
  });

  it('should format the message correctly with large numbers', () => {
    const exception = new InsufficientStockException('prod-big', 10000, 500);
    expect(exception.message).toBe(
      'Insufficient stock for product prod-big. Requested: 10000, Available: 500',
    );
  });
});

describe('ProductNotFoundException', () => {
  it('should have code PRODUCT_NOT_FOUND', () => {
    const exception = new ProductNotFoundException('prod-1');
    expect(exception.code).toBe('PRODUCT_NOT_FOUND');
  });

  it('should include productId in the message', () => {
    const exception = new ProductNotFoundException('prod-abc-123');
    expect(exception.message).toBe('Product with id prod-abc-123 not found');
  });

  it('should set name to ProductNotFoundException', () => {
    const exception = new ProductNotFoundException('prod-1');
    expect(exception.name).toBe('ProductNotFoundException');
  });

  it('should be an instance of DomainException', () => {
    const exception = new ProductNotFoundException('prod-1');
    expect(exception).toBeInstanceOf(DomainException);
  });

  it('should be an instance of Error', () => {
    const exception = new ProductNotFoundException('prod-1');
    expect(exception).toBeInstanceOf(Error);
  });

  it('should work with UUID-style product ids', () => {
    const exception = new ProductNotFoundException('550e8400-e29b-41d4-a716-446655440000');
    expect(exception.message).toBe(
      'Product with id 550e8400-e29b-41d4-a716-446655440000 not found',
    );
  });
});

describe('TransactionNotFoundException', () => {
  it('should have code TRANSACTION_NOT_FOUND', () => {
    const exception = new TransactionNotFoundException('txn-1');
    expect(exception.code).toBe('TRANSACTION_NOT_FOUND');
  });

  it('should include transactionId in the message', () => {
    const exception = new TransactionNotFoundException('txn-xyz-789');
    expect(exception.message).toBe('Transaction with id txn-xyz-789 not found');
  });

  it('should set name to TransactionNotFoundException', () => {
    const exception = new TransactionNotFoundException('txn-1');
    expect(exception.name).toBe('TransactionNotFoundException');
  });

  it('should be an instance of DomainException', () => {
    const exception = new TransactionNotFoundException('txn-1');
    expect(exception).toBeInstanceOf(DomainException);
  });

  it('should be an instance of Error', () => {
    const exception = new TransactionNotFoundException('txn-1');
    expect(exception).toBeInstanceOf(Error);
  });

  it('should work with UUID-style transaction ids', () => {
    const exception = new TransactionNotFoundException('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    expect(exception.message).toBe(
      'Transaction with id a1b2c3d4-e5f6-7890-abcd-ef1234567890 not found',
    );
  });
});

describe('PaymentFailedException', () => {
  it('should have code PAYMENT_FAILED', () => {
    const exception = new PaymentFailedException('Insufficient funds');
    expect(exception.code).toBe('PAYMENT_FAILED');
  });

  it('should include reason in the message', () => {
    const exception = new PaymentFailedException('Card declined');
    expect(exception.message).toBe('Payment failed: Card declined');
  });

  it('should set name to PaymentFailedException', () => {
    const exception = new PaymentFailedException('reason');
    expect(exception.name).toBe('PaymentFailedException');
  });

  it('should be an instance of DomainException', () => {
    const exception = new PaymentFailedException('reason');
    expect(exception).toBeInstanceOf(DomainException);
  });

  it('should be an instance of Error', () => {
    const exception = new PaymentFailedException('reason');
    expect(exception).toBeInstanceOf(Error);
  });

  it('should work with a long reason string', () => {
    const longReason = 'The payment gateway returned an unexpected error after multiple retries';
    const exception = new PaymentFailedException(longReason);
    expect(exception.message).toBe(`Payment failed: ${longReason}`);
  });

  it('should work with an empty reason string', () => {
    const exception = new PaymentFailedException('');
    expect(exception.message).toBe('Payment failed: ');
  });
});

describe('InvalidCardException', () => {
  it('should have code INVALID_CARD', () => {
    const exception = new InvalidCardException('Expired card');
    expect(exception.code).toBe('INVALID_CARD');
  });

  it('should include reason in the message', () => {
    const exception = new InvalidCardException('Invalid CVV');
    expect(exception.message).toBe('Invalid card: Invalid CVV');
  });

  it('should set name to InvalidCardException', () => {
    const exception = new InvalidCardException('reason');
    expect(exception.name).toBe('InvalidCardException');
  });

  it('should be an instance of DomainException', () => {
    const exception = new InvalidCardException('reason');
    expect(exception).toBeInstanceOf(DomainException);
  });

  it('should be an instance of Error', () => {
    const exception = new InvalidCardException('reason');
    expect(exception).toBeInstanceOf(Error);
  });

  it('should work with various reason strings', () => {
    const exception = new InvalidCardException('Card number is too short');
    expect(exception.message).toBe('Invalid card: Card number is too short');
  });

  it('should work with an empty reason string', () => {
    const exception = new InvalidCardException('');
    expect(exception.message).toBe('Invalid card: ');
  });
});

describe('CustomerNotFoundException', () => {
  it('should have code CUSTOMER_NOT_FOUND', () => {
    const exception = new CustomerNotFoundException('cust-1');
    expect(exception.code).toBe('CUSTOMER_NOT_FOUND');
  });

  it('should include customerId in the message', () => {
    const exception = new CustomerNotFoundException('cust-abc-456');
    expect(exception.message).toBe('Customer with id cust-abc-456 not found');
  });

  it('should set name to CustomerNotFoundException', () => {
    const exception = new CustomerNotFoundException('cust-1');
    expect(exception.name).toBe('CustomerNotFoundException');
  });

  it('should be an instance of DomainException', () => {
    const exception = new CustomerNotFoundException('cust-1');
    expect(exception).toBeInstanceOf(DomainException);
  });

  it('should be an instance of Error', () => {
    const exception = new CustomerNotFoundException('cust-1');
    expect(exception).toBeInstanceOf(Error);
  });

  it('should work with UUID-style customer ids', () => {
    const exception = new CustomerNotFoundException('d4e5f6a7-b8c9-0123-4567-890abcdef012');
    expect(exception.message).toBe(
      'Customer with id d4e5f6a7-b8c9-0123-4567-890abcdef012 not found',
    );
  });
});

describe('Exception hierarchy and uniqueness', () => {
  it('all exception types should have distinct error codes', () => {
    const codes = [
      new InsufficientStockException('p', 1, 0).code,
      new ProductNotFoundException('p').code,
      new TransactionNotFoundException('t').code,
      new PaymentFailedException('r').code,
      new InvalidCardException('r').code,
      new CustomerNotFoundException('c').code,
    ];
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it('all exception types should have distinct constructor names', () => {
    const names = [
      new InsufficientStockException('p', 1, 0).name,
      new ProductNotFoundException('p').name,
      new TransactionNotFoundException('t').name,
      new PaymentFailedException('r').name,
      new InvalidCardException('r').name,
      new CustomerNotFoundException('c').name,
    ];
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('all exceptions should be throwable and catchable', () => {
    const exceptions = [
      new InsufficientStockException('p', 1, 0),
      new ProductNotFoundException('p'),
      new TransactionNotFoundException('t'),
      new PaymentFailedException('r'),
      new InvalidCardException('r'),
      new CustomerNotFoundException('c'),
    ];

    for (const exception of exceptions) {
      expect(() => {
        throw exception;
      }).toThrow(DomainException);
    }
  });

  it('all exceptions should be catchable as Error', () => {
    const exceptions = [
      new InsufficientStockException('p', 1, 0),
      new ProductNotFoundException('p'),
      new TransactionNotFoundException('t'),
      new PaymentFailedException('r'),
      new InvalidCardException('r'),
      new CustomerNotFoundException('c'),
    ];

    for (const exception of exceptions) {
      expect(() => {
        throw exception;
      }).toThrow(Error);
    }
  });
});
