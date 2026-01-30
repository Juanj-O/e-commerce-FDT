import type { RootState } from '../../app/store'
import type { Product } from '../../types'
import cartReducer, {
  addToCart,
  clearCart,
  removeFromCart,
  selectCartItems,
  selectCartItemsCount,
  selectCartTotal,
  updateQuantity
} from './cartSlice'

describe('cartSlice', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 10000,
    stock: 50,
    imageUrl: 'https://example.com/image.jpg'
  }

  const initialState = {
    items: []
  }

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(cartReducer(undefined, { type: 'unknown' })).toEqual({
        items: []
      })
    })

    it('should add a product to cart', () => {
      const state = cartReducer(initialState, addToCart({ product: mockProduct, quantity: 2 }))
      expect(state.items).toHaveLength(1)
      expect(state.items[0].product.id).toBe('1')
      expect(state.items[0].quantity).toBe(2)
    })

    it('should update quantity when adding existing product', () => {
      const stateWithItem = {
        items: [{ product: mockProduct, quantity: 2 }]
      }
      const state = cartReducer(stateWithItem, addToCart({ product: mockProduct, quantity: 3 }))
      expect(state.items).toHaveLength(1)
      expect(state.items[0].quantity).toBe(5)
    })

    it('should not exceed stock when adding to cart', () => {
      const limitedProduct = { ...mockProduct, stock: 5 }
      const state = cartReducer(initialState, addToCart({ product: limitedProduct, quantity: 10 }))
      expect(state.items[0].quantity).toBe(5)
    })

    it('should not exceed stock when updating existing item', () => {
      const limitedProduct = { ...mockProduct, stock: 5 }
      const stateWithItem = {
        items: [{ product: limitedProduct, quantity: 2 }]
      }
      const state = cartReducer(stateWithItem, addToCart({ product: limitedProduct, quantity: 5 }))
      expect(state.items[0].quantity).toBe(5)
    })

    it('should remove product from cart', () => {
      const stateWithItem = {
        items: [{ product: mockProduct, quantity: 2 }]
      }
      const state = cartReducer(stateWithItem, removeFromCart('1'))
      expect(state.items).toHaveLength(0)
    })

    it('should update product quantity', () => {
      const stateWithItem = {
        items: [{ product: mockProduct, quantity: 2 }]
      }
      const state = cartReducer(stateWithItem, updateQuantity({ productId: '1', quantity: 5 }))
      expect(state.items[0].quantity).toBe(5)
    })

    it('should not allow quantity less than 1', () => {
      const stateWithItem = {
        items: [{ product: mockProduct, quantity: 2 }]
      }
      const state = cartReducer(stateWithItem, updateQuantity({ productId: '1', quantity: 0 }))
      expect(state.items[0].quantity).toBe(1)
    })

    it('should not exceed stock when updating quantity', () => {
      const limitedProduct = { ...mockProduct, stock: 5 }
      const stateWithItem = {
        items: [{ product: limitedProduct, quantity: 2 }]
      }
      const state = cartReducer(stateWithItem, updateQuantity({ productId: '1', quantity: 10 }))
      expect(state.items[0].quantity).toBe(5)
    })

    it('should clear all items from cart', () => {
      const stateWithItems = {
        items: [
          { product: mockProduct, quantity: 2 },
          { product: { ...mockProduct, id: '2' }, quantity: 3 }
        ]
      }
      const state = cartReducer(stateWithItems, clearCart())
      expect(state.items).toHaveLength(0)
    })
  })

  describe('selectors', () => {
    const mockState = {
      cart: {
        items: [
          { product: mockProduct, quantity: 2 },
          { product: { ...mockProduct, id: '2', price: 20000 }, quantity: 3 }
        ]
      }
    } as unknown as RootState

    it('should select cart items', () => {
      const items = selectCartItems(mockState)
      expect(items).toHaveLength(2)
    })

    it('should calculate total items count', () => {
      const count = selectCartItemsCount(mockState)
      expect(count).toBe(5)
    })

    it('should calculate cart total', () => {
      const total = selectCartTotal(mockState)
      expect(total).toBe(80000) // (10000 * 2) + (20000 * 3)
    })

    it('should return 0 for empty cart count', () => {
      const emptyState = { cart: { items: [] } } as unknown as RootState
      const count = selectCartItemsCount(emptyState)
      expect(count).toBe(0)
    })

    it('should return 0 for empty cart total', () => {
      const emptyState = { cart: { items: [] } } as unknown as RootState
      const total = selectCartTotal(emptyState)
      expect(total).toBe(0)
    })
  })
})
