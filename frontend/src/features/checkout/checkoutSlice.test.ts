import type { CreditCardData, Customer, DeliveryInfo, Product } from '../../types'
import checkoutReducer, {
  setCreditCard,
  setCustomer,
  setDelivery,
  setProduct,
  setQuantity,
  setStep
} from './checkoutSlice'

describe('checkoutSlice', () => {
  const initialState = {
    step: 'product' as const,
    product: null,
    quantity: 1,
    customer: null,
    delivery: null,
    creditCard: null
  }

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 10000,
    stock: 50,
    imageUrl: 'https://example.com/image.jpg'
  }

  const mockCustomer: Customer = {
    email: 'test@example.com',
    fullName: 'John Doe',
    phone: '1234567890'
  }

  const mockDelivery: DeliveryInfo = {
    address: '123 Main St',
    city: 'Bogotá',
    department: 'Cundinamarca',
    zipCode: '110111'
  }

  const mockCreditCard: CreditCardData = {
    number: '4111111111111111',
    cardHolder: 'JOHN DOE',
    expMonth: '12',
    expYear: '25',
    cvc: '123'
  }

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(checkoutReducer(undefined, { type: 'unknown' })).toEqual(initialState)
    })

    it('should set checkout step', () => {
      const state = checkoutReducer(initialState, setStep('payment'))
      expect(state.step).toBe('payment')
    })

    it('should set product', () => {
      const state = checkoutReducer(initialState, setProduct(mockProduct))
      expect(state.product).toEqual(mockProduct)
      expect(state.product?.id).toBe('1')
      expect(state.product?.name).toBe('Test Product')
    })

    it('should set quantity', () => {
      const state = checkoutReducer(initialState, setQuantity(5))
      expect(state.quantity).toBe(5)
    })

    it('should set customer', () => {
      const state = checkoutReducer(initialState, setCustomer(mockCustomer))
      expect(state.customer).toEqual(mockCustomer)
      expect(state.customer?.email).toBe('test@example.com')
    })

    it('should set delivery', () => {
      const state = checkoutReducer(initialState, setDelivery(mockDelivery))
      expect(state.delivery).toEqual(mockDelivery)
      expect(state.delivery?.address).toBe('123 Main St')
    })

    it('should set credit card', () => {
      const state = checkoutReducer(initialState, setCreditCard(mockCreditCard))
      expect(state.creditCard).toEqual(mockCreditCard)
      expect(state.creditCard?.number).toBe('4111111111111111')
    })

    it('should handle multiple updates in sequence', () => {
      let state = checkoutReducer(initialState, setProduct(mockProduct))
      state = checkoutReducer(state, setQuantity(3))
      state = checkoutReducer(state, setStep('payment'))
      state = checkoutReducer(state, setCustomer(mockCustomer))

      expect(state.product?.id).toBe('1')
      expect(state.quantity).toBe(3)
      expect(state.step).toBe('payment')
      expect(state.customer?.email).toBe('test@example.com')
    })

    it('should allow updating product', () => {
      const firstProduct = { ...mockProduct, id: '1', name: 'First Product' }
      const secondProduct = { ...mockProduct, id: '2', name: 'Second Product' }

      let state = checkoutReducer(initialState, setProduct(firstProduct))
      expect(state.product?.name).toBe('First Product')

      state = checkoutReducer(state, setProduct(secondProduct))
      expect(state.product?.name).toBe('Second Product')
      expect(state.product?.id).toBe('2')
    })

    it('should allow updating quantity multiple times', () => {
      let state = checkoutReducer(initialState, setQuantity(2))
      expect(state.quantity).toBe(2)

      state = checkoutReducer(state, setQuantity(10))
      expect(state.quantity).toBe(10)
    })

    it('should progress through checkout steps', () => {
      let state = checkoutReducer(initialState, setStep('product'))
      expect(state.step).toBe('product')

      state = checkoutReducer(state, setStep('payment'))
      expect(state.step).toBe('payment')

      state = checkoutReducer(state, setStep('summary'))
      expect(state.step).toBe('summary')

      state = checkoutReducer(state, setStep('result'))
      expect(state.step).toBe('result')
    })
  })
})
