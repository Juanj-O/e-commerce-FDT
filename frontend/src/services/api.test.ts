import axios from 'axios'
import type {
  CreateTransactionRequest,
  ProcessPaymentResponse,
  Product,
  Transaction
} from '../types'

// Create complete axios mock before importing api
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn()
    },
    response: {
      use: jest.fn((onSuccess) => onSuccess)
    }
  }
}

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
  isAxiosError: jest.fn(),
  default: {
    create: jest.fn(() => mockAxiosInstance),
    isAxiosError: jest.fn()
  }
}))

// Now import after mocking
import { productsApi, transactionsApi } from './api'

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('productsApi', () => {
    describe('getAll', () => {
      it('should fetch all products successfully', async () => {
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Product 1',
            description: 'Description 1',
            price: 100000,
            stock: 10,
            imageUrl: 'https://example.com/image1.jpg'
          },
          {
            id: '2',
            name: 'Product 2',
            description: 'Description 2',
            price: 200000,
            stock: 5,
            imageUrl: 'https://example.com/image2.jpg'
          }
        ]

        const mockResponse = {
          data: {
            success: true,
            data: mockProducts
          }
        }

        mockAxiosInstance.get.mockResolvedValue(mockResponse)

        const result = await productsApi.getAll()

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products')
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockProducts)
        expect(result.data).toHaveLength(2)
      })

      it('should return empty array when no products exist', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: []
          }
        }

        mockAxiosInstance.get.mockResolvedValue(mockResponse)

        const result = await productsApi.getAll()

        expect(result.data).toEqual([])
      })

      it('should handle API error', async () => {
        const errorMessage = 'Network error'
        mockAxiosInstance.get.mockRejectedValue(new Error(errorMessage))

        await expect(productsApi.getAll()).rejects.toThrow(errorMessage)
      })
    })

    describe('getById', () => {
      it('should fetch a product by id successfully', async () => {
        const mockProduct: Product = {
          id: '1',
          name: 'Test Product',
          description: 'Test Description',
          price: 150000,
          stock: 20,
          imageUrl: 'https://example.com/image.jpg'
        }

        const mockResponse = {
          data: {
            success: true,
            data: mockProduct
          }
        }

        mockAxiosInstance.get.mockResolvedValue(mockResponse)

        const result = await productsApi.getById('1')

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products/1')
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockProduct)
        expect(result.data.id).toBe('1')
      })

      it('should handle different product IDs', async () => {
        const mockProduct: Product = {
          id: 'abc-123',
          name: 'Product ABC',
          description: 'Description',
          price: 50000,
          stock: 15,
          imageUrl: 'https://example.com/abc.jpg'
        }

        const mockResponse = {
          data: {
            success: true,
            data: mockProduct
          }
        }

        mockAxiosInstance.get.mockResolvedValue(mockResponse)

        const result = await productsApi.getById('abc-123')

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/products/abc-123')
        expect(result.data.id).toBe('abc-123')
      })

      it('should handle product not found error', async () => {
        const errorMessage = 'Product not found'
        mockAxiosInstance.get.mockRejectedValue(new Error(errorMessage))

        await expect(productsApi.getById('non-existent')).rejects.toThrow(errorMessage)
      })

      it('should handle product with zero stock', async () => {
        const mockProduct: Product = {
          id: '3',
          name: 'Out of Stock Product',
          description: 'Description',
          price: 100000,
          stock: 0,
          imageUrl: 'https://example.com/image3.jpg'
        }

        const mockResponse = {
          data: {
            success: true,
            data: mockProduct
          }
        }

        mockAxiosInstance.get.mockResolvedValue(mockResponse)

        const result = await productsApi.getById('3')

        expect(result.data.stock).toBe(0)
      })
    })
  })

  describe('transactionsApi', () => {
    describe('create', () => {
      it('should create transaction successfully', async () => {
        const createRequest: CreateTransactionRequest = {
          productId: 'prod-1',
          quantity: 2,
          customer: {
            email: 'test@example.com',
            fullName: 'Test User',
            phone: '+57 300 123 4567'
          },
          delivery: {
            address: 'Calle 123 #45-67',
            city: 'Bogotá',
            department: 'Cundinamarca'
          },
          card: {
            number: '4242424242424242',
            cardHolder: 'TEST USER',
            expMonth: '12',
            expYear: '25',
            cvc: '123'
          }
        }

        const mockPaymentResponse: ProcessPaymentResponse = {
          transaction: {
            id: 'txn-123',
            customerId: 'cust-1',
            productId: 'prod-1',
            deliveryId: 'del-1',
            quantity: 2,
            productAmount: 100000,
            baseFee: 10000,
            deliveryFee: 5000,
            totalAmount: 115000,
            status: 'APPROVED',
            businessTransactionId: 'biz-txn-456',
            businessReference: 'REF-001',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          customer: {
            email: 'test@example.com',
            fullName: 'Test User',
            phone: '+57 300 123 4567'
          },
          delivery: {
            address: 'Calle 123 #45-67',
            city: 'Bogotá',
            department: 'Cundinamarca'
          }
        }

        const mockResponse = {
          data: {
            success: true,
            data: mockPaymentResponse
          }
        }

        mockAxiosInstance.post.mockResolvedValue(mockResponse)

        const result = await transactionsApi.create(createRequest)

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/transactions', createRequest)
        expect(result.success).toBe(true)
        expect(result.data.transaction.id).toBe('txn-123')
        expect(result.data.transaction.status).toBe('APPROVED')
      })

      it('should handle declined transaction', async () => {
        const createRequest: CreateTransactionRequest = {
          productId: 'prod-1',
          quantity: 1,
          customer: {
            email: 'declined@example.com',
            fullName: 'Declined User',
            phone: '+57 301 999 8888'
          },
          delivery: {
            address: 'Carrera 10 #20-30',
            city: 'Medellín',
            department: 'Antioquia'
          },
          card: {
            number: '4000000000000002',
            cardHolder: 'DECLINED USER',
            expMonth: '12',
            expYear: '26',
            cvc: '456'
          }
        }

        const mockPaymentResponse: ProcessPaymentResponse = {
          transaction: {
            id: 'txn-declined',
            customerId: 'cust-2',
            productId: 'prod-1',
            deliveryId: 'del-2',
            quantity: 1,
            productAmount: 50000,
            baseFee: 5000,
            deliveryFee: 3000,
            totalAmount: 58000,
            status: 'DECLINED',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          customer: createRequest.customer,
          delivery: createRequest.delivery
        }

        const mockResponse = {
          data: {
            success: true,
            data: mockPaymentResponse
          }
        }

        mockAxiosInstance.post.mockResolvedValue(mockResponse)

        const result = await transactionsApi.create(createRequest)

        expect(result.data.transaction.status).toBe('DECLINED')
      })

      it('should handle payment error', async () => {
        const createRequest: CreateTransactionRequest = {
          productId: 'prod-1',
          quantity: 1,
          customer: {
            email: 'error@example.com',
            fullName: 'Error User',
            phone: '+57 300 111 2222'
          },
          delivery: {
            address: 'Calle Error',
            city: 'Cali',
            department: 'Valle'
          },
          card: {
            number: '4000000000000119',
            cardHolder: 'ERROR USER',
            expMonth: '12',
            expYear: '25',
            cvc: '123'
          }
        }

        const errorMessage = 'Payment processing failed'
        mockAxiosInstance.post.mockRejectedValue(new Error(errorMessage))

        await expect(transactionsApi.create(createRequest)).rejects.toThrow(errorMessage)
      })

      it('should handle invalid card error', async () => {
        const createRequest: CreateTransactionRequest = {
          productId: 'prod-1',
          quantity: 1,
          customer: {
            email: 'test@example.com',
            fullName: 'Test User',
            phone: '+57 300 123 4567'
          },
          delivery: {
            address: 'Calle 123',
            city: 'Bogotá',
            department: 'Cundinamarca'
          },
          card: {
            number: '1234567890123456',
            cardHolder: 'TEST USER',
            expMonth: '12',
            expYear: '25',
            cvc: '123'
          }
        }

        const errorMessage = 'Invalid card number'
        mockAxiosInstance.post.mockRejectedValue(new Error(errorMessage))

        await expect(transactionsApi.create(createRequest)).rejects.toThrow(errorMessage)
      })

      it('should handle network timeout', async () => {
        const createRequest: CreateTransactionRequest = {
          productId: 'prod-1',
          quantity: 1,
          customer: {
            email: 'test@example.com',
            fullName: 'Test User',
            phone: '+57 300 123 4567'
          },
          delivery: {
            address: 'Calle 123',
            city: 'Bogotá',
            department: 'Cundinamarca'
          },
          card: {
            number: '4242424242424242',
            cardHolder: 'TEST USER',
            expMonth: '12',
            expYear: '25',
            cvc: '123'
          }
        }

        const errorMessage = 'Network timeout'
        mockAxiosInstance.post.mockRejectedValue(new Error(errorMessage))

        await expect(transactionsApi.create(createRequest)).rejects.toThrow(errorMessage)
      })
    })

    describe('getById', () => {
      it('should fetch transaction by id successfully', async () => {
        const mockTransaction: Transaction = {
          id: 'txn-123',
          customerId: 'cust-1',
          productId: 'prod-1',
          deliveryId: 'del-1',
          quantity: 2,
          productAmount: 100000,
          baseFee: 10000,
          deliveryFee: 5000,
          totalAmount: 115000,
          status: 'APPROVED',
          businessTransactionId: 'biz-txn-456',
          businessReference: 'REF-001',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }

        const mockResponse = {
          data: {
            success: true,
            data: mockTransaction
          }
        }

        mockAxiosInstance.get.mockResolvedValue(mockResponse)

        const result = await transactionsApi.getById('txn-123')

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/transactions/txn-123')
        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockTransaction)
        expect(result.data.status).toBe('APPROVED')
      })

      it('should handle pending transaction', async () => {
        const mockTransaction: Transaction = {
          id: 'txn-pending',
          customerId: 'cust-2',
          productId: 'prod-2',
          deliveryId: 'del-2',
          quantity: 1,
          productAmount: 50000,
          baseFee: 5000,
          deliveryFee: 0,
          totalAmount: 55000,
          status: 'PENDING',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }

        const mockResponse = {
          data: {
            success: true,
            data: mockTransaction
          }
        }

        mockAxiosInstance.get.mockResolvedValue(mockResponse)

        const result = await transactionsApi.getById('txn-pending')

        expect(result.data.status).toBe('PENDING')
      })

      it('should handle declined transaction', async () => {
        const mockTransaction: Transaction = {
          id: 'txn-declined',
          customerId: 'cust-3',
          productId: 'prod-3',
          deliveryId: 'del-3',
          quantity: 3,
          productAmount: 150000,
          baseFee: 15000,
          deliveryFee: 10000,
          totalAmount: 175000,
          status: 'DECLINED',
          errorMessage: 'Insufficient funds',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }

        const mockResponse = {
          data: {
            success: true,
            data: mockTransaction
          }
        }

        mockAxiosInstance.get.mockResolvedValue(mockResponse)

        const result = await transactionsApi.getById('txn-declined')

        expect(result.data.status).toBe('DECLINED')
        expect(result.data.errorMessage).toBe('Insufficient funds')
      })

      it('should handle transaction not found', async () => {
        const errorMessage = 'Transaction not found'
        mockAxiosInstance.get.mockRejectedValue(new Error(errorMessage))

        await expect(transactionsApi.getById('non-existent')).rejects.toThrow(errorMessage)
      })

      it('should handle different transaction IDs', async () => {
        const mockTransaction: Transaction = {
          id: 'txn-xyz-789',
          customerId: 'cust-4',
          productId: 'prod-4',
          deliveryId: 'del-4',
          quantity: 5,
          productAmount: 250000,
          baseFee: 25000,
          deliveryFee: 15000,
          totalAmount: 290000,
          status: 'APPROVED',
          businessTransactionId: 'biz-txn-xyz',
          businessReference: 'REF-XYZ',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }

        const mockResponse = {
          data: {
            success: true,
            data: mockTransaction
          }
        }

        mockAxiosInstance.get.mockResolvedValue(mockResponse)

        const result = await transactionsApi.getById('txn-xyz-789')

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/transactions/txn-xyz-789')
        expect(result.data.id).toBe('txn-xyz-789')
      })
    })
  })
})
