import { configureStore } from '@reduxjs/toolkit'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import cartReducer from '../features/cart/cartSlice'
import checkoutReducer, { setProduct, setQuantity } from '../features/checkout/checkoutSlice'
import transactionReducer from '../features/transaction/transactionSlice'
import { useCheckoutViewModel } from './useCheckoutViewModel'

jest.mock('../services/api')

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

const mockProduct = {
  id: 'product-1',
  name: 'Test Product',
  price: 100000,
  description: 'Test description',
  stock: 10,
  imageUrl: 'test.jpg'
}

const createWrapper = (preloadedState = {}) => {
  const store = configureStore({
    reducer: {
      checkout: checkoutReducer,
      cart: cartReducer,
      transaction: transactionReducer
    },
    preloadedState
  })

  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  )
}

describe('useCheckoutViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    it('should redirect to home when no product', () => {
      renderHook(() => useCheckoutViewModel(), {
        wrapper: createWrapper()
      })

      expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('should not redirect when product exists', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))
      store.dispatch(setQuantity(2))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      renderHook(() => useCheckoutViewModel(), { wrapper })

      expect(mockNavigate).not.toHaveBeenCalledWith('/')
    })

    it('should initialize with default form values', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      expect(result.current.customerForm.fullName).toBe('Juan Carlos Pérez')
      expect(result.current.customerForm.email).toBe('juancarlos@example.com')
      expect(result.current.deliveryForm.city).toBe('Bogotá')
    })

    it('should initialize collapse states as open', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      expect(result.current.isOrderOpen).toBe(true)
      expect(result.current.isCustomerOpen).toBe(true)
      expect(result.current.isDeliveryOpen).toBe(true)
      expect(result.current.isPaymentOpen).toBe(true)
    })
  })

  describe('computed values', () => {
    it('should calculate subtotal from product price', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))
      store.dispatch(setQuantity(3))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      expect(result.current.subtotal).toBe(300000)
      expect(result.current.itemsCount).toBe(3)
    })

    it('should calculate total with shipping fee', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))
      store.dispatch(setQuantity(2))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      expect(result.current.subtotal).toBe(200000)
      expect(result.current.shippingFee).toBe(10000)
      expect(result.current.total).toBe(210000)
    })
  })

  describe('collapse state handlers', () => {
    it('should toggle order section', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      expect(result.current.isOrderOpen).toBe(true)

      act(() => {
        result.current.setIsOrderOpen(false)
      })

      expect(result.current.isOrderOpen).toBe(false)
    })

    it('should toggle customer section', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      act(() => {
        result.current.setIsCustomerOpen(false)
      })

      expect(result.current.isCustomerOpen).toBe(false)
    })
  })

  describe('form handlers', () => {
    it('should update customer form', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      const newCustomer = {
        fullName: 'Maria Lopez',
        email: 'maria@test.com',
        phone: '+57 300 123 4567'
      }

      act(() => {
        result.current.setCustomerForm(newCustomer)
      })

      expect(result.current.customerForm).toEqual(newCustomer)
    })

    it('should update delivery form', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      const newDelivery = {
        address: 'New Address 123',
        city: 'Medellín',
        department: 'Antioquia',
        zipCode: '050001'
      }

      act(() => {
        result.current.setDeliveryForm(newDelivery)
      })

      expect(result.current.deliveryForm).toEqual(newDelivery)
    })
  })

  describe('card number handling', () => {
    it('should format card number with spaces', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      act(() => {
        result.current.handleCardNumberChange('4111111111111111')
      })

      expect(result.current.cardNumber).toBe('4111 1111 1111 1111')
    })

    it('should detect card brand', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      act(() => {
        result.current.handleCardNumberChange('4111111111111111')
      })

      expect(result.current.detectedCardBrand).toBe('visa')
    })
  })

  describe('expiry date handling', () => {
    it('should format expiry date', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      act(() => {
        result.current.handleExpiryChange('1225')
      })

      expect(result.current.expiryDate).toBe('12/25')
    })
  })

  describe('payment method selection', () => {
    it('should select payment method', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      expect(result.current.selectedPaymentMethod).toBeNull()

      act(() => {
        result.current.handlePaymentMethodSelect('credit-card')
      })

      expect(result.current.selectedPaymentMethod).toBe('credit-card')
    })
  })

  describe('form validation', () => {
    it('should validate complete form', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      act(() => {
        result.current.handlePaymentMethodSelect('credit-card')
        result.current.setAcceptedTerms(true)
      })

      expect(result.current.isFormValid()).toBe(true)
    })

    it('should fail validation without payment method', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      act(() => {
        result.current.setAcceptedTerms(true)
      })

      expect(result.current.isFormValid()).toBe(false)
    })

    it('should fail validation without accepted terms', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      act(() => {
        result.current.handlePaymentMethodSelect('credit-card')
      })

      expect(result.current.isFormValid()).toBe(false)
    })
  })

  describe('installments', () => {
    it('should set installments', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      expect(result.current.installments).toBe(1)

      act(() => {
        result.current.setInstallments(6)
      })

      expect(result.current.installments).toBe(6)
    })
  })

  describe('modal handling', () => {
    it('should open card modal when payment method is credit-card', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      act(() => {
        result.current.handlePaymentMethodSelect('credit-card')
        result.current.setAcceptedTerms(true)
      })

      expect(result.current.isCardModalOpen).toBe(false)

      act(() => {
        result.current.handlePaymentSubmit()
      })

      expect(result.current.isCardModalOpen).toBe(true)
    })

    it('should close modal', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      act(() => {
        result.current.setIsCardModalOpen(true)
      })

      expect(result.current.isCardModalOpen).toBe(true)

      act(() => {
        result.current.handleCloseModal()
      })

      expect(result.current.isCardModalOpen).toBe(false)
      expect(result.current.paymentFlow).toBe('idle')
    })
  })

  describe('payment flow state', () => {
    it('should initialize with idle payment flow', () => {
      const store = configureStore({
        reducer: {
          checkout: checkoutReducer,
          cart: cartReducer,
          transaction: transactionReducer
        }
      })

      store.dispatch(setProduct(mockProduct))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCheckoutViewModel(), { wrapper })

      expect(result.current.paymentFlow).toBe('idle')
    })
  })
})
