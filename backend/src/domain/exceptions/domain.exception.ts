export abstract class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InsufficientStockException extends DomainException {
  constructor(productId: string, requested: number, available: number) {
    super(
      `Insufficient stock for product ${productId}. Requested: ${requested}, Available: ${available}`,
      'INSUFFICIENT_STOCK',
    );
  }
}

export class ProductNotFoundException extends DomainException {
  constructor(productId: string) {
    super(`Product with id ${productId} not found`, 'PRODUCT_NOT_FOUND');
  }
}

export class TransactionNotFoundException extends DomainException {
  constructor(transactionId: string) {
    super(
      `Transaction with id ${transactionId} not found`,
      'TRANSACTION_NOT_FOUND',
    );
  }
}

export class PaymentFailedException extends DomainException {
  constructor(reason: string) {
    super(`Payment failed: ${reason}`, 'PAYMENT_FAILED');
  }
}

export class InvalidCardException extends DomainException {
  constructor(reason: string) {
    super(`Invalid card: ${reason}`, 'INVALID_CARD');
  }
}

export class CustomerNotFoundException extends DomainException {
  constructor(customerId: string) {
    super(`Customer with id ${customerId} not found`, 'CUSTOMER_NOT_FOUND');
  }
}
