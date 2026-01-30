import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import {
  CreatePaymentRequest,
  TokenizeCardRequest,
} from '../../../../../domain/ports/outbound/payment-gateway.port';
import { BusinessAdapter } from './business.adapter';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BusinessAdapter', () => {
  let adapter: BusinessAdapter;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        BUSINESS_PUBLIC_KEY: 'pub_test_12345',
        BUSINESS_PRIVATE_KEY: 'prv_test_67890',
        BUSINESS_INTEGRITY_KEY: 'integrity_test_key',
        BUSINESS_API_URL: 'https://api-sandbox.co.uat.business.dev/v1',
      };
      return config[key] || defaultValue;
    }),
  };

  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    defaults: {
      baseURL: 'https://api-sandbox.co.uat.business.dev/v1',
    },
  };

  beforeEach(async () => {
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessAdapter,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    adapter = module.get<BusinessAdapter>(BusinessAdapter);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with config values', () => {
      expect(configService.get).toHaveBeenCalledWith('BUSINESS_PUBLIC_KEY', '');
      expect(configService.get).toHaveBeenCalledWith(
        'BUSINESS_PRIVATE_KEY',
        '',
      );
      expect(configService.get).toHaveBeenCalledWith(
        'BUSINESS_INTEGRITY_KEY',
        '',
      );
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api-sandbox.co.uat.business.dev/v1',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('getAcceptanceToken', () => {
    it('should return acceptance token successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            presigned_acceptance: {
              acceptance_token: 'test-acceptance-token',
              permalink: 'https://business.co/acceptance',
              type: 'END_USER_POLICY',
            },
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await adapter.getAcceptanceToken();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual({
        acceptanceToken: 'test-acceptance-token',
        permalink: 'https://business.co/acceptance',
        type: 'END_USER_POLICY',
      });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/merchants/pub_test_12345',
      );
    });

    it('should return error when acceptance token fails', async () => {
      const error = new Error('Network error');
      mockAxiosInstance.get.mockRejectedValue(error);

      const result = await adapter.getAcceptanceToken();

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Failed to get acceptance token');
    });

    it('should handle API error response', async () => {
      const axiosError = {
        response: {
          status: 401,
          data: {
            error: {
              reason: 'Invalid credentials',
            },
          },
        },
        isAxiosError: true,
      };
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      const result = await adapter.getAcceptanceToken();

      expect(result.isFailure).toBe(true);
    });
  });

  describe('tokenizeCard', () => {
    const tokenizeRequest: TokenizeCardRequest = {
      number: '4242424242424242',
      cvc: '123',
      expMonth: '12',
      expYear: '25',
      cardHolder: 'John Doe',
    };

    it('should tokenize card successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'tok_test_12345',
            brand: 'VISA',
            last_four: '4242',
            expires_at: '2025-12-31',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await adapter.tokenizeCard(tokenizeRequest);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual({
        token: 'tok_test_12345',
        brand: 'VISA',
        lastFour: '4242',
        expiresAt: '2025-12-31',
      });
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/tokens/cards',
        {
          number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '25',
          card_holder: 'John Doe',
        },
        {
          headers: {
            Authorization: 'Bearer pub_test_12345',
          },
        },
      );
    });

    it('should return error when tokenization fails', async () => {
      const error = new Error('Invalid card number');
      mockAxiosInstance.post.mockRejectedValue(error);

      const result = await adapter.tokenizeCard(tokenizeRequest);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Card tokenization failed');
    });

    it('should handle API error with reason', async () => {
      const axiosError = {
        response: {
          status: 400,
          data: {
            error: {
              reason: 'Invalid card number',
            },
          },
        },
        isAxiosError: true,
      };

      // Mock axios.isAxiosError to return true for our custom error
      (axios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(true);

      mockAxiosInstance.post.mockRejectedValue(axiosError);

      const result = await adapter.tokenizeCard(tokenizeRequest);

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Invalid card number');
    });

    it('should handle different card brands', async () => {
      const mastercardResponse = {
        data: {
          data: {
            id: 'tok_mc_12345',
            brand: 'MASTERCARD',
            last_four: '5454',
            expires_at: '2026-10-31',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mastercardResponse);

      const result = await adapter.tokenizeCard({
        ...tokenizeRequest,
        number: '5454545454545454',
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value?.brand).toBe('MASTERCARD');
      expect(result.value?.lastFour).toBe('5454');
    });
  });

  describe('createPayment', () => {
    const createPaymentRequest: CreatePaymentRequest = {
      reference: 'REF-TEST-001',
      amountInCents: 50000,
      currency: 'COP',
      customerEmail: 'test@example.com',
      paymentMethod: {
        type: 'CARD',
        token: 'tok_test_12345',
        installments: 1,
      },
      customerData: {
        fullName: 'John Doe',
        phoneNumber: '+57 300 123 4567',
      },
    };

    it('should create payment successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'txn-12345',
            reference: 'REF-TEST-001',
            status: 'APPROVED',
            status_message: 'Approved transaction',
            payment_method_type: 'CARD',
            amount_in_cents: 50000,
            currency: 'COP',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await adapter.createPayment(
        createPaymentRequest,
        'acceptance-token-123',
      );

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual({
        transactionId: 'txn-12345',
        reference: 'REF-TEST-001',
        status: 'APPROVED',
        statusMessage: 'Approved transaction',
        paymentMethodType: 'CARD',
        amountInCents: 50000,
        currency: 'COP',
      });

      const callArgs = mockAxiosInstance.post.mock.calls[0];
      const requestBody = callArgs[1];
      expect(requestBody).toMatchObject({
        amount_in_cents: 50000,
        currency: 'COP',
        customer_email: 'test@example.com',
        reference: 'REF-TEST-001',
        acceptance_token: 'acceptance-token-123',
        payment_method: {
          type: 'CARD',
          token: 'tok_test_12345',
          installments: 1,
        },
        customer_data: {
          full_name: 'John Doe',
          phone_number: '+57 300 123 4567',
        },
      });
      expect(requestBody.signature).toBeDefined();
    });

    it('should create payment without customer data', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'txn-67890',
            reference: 'REF-TEST-002',
            status: 'PENDING',
            status_message: 'Pending transaction',
            payment_method_type: 'CARD',
            amount_in_cents: 30000,
            currency: 'COP',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const requestWithoutCustomerData = {
        ...createPaymentRequest,
        customerData: undefined,
      };

      const result = await adapter.createPayment(
        requestWithoutCustomerData,
        'acceptance-token-456',
      );

      expect(result.isSuccess).toBe(true);
      expect(result.value?.status).toBe('PENDING');

      const callArgs = mockAxiosInstance.post.mock.calls[0];
      const requestBody = callArgs[1];
      expect(requestBody.customer_data).toBeUndefined();
    });

    it('should return declined status', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'txn-declined',
            reference: 'REF-DECLINED',
            status: 'DECLINED',
            status_message: 'Insufficient funds',
            payment_method_type: 'CARD',
            amount_in_cents: 100000,
            currency: 'COP',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await adapter.createPayment(
        createPaymentRequest,
        'acceptance-token-789',
      );

      expect(result.isSuccess).toBe(true);
      expect(result.value?.status).toBe('DECLINED');
      expect(result.value?.statusMessage).toBe('Insufficient funds');
    });

    it('should return error when payment creation fails', async () => {
      const error = new Error('Network timeout');
      mockAxiosInstance.post.mockRejectedValue(error);

      const result = await adapter.createPayment(
        createPaymentRequest,
        'acceptance-token-fail',
      );

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Payment failed');
    });

    it('should handle API error response', async () => {
      const axiosError = {
        response: {
          status: 422,
          data: {
            error: {
              reason: 'Invalid signature',
            },
          },
        },
        isAxiosError: true,
      };

      // Mock axios.isAxiosError to return true
      (axios.isAxiosError as jest.Mock) = jest.fn().mockReturnValue(true);

      mockAxiosInstance.post.mockRejectedValue(axiosError);

      const result = await adapter.createPayment(
        createPaymentRequest,
        'acceptance-token-error',
      );

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Invalid signature');
    });

    it('should include authorization header with private key', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'txn-auth-test',
            reference: 'REF-AUTH',
            status: 'APPROVED',
            status_message: 'Success',
            payment_method_type: 'CARD',
            amount_in_cents: 25000,
            currency: 'COP',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      await adapter.createPayment(
        createPaymentRequest,
        'acceptance-token-auth',
      );

      const callArgs = mockAxiosInstance.post.mock.calls[0];
      const headers = callArgs[2]?.headers;
      expect(headers?.Authorization).toBe('Bearer prv_test_67890');
    });
  });

  describe('getTransaction', () => {
    it('should get transaction successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'txn-query-123',
            reference: 'REF-QUERY-001',
            status: 'APPROVED',
            status_message: 'Transaction approved',
            payment_method_type: 'CARD',
            amount_in_cents: 75000,
            currency: 'COP',
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await adapter.getTransaction('txn-query-123');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual({
        transactionId: 'txn-query-123',
        reference: 'REF-QUERY-001',
        status: 'APPROVED',
        statusMessage: 'Transaction approved',
        paymentMethodType: 'CARD',
        amountInCents: 75000,
        currency: 'COP',
      });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/transactions/txn-query-123',
      );
    });

    it('should handle pending transaction', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'txn-pending',
            reference: 'REF-PENDING',
            status: 'PENDING',
            status_message: 'Transaction pending',
            payment_method_type: 'CARD',
            amount_in_cents: 40000,
            currency: 'COP',
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await adapter.getTransaction('txn-pending');

      expect(result.isSuccess).toBe(true);
      expect(result.value?.status).toBe('PENDING');
    });

    it('should handle voided transaction', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'txn-voided',
            reference: 'REF-VOIDED',
            status: 'VOIDED',
            status_message: 'Transaction voided',
            payment_method_type: 'CARD',
            amount_in_cents: 60000,
            currency: 'COP',
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await adapter.getTransaction('txn-voided');

      expect(result.isSuccess).toBe(true);
      expect(result.value?.status).toBe('VOIDED');
    });

    it('should return error when transaction not found', async () => {
      const error = new Error('Transaction not found');
      mockAxiosInstance.get.mockRejectedValue(error);

      const result = await adapter.getTransaction('non-existent-txn');

      expect(result.isFailure).toBe(true);
      expect(result.error?.message).toContain('Failed to get transaction');
    });

    it('should handle unknown status as ERROR', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'txn-unknown',
            reference: 'REF-UNKNOWN',
            status: 'UNKNOWN_STATUS',
            status_message: 'Unknown status',
            payment_method_type: 'CARD',
            amount_in_cents: 50000,
            currency: 'COP',
          },
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await adapter.getTransaction('txn-unknown');

      expect(result.isSuccess).toBe(true);
      expect(result.value?.status).toBe('ERROR');
    });
  });
});
