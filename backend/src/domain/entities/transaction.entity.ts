export type TransactionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'VOIDED'
  | 'ERROR';

export interface TransactionProps {
  id?: string;
  customerId: string;
  productId: string;
  deliveryId?: string;
  quantity: number;
  productAmount: number;
  baseFee: number;
  deliveryFee: number;
  totalAmount: number;
  status?: TransactionStatus;
  businessTransactionId?: string;
  businessReference?: string;
  paymentMethod?: string;
  cardLastFour?: string;
  errorMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Transaction {
  private readonly _id: string;
  private readonly _customerId: string;
  private readonly _productId: string;
  private _deliveryId?: string;
  private readonly _quantity: number;
  private readonly _productAmount: number;
  private readonly _baseFee: number;
  private readonly _deliveryFee: number;
  private readonly _totalAmount: number;
  private _status: TransactionStatus;
  private _businessTransactionId?: string;
  private _businessReference?: string;
  private _paymentMethod?: string;
  private _cardLastFour?: string;
  private _errorMessage?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: TransactionProps) {
    this._id = props.id || '';
    this._customerId = props.customerId;
    this._productId = props.productId;
    this._deliveryId = props.deliveryId;
    this._quantity = props.quantity;
    this._productAmount = props.productAmount;
    this._baseFee = props.baseFee;
    this._deliveryFee = props.deliveryFee;
    this._totalAmount = props.totalAmount;
    this._status = props.status || 'PENDING';
    this._businessTransactionId = props.businessTransactionId;
    this._businessReference = props.businessReference;
    this._paymentMethod = props.paymentMethod;
    this._cardLastFour = props.cardLastFour;
    this._errorMessage = props.errorMessage;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  get id(): string {
    return this._id;
  }

  get customerId(): string {
    return this._customerId;
  }

  get productId(): string {
    return this._productId;
  }

  get deliveryId(): string | undefined {
    return this._deliveryId;
  }

  get quantity(): number {
    return this._quantity;
  }

  get productAmount(): number {
    return this._productAmount;
  }

  get baseFee(): number {
    return this._baseFee;
  }

  get deliveryFee(): number {
    return this._deliveryFee;
  }

  get totalAmount(): number {
    return this._totalAmount;
  }

  get status(): TransactionStatus {
    return this._status;
  }

  get businessTransactionId(): string | undefined {
    return this._businessTransactionId;
  }

  get businessReference(): string | undefined {
    return this._businessReference;
  }

  get paymentMethod(): string | undefined {
    return this._paymentMethod;
  }

  get cardLastFour(): string | undefined {
    return this._cardLastFour;
  }

  get errorMessage(): string | undefined {
    return this._errorMessage;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get isPending(): boolean {
    return this._status === 'PENDING';
  }

  get isApproved(): boolean {
    return this._status === 'APPROVED';
  }

  get isDeclined(): boolean {
    return this._status === 'DECLINED';
  }

  approve(businessTransactionId: string, businessReference: string): void {
    this._status = 'APPROVED';
    this._businessTransactionId = businessTransactionId;
    this._businessReference = businessReference;
    this._updatedAt = new Date();
  }

  decline(errorMessage: string): void {
    this._status = 'DECLINED';
    this._errorMessage = errorMessage;
    this._updatedAt = new Date();
  }

  setError(errorMessage: string): void {
    this._status = 'ERROR';
    this._errorMessage = errorMessage;
    this._updatedAt = new Date();
  }

  setDelivery(deliveryId: string): void {
    this._deliveryId = deliveryId;
    this._updatedAt = new Date();
  }

  setPaymentDetails(
    paymentMethod: string,
    cardLastFour: string,
    businessTransactionId?: string,
  ): void {
    this._paymentMethod = paymentMethod;
    this._cardLastFour = cardLastFour;
    if (businessTransactionId) {
      this._businessTransactionId = businessTransactionId;
    }
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this._id,
      customerId: this._customerId,
      productId: this._productId,
      deliveryId: this._deliveryId,
      quantity: this._quantity,
      productAmount: this._productAmount,
      baseFee: this._baseFee,
      deliveryFee: this._deliveryFee,
      totalAmount: this._totalAmount,
      status: this._status,
      businessTransactionId: this._businessTransactionId,
      businessReference: this._businessReference,
      paymentMethod: this._paymentMethod,
      cardLastFour: this._cardLastFour,
      errorMessage: this._errorMessage,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
