import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { transactionsApi } from '../../services/api';
import type {
  CreateTransactionRequest,
  ProcessPaymentResponse,
  Transaction,
  TransactionStatus,
} from '../../types';

interface TransactionState {
  current: Transaction | null;
  status: 'idle' | 'loading' | 'checking' | 'succeeded' | 'failed';
  error: string | null;
  paymentResponse: ProcessPaymentResponse | null;
}

const initialState: TransactionState = {
  current: null,
  status: 'idle',
  error: null,
  paymentResponse: null,
};

// Procesar pago con API real
export const processPayment = createAsyncThunk(
  'transaction/processPayment',
  async (request: CreateTransactionRequest): Promise<ProcessPaymentResponse> => {
    const response = await transactionsApi.create(request);
    return response.data;
  }
);

// Consultar estado de la transacción (backend consulta Business y actualiza BD)
export const checkTransactionStatus = createAsyncThunk(
  'transaction/checkStatus',
  async (transactionId: string): Promise<Transaction> => {
    const response = await transactionsApi.getById(transactionId);
    return response.data;
  }
);

// Obtener transacción por ID
export const fetchTransaction = createAsyncThunk(
  'transaction/fetchTransaction',
  async (id: string): Promise<Transaction> => {
    const response = await transactionsApi.getById(id);
    return response.data;
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
      .addCase(checkTransactionStatus.pending, (state) => {
        state.status = 'checking';
        state.error = null;
      })
      .addCase(checkTransactionStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload;
      })
      .addCase(checkTransactionStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to check transaction status';
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
