import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import {
    AcceptanceTokenResponse,
    CreatePaymentRequest,
    PaymentGatewayPort,
    PaymentResponse,
    TokenizeCardRequest,
    TokenizeCardResponse,
} from '../../../../../domain/ports/outbound/payment-gateway.port';
import { Result } from '../../../../../shared/result';
import {
    BusinessAcceptanceTokenResponse,
    BusinessCreateTransactionRequest,
    BusinessTokenResponse,
    BusinessTransactionResponse,
} from './business.types';

@Injectable()
export class BusinessAdapter implements PaymentGatewayPort {
  private readonly logger = new Logger(BusinessAdapter.name);
  private readonly httpClient: AxiosInstance;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly integrityKey: string;

  constructor(private readonly configService: ConfigService) {
    this.publicKey = this.configService.get<string>('BUSINESS_PUBLIC_KEY', '');
    this.privateKey = this.configService.get<string>('BUSINESS_PRIVATE_KEY', '');
    this.integrityKey = this.configService.get<string>('BUSINESS_INTEGRITY_KEY', '');
    const baseURL = this.configService.get<string>(
      'BUSINESS_API_URL',
      'https://api-sandbox.co.uat.business.dev/v1',
    );

    this.httpClient = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Generate integrity signature for Business API
   * signature = SHA256(reference + amount_in_cents + currency + integrity_key)
   */
  private generateSignature(reference: string, amountInCents: number, currency: string): string {
    const concatenatedString = `${reference}${amountInCents}${currency}${this.integrityKey}`;
    const hash = crypto.createHash('sha256').update(concatenatedString).digest('hex');
    
    console.log('🔐 [BUSINESS ADAPTER] Generando firma de integridad:');
    console.log({
      reference,
      amountInCents,
      currency,
      integrityKey: this.integrityKey.substring(0, 10) + '...',
      concatenatedString: concatenatedString.substring(0, 50) + '...',
      signature: hash
    });
    
    return hash;
  }

  async getAcceptanceToken(): Promise<Result<AcceptanceTokenResponse, Error>> {
    try {
      const response = await this.httpClient.get<BusinessAcceptanceTokenResponse>(
        `/merchants/${this.publicKey}`,
      );

      const { presigned_acceptance } = response.data.data;

      return Result.ok({
        acceptanceToken: presigned_acceptance.acceptance_token,
        permalink: presigned_acceptance.permalink,
        type: presigned_acceptance.type,
      });
    } catch (error) {
      this.logger.error('Failed to get acceptance token', error);
      return Result.fail(
        new Error(
          `Failed to get acceptance token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ),
      );
    }
  }

  async tokenizeCard(
    request: TokenizeCardRequest,
  ): Promise<Result<TokenizeCardResponse, Error>> {
    try {
      const response = await this.httpClient.post<BusinessTokenResponse>(
        '/tokens/cards',
        {
          number: request.number,
          cvc: request.cvc,
          exp_month: request.expMonth,
          exp_year: request.expYear,
          card_holder: request.cardHolder,
        },
        {
          headers: {
            Authorization: `Bearer ${this.publicKey}`,
          },
        },
      );

      const { data } = response.data;

      return Result.ok({
        token: data.id,
        brand: data.brand,
        lastFour: data.last_four,
        expiresAt: data.expires_at,
      });
    } catch (error) {
      this.logger.error('Failed to tokenize card', error);
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        return Result.fail(
          new Error(
            `Card tokenization failed: ${errorData?.error?.reason || 'Unknown error'}`,
          ),
        );
      }
      return Result.fail(
        new Error(
          `Card tokenization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ),
      );
    }
  }

  async createPayment(
    request: CreatePaymentRequest,
    acceptanceToken: string,
  ): Promise<Result<PaymentResponse, Error>> {
    try {
      // Generar firma de integridad
      const signature = this.generateSignature(
        request.reference,
        request.amountInCents,
        request.currency
      );

      const businessRequest: BusinessCreateTransactionRequest = {
        amount_in_cents: request.amountInCents,
        currency: request.currency,
        customer_email: request.customerEmail,
        reference: request.reference,
        signature: signature,
        acceptance_token: acceptanceToken,
        payment_method: {
          type: request.paymentMethod.type,
          token: request.paymentMethod.token,
          installments: request.paymentMethod.installments,
        },
      };

      if (request.customerData) {
        businessRequest.customer_data = {
          full_name: request.customerData.fullName,
          phone_number: request.customerData.phoneNumber,
        };
      }

      console.log('🚀 [BUSINESS ADAPTER] Request a Business API:');
      console.log(JSON.stringify(businessRequest, null, 2));
      console.log('URL:', `${this.httpClient.defaults.baseURL}/transactions`);
      console.log('='.repeat(80));

      const response = await this.httpClient.post<BusinessTransactionResponse>(
        '/transactions',
        businessRequest,
        {
          headers: {
            Authorization: `Bearer ${this.privateKey}`,
          },
        },
      );

      const { data } = response.data;

      return Result.ok({
        transactionId: data.id,
        reference: data.reference,
        status: this.mapBusinessStatus(data.status),
        statusMessage: data.status_message,
        paymentMethodType: data.payment_method_type,
        amountInCents: data.amount_in_cents,
        currency: data.currency,
      });
    } catch (error) {
      this.logger.error('Failed to create payment', error);
      
      console.log('❌ [BUSINESS ADAPTER] Error en Business:');
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        console.log('Status:', error.response.status);
        console.log('Response:', JSON.stringify(errorData, null, 2));
        console.log('='.repeat(80));
        
        return Result.fail(
          new Error(
            `Payment failed: ${errorData?.error?.reason || JSON.stringify(errorData)}`,
          ),
        );
      }
      
      console.log('Error completo:', error);
      console.log('='.repeat(80));
      
      return Result.fail(
        new Error(
          `Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ),
      );
    }
  }

  async getTransaction(
    transactionId: string,
  ): Promise<Result<PaymentResponse, Error>> {
    try {
      const response = await this.httpClient.get<BusinessTransactionResponse>(
        `/transactions/${transactionId}`,
      );

      const { data } = response.data;

      return Result.ok({
        transactionId: data.id,
        reference: data.reference,
        status: this.mapBusinessStatus(data.status),
        statusMessage: data.status_message,
        paymentMethodType: data.payment_method_type,
        amountInCents: data.amount_in_cents,
        currency: data.currency,
      });
    } catch (error) {
      this.logger.error('Failed to get transaction', error);
      return Result.fail(
        new Error(
          `Failed to get transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ),
      );
    }
  }

  private mapBusinessStatus(
    status: string,
  ): 'APPROVED' | 'DECLINED' | 'PENDING' | 'VOIDED' | 'ERROR' {
    const statusMap: Record<
      string,
      'APPROVED' | 'DECLINED' | 'PENDING' | 'VOIDED' | 'ERROR'
    > = {
      APPROVED: 'APPROVED',
      DECLINED: 'DECLINED',
      PENDING: 'PENDING',
      VOIDED: 'VOIDED',
      ERROR: 'ERROR',
    };
    return statusMap[status] || 'ERROR';
  }
}
