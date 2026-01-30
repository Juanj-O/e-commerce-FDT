import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  CheckoutStep,
  Product,
  Customer,
  DeliveryInfo,
  CreditCardData,
} from '../../types';

interface CheckoutState {
  step: CheckoutStep;
  product: Product | null;
  quantity: number;
  customer: Customer | null;
  delivery: DeliveryInfo | null;
  creditCard: CreditCardData | null;
}

const initialState: CheckoutState = {
  step: 'product',
  product: null,
  quantity: 1,
  customer: null,
  delivery: null,
  creditCard: null,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<CheckoutStep>) => {
      state.step = action.payload;
    },
    setProduct: (state, action: PayloadAction<Product>) => {
      state.product = action.payload;
    },
    setQuantity: (state, action: PayloadAction<number>) => {
      state.quantity = action.payload;
    },
    setCustomer: (state, action: PayloadAction<Customer>) => {
      state.customer = action.payload;
    },
    setDelivery: (state, action: PayloadAction<DeliveryInfo>) => {
      state.delivery = action.payload;
    },
    setCreditCard: (state, action: PayloadAction<CreditCardData>) => {
      state.creditCard = action.payload;
    },
  },
});

export const {
  setStep,
  setProduct,
  setQuantity,
  setCustomer,
  setDelivery,
  setCreditCard,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
