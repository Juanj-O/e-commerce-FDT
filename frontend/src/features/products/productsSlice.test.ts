import type { Product } from '../../types'
import productsReducer, {
  clearSelectedProduct,
  fetchProductById,
  fetchProducts,
  selectProduct
} from './productsSlice'

// Mock the API module
jest.mock('../../services/api')

describe('productsSlice', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 10000,
    stock: 50,
    imageUrl: 'https://example.com/image.jpg'
  }

  const initialState = {
    items: [],
    selectedProduct: null,
    loading: false,
    error: null
  }

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(productsReducer(undefined, { type: 'unknown' })).toEqual(initialState)
    })

    it('should select a product', () => {
      const state = productsReducer(initialState, selectProduct(mockProduct))
      expect(state.selectedProduct).toEqual(mockProduct)
    })

    it('should clear selected product', () => {
      const stateWithProduct = {
        ...initialState,
        selectedProduct: mockProduct
      }
      const state = productsReducer(stateWithProduct, clearSelectedProduct())
      expect(state.selectedProduct).toBeNull()
    })
  })

  describe('async thunks', () => {
    describe('fetchProducts', () => {
      it('should set loading true on pending', () => {
        const state = productsReducer(initialState, fetchProducts.pending('', undefined))
        expect(state.loading).toBe(true)
        expect(state.error).toBeNull()
      })

      it('should set products on fulfilled', () => {
        const products = [mockProduct]
        const state = productsReducer(
          initialState,
          fetchProducts.fulfilled(products, '', undefined)
        )
        expect(state.loading).toBe(false)
        expect(state.items).toEqual(products)
      })

      it('should set error on rejected', () => {
        const error = new Error('Network error')
        const state = productsReducer(initialState, fetchProducts.rejected(error, '', undefined))
        expect(state.loading).toBe(false)
        expect(state.error).toBe('Network error')
      })
    })

    describe('fetchProductById', () => {
      it('should set loading true on pending', () => {
        const state = productsReducer(initialState, fetchProductById.pending('', '1'))
        expect(state.loading).toBe(true)
        expect(state.error).toBeNull()
      })

      it('should set selected product on fulfilled', () => {
        const state = productsReducer(
          initialState,
          fetchProductById.fulfilled(mockProduct, '', '1')
        )
        expect(state.loading).toBe(false)
        expect(state.selectedProduct).toEqual(mockProduct)
      })

      it('should set error on rejected', () => {
        const error = new Error('Product not found')
        const state = productsReducer(initialState, fetchProductById.rejected(error, '', '1'))
        expect(state.loading).toBe(false)
        expect(state.error).toBe('Product not found')
      })

      it('should handle rejected with no error message', () => {
        const error = new Error()
        const state = productsReducer(initialState, fetchProductById.rejected(error, '', '1'))
        expect(state.error).toBe('Failed to fetch product')
      })
    })
  })
})
