import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  Transaction,
  TransactionStatus,
  CreateTransactionRequest,
  ProcessPaymentResponse,
} from '../../types';

interface TransactionState {
  current: Transaction | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  paymentResponse: ProcessPaymentResponse | null;
}

const initialState: TransactionState = {
  current: null,
  status: 'idle',
  error: null,
  paymentResponse: null,
};

// TODO: Replace with real API call when backend is ready
export const processPayment = createAsyncThunk(
  'transaction/processPayment',
  async (request: CreateTransactionRequest): Promise<ProcessPaymentResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate payment - approve if card ends in even number, decline if odd
    const lastDigit = parseInt(request.card.number.slice(-1));
    const isApproved = lastDigit % 2 === 0;

    const transaction: Transaction = {
      id: `txn_${Date.now()}`,
      customerId: `cust_${Date.now()}`,
      productId: request.productId,
      deliveryId: `del_${Date.now()}`,
      quantity: request.quantity,
      productAmount: 5499000 * request.quantity, // dummy price
      baseFee: 5000,
      deliveryFee: 10000,
      totalAmount: (5499000 * request.quantity) + 5000 + 10000,
      status: isApproved ? 'APPROVED' : 'DECLINED',
      wompiTransactionId: isApproved ? `wompi_${Date.now()}` : undefined,
      wompiReference: isApproved ? `REF-${Date.now()}` : undefined,
      paymentMethod: 'CARD',
      cardLastFour: request.card.number.slice(-4),
      errorMessage: isApproved ? undefined : 'Payment declined by issuer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      transaction,
      customer: request.customer,
      delivery: request.delivery,
    };
  }
);

export const fetchTransaction = createAsyncThunk(
  'transaction/fetchTransaction',
  async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return dummy transaction
    const transaction: Transaction = {
      id,
      customerId: 'cust_dummy',
      productId: 'prod_dummy',
      deliveryId: 'del_dummy',
      quantity: 1,
      productAmount: 5499000,
      baseFee: 5000,
      deliveryFee: 10000,
      totalAmount: 5514000,
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return transaction;
  }
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setTransaction: (state, action: PayloadAction<Transaction>) => {
      state.current = action.payload;
    },
    updateTransactionStatus: (
      state,
      action: PayloadAction<TransactionStatus>
    ) => {
      if (state.current) {
        state.current.status = action.payload;
      }
    },
    clearTransaction: (state) => {
      state.current = null;
      state.status = 'idle';
      state.error = null;
      state.paymentResponse = null;
    },
    resetTransactionState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(processPayment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload.transaction;
        state.paymentResponse = action.payload;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Payment processing failed';
      })
      .addCase(fetchTransaction.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTransaction.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchTransaction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch transaction';
      });
  },
});

export const {
  setTransaction,
  updateTransactionStatus,
  clearTransaction,
  resetTransactionState,
} = transactionSlice.actions;

// Selectors
export const selectTransaction = (state: { transaction: TransactionState }) =>
  state.transaction.current;

export const selectTransactionStatus = (state: {
  transaction: TransactionState;
}) => state.transaction.status;

export const selectTransactionError = (state: {
  transaction: TransactionState;
}) => state.transaction.error;

export const selectIsPaymentApproved = (state: {
  transaction: TransactionState;
}) => state.transaction.current?.status === 'APPROVED';

export const selectIsPaymentDeclined = (state: {
  transaction: TransactionState;
}) => state.transaction.current?.status === 'DECLINED';

export default transactionSlice.reducer;
