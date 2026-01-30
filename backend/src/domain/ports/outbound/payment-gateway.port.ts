import { Result } from '../../../shared/result';

export interface TokenizeCardRequest {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

export interface TokenizeCardResponse {
  token: string;
  brand: string;
  lastFour: string;
  expiresAt: string;
}

export interface CreatePaymentRequest {
  amountInCents: number;
  currency: string;
  customerEmail: string;
  reference: string;
  paymentMethod: {
    type: string;
    token: string;
    installments: number;
  };
  customerData?: {
    fullName: string;
    phoneNumber?: string;
  };
}

export interface PaymentResponse {
  transactionId: string;
  reference: string;
  status: 'APPROVED' | 'DECLINED' | 'PENDING' | 'VOIDED' | 'ERROR';
  statusMessage?: string;
  paymentMethodType: string;
  amountInCents: number;
  currency: string;
}

export interface AcceptanceTokenResponse {
  acceptanceToken: string;
  permalink: string;
  type: string;
}

export interface PaymentGatewayPort {
  getAcceptanceToken(): Promise<Result<AcceptanceTokenResponse, Error>>;
  tokenizeCard(
    request: TokenizeCardRequest,
  ): Promise<Result<TokenizeCardResponse, Error>>;
  createPayment(
    request: CreatePaymentRequest,
    acceptanceToken: string,
  ): Promise<Result<PaymentResponse, Error>>;
  getTransaction(
    transactionId: string,
  ): Promise<Result<PaymentResponse, Error>>;
}

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');
