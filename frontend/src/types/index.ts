export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export interface Customer {
  email: string;
  fullName: string;
  phone: string;
}

export interface DeliveryInfo {
  address: string;
  city: string;
  department: string;
  zipCode?: string;
}

export interface CreditCardData {
  number: string;
  cardHolder: string;
  expMonth: string;
  expYear: string;
  cvc: string;
}

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'diners' | 'unknown';

export interface Transaction {
  id: string;
  customerId: string;
  productId: string;
  deliveryId: string;
  quantity: number;
  productAmount: number;
  baseFee: number;
  deliveryFee: number;
  totalAmount: number;
  status: TransactionStatus;
  wompiTransactionId?: string;
  wompiReference?: string;
  paymentMethod?: string;
  cardLastFour?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'VOIDED'
  | 'ERROR';

export type CheckoutStep = 'product' | 'payment' | 'summary' | 'result';

export interface Fees {
  baseFee: number;
  deliveryFee: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CreateTransactionRequest {
  productId: string;
  quantity: number;
  customer: Customer;
  delivery: DeliveryInfo;
  card: CreditCardData;
  installments?: number;
}

export interface ProcessPaymentResponse {
  transaction: Transaction;
  customer: Customer;
  delivery: DeliveryInfo;
}
