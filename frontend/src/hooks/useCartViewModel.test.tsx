import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { BrowserRouter } from 'react-router-dom'
import { useCartViewModel } from './useCartViewModel'
import cartReducer, { addToCart } from '../features/cart/cartSlice'
import notificationsReducer from '../features/notifications/notificationSlice'
import type { ReactNode } from 'react'

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

const createWrapper = (initialState = {}) => {
  const store = configureStore({
    reducer: {
      cart: cartReducer,
      notifications: notificationsReducer
    },
    preloadedState: initialState
  })

  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  )
}

describe('useCartViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return initial state with empty cart', () => {
    const { result } = renderHook(() => useCartViewModel(), {
      wrapper: createWrapper()
    })

    expect(result.current.cartItems).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.estimatedShipping).toBe(83630)
  })

  it('should return cart items and total when cart has products', () => {
    const store = configureStore({
      reducer: {
        cart: cartReducer,
        notifications: notificationsReducer
      }
    })

    const mockProduct = {
      id: 'product-1',
      name: 'Test Product',
      price: 100000,
      description: 'Test description',
      stock: 10,
      imageUrl: 'test.jpg'
    }

    store.dispatch(addToCart({ product: mockProduct, quantity: 2 }))

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    )

    const { result } = renderHook(() => useCartViewModel(), { wrapper })

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].product.id).toBe('product-1')
    expect(result.current.cartItems[0].quantity).toBe(2)
    expect(result.current.total).toBe(200000)
  })

  describe('handleQuantityChange', () => {
    it('should update quantity when valid', () => {
      const store = configureStore({
        reducer: {
          cart: cartReducer,
          notifications: notificationsReducer
        }
      })

      const mockProduct = {
        id: 'product-1',
        name: 'Test Product',
        price: 100000,
        description: 'Test description',
        stock: 10,
        imageUrl: 'test.jpg'
      }

      store.dispatch(addToCart({ product: mockProduct, quantity: 2 }))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCartViewModel(), { wrapper })

      act(() => {
        result.current.handleQuantityChange('product-1', 5)
      })

      expect(result.current.cartItems[0].quantity).toBe(5)
      expect(result.current.total).toBe(500000)
    })

    it('should not update quantity when less than 1', () => {
      const store = configureStore({
        reducer: {
          cart: cartReducer,
          notifications: notificationsReducer
        }
      })

      const mockProduct = {
        id: 'product-1',
        name: 'Test Product',
        price: 100000,
        description: 'Test description',
        stock: 10,
        imageUrl: 'test.jpg'
      }

      store.dispatch(addToCart({ product: mockProduct, quantity: 2 }))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCartViewModel(), { wrapper })

      act(() => {
        result.current.handleQuantityChange('product-1', 0)
      })

      expect(result.current.cartItems[0].quantity).toBe(2)
    })

    it('should not update quantity when negative', () => {
      const store = configureStore({
        reducer: {
          cart: cartReducer,
          notifications: notificationsReducer
        }
      })

      const mockProduct = {
        id: 'product-1',
        name: 'Test Product',
        price: 100000,
        description: 'Test description',
        stock: 10,
        imageUrl: 'test.jpg'
      }

      store.dispatch(addToCart({ product: mockProduct, quantity: 2 }))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCartViewModel(), { wrapper })

      act(() => {
        result.current.handleQuantityChange('product-1', -1)
      })

      expect(result.current.cartItems[0].quantity).toBe(2)
    })
  })

  describe('handleRemove', () => {
    it('should remove product from cart and show notification', () => {
      const store = configureStore({
        reducer: {
          cart: cartReducer,
          notifications: notificationsReducer
        }
      })

      const mockProduct = {
        id: 'product-1',
        name: 'Test Product',
        price: 100000,
        description: 'Test description',
        stock: 10,
        imageUrl: 'test.jpg'
      }

      store.dispatch(addToCart({ product: mockProduct, quantity: 2 }))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCartViewModel(), { wrapper })

      expect(result.current.cartItems).toHaveLength(1)

      act(() => {
        result.current.handleRemove('product-1', 'Test Product')
      })

      expect(result.current.cartItems).toHaveLength(0)
      expect(result.current.total).toBe(0)
    })
  })

  describe('handleCheckout', () => {
    it('should navigate to checkout when cart has items', () => {
      const store = configureStore({
        reducer: {
          cart: cartReducer,
          notifications: notificationsReducer
        }
      })

      const mockProduct = {
        id: 'product-1',
        name: 'Test Product',
        price: 100000,
        description: 'Test description',
        stock: 10,
        imageUrl: 'test.jpg'
      }

      store.dispatch(addToCart({ product: mockProduct, quantity: 1 }))

      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      )

      const { result } = renderHook(() => useCartViewModel(), { wrapper })

      act(() => {
        result.current.handleCheckout()
      })

      act(() => {
        jest.advanceTimersByTime(500)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/checkout')
    })

    it('should not navigate when cart is empty', () => {
      const { result } = renderHook(() => useCartViewModel(), {
        wrapper: createWrapper()
      })

      act(() => {
        result.current.handleCheckout()
      })

      act(() => {
        jest.advanceTimersByTime(500)
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
})
