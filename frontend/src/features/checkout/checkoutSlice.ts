import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  CheckoutStep,
  Product,
  Customer,
  DeliveryInfo,
  CreditCardData,
  Fees,
} from '../../types';

interface CheckoutState {
  step: CheckoutStep;
  product: Product | null;
  quantity: number;
  customer: Customer | null;
  delivery: DeliveryInfo | null;
  creditCard: CreditCardData | null;
  fees: Fees;
  installments: number;
}

const initialState: CheckoutState = {
  step: 'product',
  product: null,
  quantity: 1,
  customer: null,
  delivery: null,
  creditCard: null,
  fees: {
    baseFee: 5000, // 5000 COP
    deliveryFee: 10000, // 10000 COP
  },
  installments: 1,
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
    setInstallments: (state, action: PayloadAction<number>) => {
      state.installments = action.payload;
    },
    setFees: (state, action: PayloadAction<Fees>) => {
      state.fees = action.payload;
    },
    nextStep: (state) => {
      const steps: CheckoutStep[] = ['product', 'payment', 'summary', 'result'];
      const currentIndex = steps.indexOf(state.step);
      if (currentIndex < steps.length - 1) {
        state.step = steps[currentIndex + 1];
      }
    },
    previousStep: (state) => {
      const steps: CheckoutStep[] = ['product', 'payment', 'summary', 'result'];
      const currentIndex = steps.indexOf(state.step);
      if (currentIndex > 0) {
        state.step = steps[currentIndex - 1];
      }
    },
    resetCheckout: () => initialState,
    // For recovering from localStorage
    hydrateCheckout: (state, action: PayloadAction<Partial<CheckoutState>>) => {
      return { ...state, ...action.payload };
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
  setInstallments,
  setFees,
  nextStep,
  previousStep,
  resetCheckout,
  hydrateCheckout,
} = checkoutSlice.actions;

// Selectors
export const selectCheckoutStep = (state: { checkout: CheckoutState }) =>
  state.checkout.step;

export const selectCheckoutProduct = (state: { checkout: CheckoutState }) =>
  state.checkout.product;

export const selectCheckoutTotal = (state: { checkout: CheckoutState }) => {
  const { product, quantity, fees } = state.checkout;
  if (!product) return 0;
  return product.price * quantity + fees.baseFee + fees.deliveryFee;
};

export const selectIsCheckoutComplete = (state: { checkout: CheckoutState }) => {
  const { customer, delivery, creditCard } = state.checkout;
  return !!(customer && delivery && creditCard);
};

export default checkoutSlice.reducer;
