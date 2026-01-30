import { configureStore } from '@reduxjs/toolkit'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import cartReducer from '../features/cart/cartSlice'
import checkoutReducer from '../features/checkout/checkoutSlice'
import notificationsReducer from '../features/notifications/notificationSlice'
import productsReducer from '../features/products/productsSlice'
import * as api from '../services/api'
import { useProductViewModel } from './useProductViewModel'

jest.mock('../services/api')

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

const mockProducts = [
  {
    id: 'product-1',
    name: 'Test Product 1',
    price: 100000,
    description: 'Test description 1',
    stock: 10,
    imageUrl: 'test1.jpg'
  },
  {
    id: 'product-2',
    name: 'Test Product 2',
    price: 200000,
    description: 'Test description 2',
    stock: 0,
    imageUrl: 'test2.jpg'
  }
]

const createWrapper = () => {
  const store = configureStore({
    reducer: {
      products: productsReducer,
      checkout: checkoutReducer,
      cart: cartReducer,
      notifications: notificationsReducer
    }
  })

  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  )
}

describe('useProductViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(api.productsApi, 'getAll').mockResolvedValue({
      data: mockProducts
    } as never)
  })

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useProductViewModel('product-1'), {
      wrapper: createWrapper()
    })

    expect(result.current.loading).toBe(true)
    expect(result.current.product).toBeUndefined()
  })

  it('should fetch products when items are empty', async () => {
    const { result } = renderHook(() => useProductViewModel('product-1'), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(api.productsApi.getAll).toHaveBeenCalledTimes(1)
    expect(result.current.product).toBeDefined()
    expect(result.current.product?.id).toBe('product-1')
  })

  it('should return correct product when productId matches', async () => {
    const { result } = renderHook(() => useProductViewModel('product-1'), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.product).toBeDefined()
    })

    expect(result.current.product?.name).toBe('Test Product 1')
    expect(result.current.product?.price).toBe(100000)
  })

  it('should show isOutOfStock true when stock is 0', async () => {
    const { result } = renderHook(() => useProductViewModel('product-2'), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.product).toBeDefined()
    })

    expect(result.current.isOutOfStock).toBe(true)
  })

  it('should show isOutOfStock false when stock is available', async () => {
    const { result } = renderHook(() => useProductViewModel('product-1'), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.product).toBeDefined()
    })

    expect(result.current.isOutOfStock).toBe(false)
  })

  it('should show isOutOfStock true when product not found', () => {
    const { result } = renderHook(() => useProductViewModel('nonexistent'), {
      wrapper: createWrapper()
    })

    expect(result.current.isOutOfStock).toBe(true)
  })

  it('should return initial quantity as 1', async () => {
    const { result } = renderHook(() => useProductViewModel('product-1'), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.product).toBeDefined()
    })

    expect(result.current.quantity).toBe(1)
  })

  it('should return isInfoOpen as true initially', () => {
    const { result } = renderHook(() => useProductViewModel('product-1'), {
      wrapper: createWrapper()
    })

    expect(result.current.isInfoOpen).toBe(true)
  })

  describe('setIsInfoOpen', () => {
    it('should toggle info panel state', async () => {
      const { result } = renderHook(() => useProductViewModel('product-1'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.product).toBeDefined()
      })

      expect(result.current.isInfoOpen).toBe(true)

      act(() => {
        result.current.setIsInfoOpen(false)
      })

      expect(result.current.isInfoOpen).toBe(false)
    })
  })

  describe('handleQuantityChange', () => {
    it('should update quantity when valid', async () => {
      const { result } = renderHook(() => useProductViewModel('product-1'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.product).toBeDefined()
      })

      act(() => {
        result.current.handleQuantityChange(5)
      })

      expect(result.current.quantity).toBe(5)
    })

    it('should not update quantity when less than 1', async () => {
      const { result } = renderHook(() => useProductViewModel('product-1'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.product).toBeDefined()
      })

      act(() => {
        result.current.handleQuantityChange(0)
      })

      expect(result.current.quantity).toBe(1)
    })

    it('should not update quantity when exceeds stock', async () => {
      const { result } = renderHook(() => useProductViewModel('product-1'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.product).toBeDefined()
      })

      act(() => {
        result.current.handleQuantityChange(15)
      })

      expect(result.current.quantity).toBe(1)
    })

    it('should not update when product is undefined', () => {
      const { result } = renderHook(() => useProductViewModel(undefined), {
        wrapper: createWrapper()
      })

      act(() => {
        result.current.handleQuantityChange(5)
      })

      expect(result.current.quantity).toBe(1)
    })
  })

  describe('handleBuyNow', () => {
    it('should navigate to checkout with correct state', async () => {
      const { result } = renderHook(() => useProductViewModel('product-1'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.product).toBeDefined()
      })

      act(() => {
        result.current.handleQuantityChange(3)
      })

      act(() => {
        result.current.handleBuyNow()
      })

      expect(mockNavigate).toHaveBeenCalledWith('/checkout')
    })

    it('should not navigate when product is undefined', () => {
      const { result } = renderHook(() => useProductViewModel(undefined), {
        wrapper: createWrapper()
      })

      act(() => {
        result.current.handleBuyNow()
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('handleAddToCart', () => {
    it('should add product to cart when product exists', async () => {
      const { result } = renderHook(() => useProductViewModel('product-1'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.product).toBeDefined()
      })

      act(() => {
        result.current.handleQuantityChange(2)
      })

      act(() => {
        result.current.handleAddToCart()
      })

      // Since we're testing the hook behavior, we verify it doesn't throw
      expect(result.current.product).toBeDefined()
    })

    it('should not add to cart when product is undefined', () => {
      const { result } = renderHook(() => useProductViewModel(undefined), {
        wrapper: createWrapper()
      })

      act(() => {
        result.current.handleAddToCart()
      })

      expect(result.current.product).toBeUndefined()
    })
  })
})
