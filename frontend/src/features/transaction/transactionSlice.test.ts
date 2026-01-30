import { configureStore, type EnhancedStore } from '@reduxjs/toolkit'
import * as api from '../../services/api'
import type { CreateTransactionRequest, ProcessPaymentResponse, Transaction } from '../../types'
import transactionReducer, {
  checkTransactionStatus,
  clearTransaction,
  fetchTransaction,
  processPayment,
  resetTransactionState,
  selectIsPaymentApproved,
  selectIsPaymentDeclined,
  selectTransaction,
  selectTransactionError,
  selectTransactionStatus,
  setTransaction,
  updateTransactionStatus
} from './transactionSlice'

jest.mock('../../services/api')

const transactionsApi = api.transactionsApi

interface TransactionState {
  current: Transaction | null
  status: 'idle' | 'loading' | 'checking' | 'succeeded' | 'failed'
  error: string | null
  paymentResponse: ProcessPaymentResponse | null
}

interface RootState {
  transaction: TransactionState
}

describe('transactionSlice', () => {
  let store: EnhancedStore<RootState>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        transaction: transactionReducer
      }
    })
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().transaction
      expect(state).toEqual({
        current: null,
        status: 'idle',
        error: null,
        paymentResponse: null
      })
    })
  })

  describe('processPayment async thunk', () => {
    const mockRequest: CreateTransactionRequest = {
      customer: {
        email: 'test@example.com',
        fullName: 'Test User',
        phone: '1234567890'
      },
      delivery: {
        address: '123 Test St',
        city: 'Test City',
        department: 'Test Department'
      },
      card: {
        number: '4111111111111111',
        cvc: '123',
        expMonth: '12',
        expYear: '2025',
        cardHolder: 'Test User'
      },
      productId: 'product-1',
      quantity: 2
    }

    const mockTransaction: Transaction = {
      id: 'transaction-1',
      status: 'PENDING',
      productAmount: 500000,
      baseFee: 500000,
      deliveryFee: 1000000,
      totalAmount: 2000000,
      customerId: 'customer-1',
      deliveryId: 'delivery-1',
      productId: 'product-1',
      quantity: 2,
      businessTransactionId: 'business-123',
      businessReference: 'ref-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const mockPaymentResponse: ProcessPaymentResponse = {
      transaction: mockTransaction,
      customer: {
        email: 'test@example.com',
        fullName: 'Test User',
        phone: '1234567890'
      },
      delivery: {
        address: '123 Test St',
        city: 'Test City',
        department: 'Test Department'
      }
    }

    it('should handle processPayment.pending', () => {
      store.dispatch({ type: processPayment.pending.type })
      const state = store.getState().transaction
      expect(state.status).toBe('loading')
      expect(state.error).toBeNull()
    })

    it('should handle processPayment.fulfilled', async () => {
      jest.spyOn(transactionsApi, 'create').mockResolvedValue({
        data: mockPaymentResponse
      } as never)

      await store.dispatch(processPayment(mockRequest) as never)
      const state = store.getState().transaction

      expect(state.status).toBe('succeeded')
      expect(state.current).toEqual(mockTransaction)
      expect(state.paymentResponse).toEqual(mockPaymentResponse)
      expect(state.error).toBeNull()
    })

    it('should handle processPayment.rejected', async () => {
      const errorMessage = 'Payment failed'
      jest.spyOn(transactionsApi, 'create').mockRejectedValue(new Error(errorMessage))

      await store.dispatch(processPayment(mockRequest) as never)

      await store.dispatch(processPayment(mockRequest) as never)
      const state = store.getState().transaction

      expect(state.status).toBe('failed')
      expect(state.error).toBe(errorMessage)
      expect(state.current).toBeNull()
      expect(state.paymentResponse).toBeNull()
    })

    it('should handle processPayment.rejected with default error message', async () => {
      jest.spyOn(transactionsApi, 'create').mockRejectedValue({})

      await store.dispatch(processPayment(mockRequest) as never)

      await store.dispatch(processPayment(mockRequest) as never)
      const state = store.getState().transaction

      expect(state.status).toBe('failed')
      expect(state.error).toBe('Payment processing failed')
    })
  })

  describe('checkTransactionStatus async thunk', () => {
    const mockTransaction: Transaction = {
      id: 'transaction-1',
      status: 'APPROVED',
      productAmount: 500000,
      baseFee: 500000,
      deliveryFee: 1000000,
      totalAmount: 2000000,
      customerId: 'customer-1',
      deliveryId: 'delivery-1',
      productId: 'product-1',
      quantity: 2,
      businessTransactionId: 'business-123',
      businessReference: 'ref-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    it('should handle checkTransactionStatus.pending', () => {
      store.dispatch({ type: checkTransactionStatus.pending.type })
      const state = store.getState().transaction
      expect(state.status).toBe('checking')
      expect(state.error).toBeNull()
    })

    it('should handle checkTransactionStatus.fulfilled', async () => {
      jest.spyOn(transactionsApi, 'getById').mockResolvedValue({
        data: mockTransaction
      } as never)

      await store.dispatch(checkTransactionStatus('transaction-1') as never)
      const state = store.getState().transaction

      expect(state.status).toBe('succeeded')
      expect(state.current).toEqual(mockTransaction)
      expect(state.error).toBeNull()
    })

    it('should handle checkTransactionStatus.rejected', async () => {
      const errorMessage = 'Status check failed'
      jest.spyOn(transactionsApi, 'getById').mockRejectedValue(new Error(errorMessage))

      await store.dispatch(checkTransactionStatus('transaction-1') as never)
      const state = store.getState().transaction

      expect(state.status).toBe('failed')
      expect(state.error).toBe(errorMessage)
    })

    it('should handle checkTransactionStatus.rejected with default error message', async () => {
      jest.spyOn(transactionsApi, 'getById').mockRejectedValue({})

      await store.dispatch(checkTransactionStatus('transaction-1') as never)
      const state = store.getState().transaction

      expect(state.status).toBe('failed')
      expect(state.error).toBe('Failed to check transaction status')
    })
  })

  describe('fetchTransaction async thunk', () => {
    const mockTransaction: Transaction = {
      id: 'transaction-1',
      status: 'DECLINED',
      productAmount: 500000,
      baseFee: 500000,
      deliveryFee: 1000000,
      totalAmount: 2000000,
      customerId: 'customer-1',
      deliveryId: 'delivery-1',
      productId: 'product-1',
      quantity: 2,
      businessTransactionId: 'business-123',
      businessReference: 'ref-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    it('should handle fetchTransaction.pending', () => {
      store.dispatch({ type: fetchTransaction.pending.type })
      const state = store.getState().transaction
      expect(state.status).toBe('loading')
      expect(state.error).toBeNull()
    })

    it('should handle fetchTransaction.fulfilled', async () => {
      jest.spyOn(transactionsApi, 'getById').mockResolvedValue({
        data: mockTransaction
      } as never)

      await store.dispatch(fetchTransaction('transaction-1') as never)
      const state = store.getState().transaction

      expect(state.status).toBe('succeeded')
      expect(state.current).toEqual(mockTransaction)
      expect(state.error).toBeNull()
    })

    it('should handle fetchTransaction.rejected', async () => {
      const errorMessage = 'Fetch failed'
      jest.spyOn(transactionsApi, 'getById').mockRejectedValue(new Error(errorMessage))

      await store.dispatch(fetchTransaction('transaction-1') as never)
      const state = store.getState().transaction

      expect(state.status).toBe('failed')
      expect(state.error).toBe(errorMessage)
    })

    it('should handle fetchTransaction.rejected with default error message', async () => {
      jest.spyOn(transactionsApi, 'getById').mockRejectedValue({})

      await store.dispatch(fetchTransaction('transaction-1') as never)
      const state = store.getState().transaction

      expect(state.status).toBe('failed')
      expect(state.error).toBe('Failed to fetch transaction')
    })
  })

  describe('synchronous reducers', () => {
    const mockTransaction: Transaction = {
      id: 'transaction-1',
      status: 'PENDING',
      productAmount: 500000,
      baseFee: 500000,
      deliveryFee: 1000000,
      totalAmount: 2000000,
      customerId: 'customer-1',
      deliveryId: 'delivery-1',
      productId: 'product-1',
      quantity: 2,
      businessTransactionId: 'business-123',
      businessReference: 'ref-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    describe('setTransaction', () => {
      it('should set the current transaction', () => {
        store.dispatch(setTransaction(mockTransaction))
        const state = store.getState().transaction

        expect(state.current).toEqual(mockTransaction)
      })

      it('should replace existing transaction', () => {
        store.dispatch(setTransaction(mockTransaction))
        const newTransaction = {
          ...mockTransaction,
          id: 'transaction-2',
          status: 'APPROVED' as const
        }
        store.dispatch(setTransaction(newTransaction))
        const state = store.getState().transaction

        expect(state.current).toEqual(newTransaction)
      })
    })

    describe('updateTransactionStatus', () => {
      it('should update transaction status when transaction exists', () => {
        store.dispatch(setTransaction(mockTransaction))
        store.dispatch(updateTransactionStatus('APPROVED'))
        const state = store.getState().transaction

        expect(state.current?.status).toBe('APPROVED')
      })

      it('should not update status when no transaction exists', () => {
        store.dispatch(updateTransactionStatus('APPROVED'))
        const state = store.getState().transaction

        expect(state.current).toBeNull()
      })
    })

    describe('clearTransaction', () => {
      it('should clear current transaction', () => {
        store.dispatch(setTransaction(mockTransaction))
        store.dispatch(clearTransaction())
        const state = store.getState().transaction

        expect(state.current).toBeNull()
      })

      it('should keep other state properties unchanged', () => {
        store.dispatch(setTransaction(mockTransaction))
        store.dispatch(clearTransaction())
        const state = store.getState().transaction

        expect(state.current).toBeNull()
        expect(state.status).toBe('idle')
      })
    })

    describe('resetTransactionState', () => {
      it('should reset entire state to initial values', () => {
        const mockPaymentResponse: ProcessPaymentResponse = {
          transaction: mockTransaction,
          customer: {
            email: 'test@example.com',
            fullName: 'Test User',
            phone: '1234567890'
          },
          delivery: {
            address: '123 Test St',
            city: 'Test City',
            department: 'Test Department'
          }
        }

        store.dispatch(setTransaction(mockTransaction))
        store.dispatch({ type: processPayment.fulfilled.type, payload: mockPaymentResponse })
        store.dispatch(resetTransactionState())
        const state = store.getState().transaction

        expect(state).toEqual({
          current: null,
          status: 'idle',
          error: null,
          paymentResponse: null
        })
      })
    })
  })

  describe('selectors', () => {
    const mockTransaction: Transaction = {
      id: 'transaction-1',
      status: 'APPROVED',
      productAmount: 500000,
      baseFee: 500000,
      deliveryFee: 1000000,
      totalAmount: 2000000,
      customerId: 'customer-1',
      deliveryId: 'delivery-1',
      productId: 'product-1',
      quantity: 2,
      businessTransactionId: 'business-123',
      businessReference: 'ref-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    describe('selectTransaction', () => {
      it('should return null when no transaction', () => {
        const state = store.getState()
        expect(selectTransaction(state)).toBeNull()
      })

      it('should return current transaction', () => {
        store.dispatch(setTransaction(mockTransaction))
        const state = store.getState()
        expect(selectTransaction(state)).toEqual(mockTransaction)
      })
    })

    describe('selectTransactionStatus', () => {
      it('should return initial status', () => {
        const state = store.getState()
        expect(selectTransactionStatus(state)).toBe('idle')
      })

      it('should return loading status', () => {
        store.dispatch({ type: processPayment.pending.type })
        const state = store.getState()
        expect(selectTransactionStatus(state)).toBe('loading')
      })

      it('should return checking status', () => {
        store.dispatch({ type: checkTransactionStatus.pending.type })
        const state = store.getState()
        expect(selectTransactionStatus(state)).toBe('checking')
      })

      it('should return succeeded status', () => {
        store.dispatch(setTransaction(mockTransaction))
        const state = store.getState()
        expect(selectTransactionStatus(state)).toBe('idle')
      })

      it('should return failed status', () => {
        store.dispatch({ type: processPayment.rejected.type, error: { message: 'Error' } })
        const state = store.getState()
        expect(selectTransactionStatus(state)).toBe('failed')
      })
    })

    describe('selectTransactionError', () => {
      it('should return null when no error', () => {
        const state = store.getState()
        expect(selectTransactionError(state)).toBeNull()
      })

      it('should return error message', () => {
        store.dispatch({ type: processPayment.rejected.type, error: { message: 'Payment failed' } })
        const state = store.getState()
        expect(selectTransactionError(state)).toBe('Payment failed')
      })
    })

    describe('selectIsPaymentApproved', () => {
      it('should return false when no transaction', () => {
        const state = store.getState()
        expect(selectIsPaymentApproved(state)).toBe(false)
      })

      it('should return true when status is APPROVED', () => {
        const approvedTransaction = { ...mockTransaction, status: 'APPROVED' as const }
        store.dispatch(setTransaction(approvedTransaction))
        const state = store.getState()
        expect(selectIsPaymentApproved(state)).toBe(true)
      })

      it('should return false when status is PENDING', () => {
        const pendingTransaction = { ...mockTransaction, status: 'PENDING' as const }
        store.dispatch(setTransaction(pendingTransaction))
        const state = store.getState()
        expect(selectIsPaymentApproved(state)).toBe(false)
      })

      it('should return false when status is DECLINED', () => {
        const declinedTransaction = { ...mockTransaction, status: 'DECLINED' as const }
        store.dispatch(setTransaction(declinedTransaction))
        const state = store.getState()
        expect(selectIsPaymentApproved(state)).toBe(false)
      })
    })

    describe('selectIsPaymentDeclined', () => {
      it('should return false when no transaction', () => {
        const state = store.getState()
        expect(selectIsPaymentDeclined(state)).toBe(false)
      })

      it('should return true when status is DECLINED', () => {
        const declinedTransaction = { ...mockTransaction, status: 'DECLINED' as const }
        store.dispatch(setTransaction(declinedTransaction))
        const state = store.getState()
        expect(selectIsPaymentDeclined(state)).toBe(true)
      })

      it('should return false when status is APPROVED', () => {
        const approvedTransaction = { ...mockTransaction, status: 'APPROVED' as const }
        store.dispatch(setTransaction(approvedTransaction))
        const state = store.getState()
        expect(selectIsPaymentDeclined(state)).toBe(false)
      })

      it('should return false when status is PENDING', () => {
        const pendingTransaction = { ...mockTransaction, status: 'PENDING' as const }
        store.dispatch(setTransaction(pendingTransaction))
        const state = store.getState()
        expect(selectIsPaymentDeclined(state)).toBe(false)
      })
    })
  })
})
