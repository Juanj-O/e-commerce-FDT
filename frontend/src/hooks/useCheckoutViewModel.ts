import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectCartItems, selectCartItemsCount, selectCartTotal, type CartItem } from '../features/cart/cartSlice';
import {
  setCreditCard,
  setCustomer,
  setDelivery,
} from '../features/checkout/checkoutSlice';
import { processPayment, checkTransactionStatus, selectTransaction, selectTransactionError, clearTransaction } from '../features/transaction/transactionSlice';
import type { CreditCardData, Customer, DeliveryInfo, Product, Transaction } from '../types';
import {
  detectCardBrand,
  formatCardNumber,
  formatExpiryDate,
  validateCardNumber,
  validateCVC,
  validateExpiryDate,
} from '../utils/cardValidation';

export type PaymentFlowState = 'idle' | 'processing' | 'pending' | 'checking' | 'completed' | 'failed';

export interface CheckoutViewModel {
  // Redux data
  product: Product | null;
  quantity: number;
  cartItems: CartItem[];
  cartItemsCount: number;
  transactionStatus: string;

  // Section collapse states
  isOrderOpen: boolean;
  isCustomerOpen: boolean;
  isDeliveryOpen: boolean;
  isShippingOpen: boolean;
  isPaymentOpen: boolean;
  setIsOrderOpen: (v: boolean) => void;
  setIsCustomerOpen: (v: boolean) => void;
  setIsDeliveryOpen: (v: boolean) => void;
  setIsShippingOpen: (v: boolean) => void;
  setIsPaymentOpen: (v: boolean) => void;

  // Payment state
  selectedPaymentMethod: string | null;
  setSelectedPaymentMethod: (v: string | null) => void;
  isCardModalOpen: boolean;
  setIsCardModalOpen: (v: boolean) => void;
  detectedCardBrand: string;
  acceptedTerms: boolean;
  setAcceptedTerms: (v: boolean) => void;

  // Form states
  customerForm: Customer;
  setCustomerForm: (v: Customer) => void;
  deliveryForm: DeliveryInfo;
  setDeliveryForm: (v: DeliveryInfo) => void;
  cardForm: CreditCardData;
  setCardForm: (v: CreditCardData) => void;
  cardNumber: string;
  expiryDate: string;
  installments: number;
  setInstallments: (v: number) => void;

  // Payment flow
  paymentFlow: PaymentFlowState;
  currentTransaction: Transaction | null;
  transactionError: string | null;

  // Computed
  subtotal: number;
  shippingFee: number;
  total: number;
  itemsCount: number;

  // Handlers
  handleCardNumberChange: (value: string) => void;
  handleExpiryChange: (value: string) => void;
  handlePaymentMethodSelect: (method: string) => void;
  handlePaymentSubmit: () => void;
  handleFinalPayment: () => Promise<void>;
  handleCloseModal: () => void;
  isFormValid: () => boolean;
  isCardFormValid: () => boolean;
}

export const useCheckoutViewModel = (): CheckoutViewModel => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { product, quantity, customer, delivery, creditCard } = useAppSelector(
    (state) => state.checkout
  );
  const { status: transactionStatus } = useAppSelector((state) => state.transaction);

  const cartItems = useAppSelector(selectCartItems);
  const cartItemsCount = useAppSelector(selectCartItemsCount);
  const cartTotal = useAppSelector(selectCartTotal);

  // Section collapse states
  const [isOrderOpen, setIsOrderOpen] = useState(true);
  const [isCustomerOpen, setIsCustomerOpen] = useState(true);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(true);
  const [isShippingOpen, setIsShippingOpen] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(true);

  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [detectedCardBrand, setDetectedCardBrand] = useState<string>('visa');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Form states
  const [customerForm, setCustomerForm] = useState<Customer>(
    customer || {
      fullName: 'Juan Carlos Pérez',
      email: 'juancarlos@example.com',
      phone: '+57 312 456 7890',
    }
  );

  const [deliveryForm, setDeliveryForm] = useState<DeliveryInfo>(
    delivery || {
      address: 'Calle 100 #8A-55, Torre Colpatria, Oficina 1205',
      city: 'Bogotá',
      department: 'Cundinamarca',
      zipCode: '110111',
    }
  );

  const [cardForm, setCardForm] = useState<CreditCardData>(
    creditCard || {
      number: '',
      cardHolder: '',
      expMonth: '',
      expYear: '',
      cvc: '',
    }
  );

  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [installments, setInstallments] = useState<number>(1);

  // Payment flow
  const [paymentFlow, setPaymentFlow] = useState<PaymentFlowState>('idle');
  const currentTransaction = useAppSelector(selectTransaction);
  const transactionError = useAppSelector(selectTransactionError);

  // Redirect if no product
  useEffect(() => {
    if (!product) {
      navigate('/');
    }
  }, [product, navigate]);

  // Computed values
  const subtotal = cartItems.length > 0 ? cartTotal : (product?.price ?? 0) * quantity;
  const shippingFee = 10000;
  const total = subtotal + shippingFee;
  const itemsCount = cartItems.length > 0 ? cartItemsCount : quantity;

  // Handlers
  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    const brand = detectCardBrand(value);
    setCardNumber(formatted);
    setDetectedCardBrand(brand);
    setCardForm({ ...cardForm, number: formatted.replace(/\s/g, '') });
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    setExpiryDate(formatted);
    const [month, year] = formatted.split('/');
    setCardForm({ ...cardForm, expMonth: month || '', expYear: year || '' });
  };

  const isFormValid = () => {
    return !!(
      selectedPaymentMethod &&
      customerForm.fullName &&
      customerForm.email &&
      customerForm.phone &&
      deliveryForm.address &&
      deliveryForm.city &&
      acceptedTerms
    );
  };

  const isCardFormValid = () => {
    return (
      validateCardNumber(cardNumber) &&
      validateExpiryDate(cardForm.expMonth, cardForm.expYear) &&
      validateCVC(cardForm.cvc, 'visa') &&
      acceptedTerms
    );
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handlePaymentSubmit = () => {
    if (!isFormValid()) return;

    if (selectedPaymentMethod === 'credit-card') {
      setIsCardModalOpen(true);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!product) return;

    dispatch(setCustomer(customerForm));
    dispatch(setDelivery(deliveryForm));
    dispatch(setCreditCard(cardForm));

    const cardHolder = (cardForm.cardHolder && cardForm.cardHolder.trim()) ? cardForm.cardHolder.trim() : customerForm.fullName;
    await dispatch(
      processPayment({
        productId: product.id,
        quantity,
        customer: customerForm,
        delivery: deliveryForm,
        card: {
          number: cardForm.number,
          cvc: cardForm.cvc,
          expMonth: cardForm.expMonth,
          expYear: cardForm.expYear,
          cardHolder,
        },
        installments,
      })
    );
  };

  const handleFinalPayment = async () => {
    if (!product) return;
    try {
      setPaymentFlow('processing');
      const cardHolder = (cardForm.cardHolder && cardForm.cardHolder.trim()) ? cardForm.cardHolder.trim() : customerForm.fullName;
      const transactionPayload = {
        productId: product.id,
        quantity,
        customer: customerForm,
        delivery: deliveryForm,
        card: {
          number: cardForm.number,
          cvc: cardForm.cvc,
          expMonth: cardForm.expMonth,
          expYear: cardForm.expYear,
          cardHolder,
        },
        installments,
      };
      const result = await dispatch(processPayment(transactionPayload)).unwrap();
      let transaction = result.transaction;

      if (transaction.status === 'PENDING') {
        setPaymentFlow('pending');

        await new Promise((r) => setTimeout(r, 3000));

        const maxRetries = 10;
        let retries = 0;

        while (retries < maxRetries && transaction.status === 'PENDING') {
          setPaymentFlow('checking');
          const statusResult = await dispatch(checkTransactionStatus(transaction.id)).unwrap();
          transaction = statusResult;

          console.log(`Reintento ${retries + 1}/${maxRetries}: Estado = ${transaction.status}`);

          if (transaction.status === 'PENDING' && retries < maxRetries - 1) {
            setPaymentFlow('pending');
            await new Promise((r) => setTimeout(r, 2000));
          }

          retries++;
        }
      }

      setPaymentFlow('completed');
    } catch (error) {
      console.error('Error en el pago:', error);
      setPaymentFlow('failed');
    }
  };

  const handleCloseModal = () => {
    setIsCardModalOpen(false);
    setPaymentFlow('idle');
    dispatch(clearTransaction());
  };

  return {
    product,
    quantity,
    cartItems,
    cartItemsCount,
    transactionStatus,
    isOrderOpen,
    isCustomerOpen,
    isDeliveryOpen,
    isShippingOpen,
    isPaymentOpen,
    setIsOrderOpen,
    setIsCustomerOpen,
    setIsDeliveryOpen,
    setIsShippingOpen,
    setIsPaymentOpen,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    isCardModalOpen,
    setIsCardModalOpen,
    detectedCardBrand,
    acceptedTerms,
    setAcceptedTerms,
    customerForm,
    setCustomerForm,
    deliveryForm,
    setDeliveryForm,
    cardForm,
    setCardForm,
    cardNumber,
    expiryDate,
    installments,
    setInstallments,
    paymentFlow,
    currentTransaction,
    transactionError,
    subtotal,
    shippingFee,
    total,
    itemsCount,
    handleCardNumberChange,
    handleExpiryChange,
    handlePaymentMethodSelect,
    handlePaymentSubmit,
    handleFinalPayment,
    handleCloseModal,
    isFormValid,
    isCardFormValid,
  };
};
