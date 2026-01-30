import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import cartReducer from '../features/cart/cartSlice'
import checkoutReducer from '../features/checkout/checkoutSlice'
import notificationsReducer from '../features/notifications/notificationSlice'
import productsReducer from '../features/products/productsSlice'
import transactionReducer from '../features/transaction/transactionSlice'
import type { Product } from '../types'
import ProductPage from './ProductPage'

// Mock child components
jest.mock('../components/Header', () => ({
  Header: () => <div data-testid="header">Header Component</div>
}))

jest.mock('../components/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer Component</div>
}))

// Mock productsApi
jest.mock('../services/api', () => ({
  productsApi: {
    getAll: jest.fn()
  },
  transactionsApi: {}
}))

import { productsApi } from '../services/api'

const mockProductsApi = productsApi as jest.Mocked<typeof productsApi>

const mockProduct: Product = {
  id: 'test-product-1',
  name: 'Test Product Name',
  description: 'Test Product Description',
  price: 100000,
  stock: 10,
  imageUrl: 'https://example.com/test-image.jpg'
}

const mockOutOfStockProduct: Product = {
  id: 'test-product-2',
  name: 'Out of Stock Product',
  description: 'Out of Stock Description',
  price: 200000,
  stock: 0,
  imageUrl: 'https://example.com/out-of-stock.jpg'
}

describe('ProductPage', () => {
  const createMockStore = (products: Product[] = []) => {
    return configureStore({
      reducer: {
        products: productsReducer,
        cart: cartReducer,
        checkout: checkoutReducer,
        notifications: notificationsReducer,
        transaction: transactionReducer
      },
      preloadedState: {
        products: {
          items: products,
          selectedProduct: null,
          loading: false,
          error: null
        },
        cart: {
          items: []
        },
        checkout: {
          step: 'product' as const,
          product: null,
          quantity: 1,
          customer: null,
          delivery: null,
          creditCard: null
        },
        notifications: {
          notifications: []
        },
        transaction: {
          current: null,
          status: 'idle' as const,
          error: null,
          paymentResponse: null
        }
      }
    })
  }

  const renderWithRouter = (productId: string, products: Product[] = []) => {
    const store = createMockStore(products)
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/product/${productId}`]}>
          <Routes>
            <Route path="/product/:id" element={<ProductPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    )
  }

  beforeEach(() => {
    mockProductsApi.getAll.mockClear()
    mockProductsApi.getAll.mockResolvedValue({ success: true, data: [] })
  })

  it('should render loading state', () => {
    const store = configureStore({
      reducer: {
        products: productsReducer,
        cart: cartReducer,
        checkout: checkoutReducer,
        notifications: notificationsReducer,
        transaction: transactionReducer
      },
      preloadedState: {
        products: {
          items: [],
          selectedProduct: null,
          loading: true,
          error: null
        },
        cart: { items: [] },
        checkout: {
          step: 'product' as const,
          product: null,
          quantity: 1,
          customer: null,
          delivery: null,
          creditCard: null
        },
        notifications: { notifications: [] },
        transaction: {
          current: null,
          status: 'idle' as const,
          error: null,
          paymentResponse: null
        }
      }
    })

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/product/test-1']}>
          <Routes>
            <Route path="/product/:id" element={<ProductPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('should render product not found state', async () => {
    renderWithRouter('non-existent-id', [])

    await waitFor(() => {
      expect(screen.getByText('Producto no encontrado')).toBeInTheDocument()
    })
    expect(screen.getByText('← Volver al inicio')).toBeInTheDocument()
  })

  it('should render product details', async () => {
    renderWithRouter('test-product-1', [mockProduct])

    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: 'Test Product Name' })
      expect(heading).toBeInTheDocument()
    })
    const prices = screen.getAllByText('$ 100.000')
    expect(prices.length).toBeGreaterThan(0)
    expect(screen.getByAltText('Test Product Name')).toBeInTheDocument()
  })

  it('should display product image', () => {
    renderWithRouter('test-product-1', [mockProduct])

    const image = screen.getByAltText('Test Product Name') as HTMLImageElement
    expect(image).toBeInTheDocument()
    expect(image.src).toBe('https://example.com/test-image.jpg')
  })

  it('should display cash back amount', () => {
    renderWithRouter('test-product-1', [mockProduct])

    // Cash máximo 2% del precio = 100000 * 0.02 = 2000
    expect(screen.getByText(/Cash máximo/)).toBeInTheDocument()
    expect(screen.getByText(/\$ 2\.000/)).toBeInTheDocument()
  })

  it('should allow quantity increase', async () => {
    const user = userEvent.setup()
    renderWithRouter('test-product-1', [mockProduct])

    const increaseButton = screen
      .getAllByRole('button')
      .find((btn) => btn.querySelector('path[d*="M12 4v16m8-8H4"]'))

    expect(increaseButton).toBeInTheDocument()
    await user.click(increaseButton!)

    const quantityInput = screen.getByRole('spinbutton') as HTMLInputElement
    await waitFor(() => {
      expect(quantityInput.value).toBe('2')
    })
  })

  it('should allow quantity decrease', async () => {
    const user = userEvent.setup()
    renderWithRouter('test-product-1', [mockProduct])

    // First increase to 2
    const increaseButton = screen
      .getAllByRole('button')
      .find((btn) => btn.querySelector('path[d*="M12 4v16m8-8H4"]'))
    await user.click(increaseButton!)

    // Then decrease back to 1
    const decreaseButton = screen
      .getAllByRole('button')
      .find((btn) => btn.querySelector('path[d*="M20 12H4"]'))
    await user.click(decreaseButton!)

    const quantityInput = screen.getByRole('spinbutton') as HTMLInputElement
    await waitFor(() => {
      expect(quantityInput.value).toBe('1')
    })
  })

  it('should disable decrease button when quantity is 1', () => {
    renderWithRouter('test-product-1', [mockProduct])

    const decreaseButton = screen
      .getAllByRole('button')
      .find((btn) => btn.querySelector('path[d*="M20 12H4"]'))

    expect(decreaseButton).toBeDisabled()
  })

  it('should disable increase button when quantity reaches stock', async () => {
    const user = userEvent.setup()
    const lowStockProduct = { ...mockProduct, stock: 2 }
    renderWithRouter('test-product-1', [lowStockProduct])

    const increaseButton = screen
      .getAllByRole('button')
      .find((btn) => btn.querySelector('path[d*="M12 4v16m8-8H4"]'))

    // Click twice to reach stock limit
    await user.click(increaseButton!)
    await user.click(increaseButton!)

    await waitFor(() => {
      expect(increaseButton).toBeDisabled()
    })
  })

  it('should update total price when quantity changes', async () => {
    const user = userEvent.setup()
    renderWithRouter('test-product-1', [mockProduct])

    const increaseButton = screen
      .getAllByRole('button')
      .find((btn) => btn.querySelector('path[d*="M12 4v16m8-8H4"]'))

    await user.click(increaseButton!)

    await waitFor(() => {
      expect(screen.getByText('$ 200.000')).toBeInTheDocument()
    })
  })

  it('should display stock information', () => {
    renderWithRouter('test-product-1', [mockProduct])

    expect(screen.getByText(/Puedes comprar hasta 10 unidad\(es\)/)).toBeInTheDocument()
  })

  it('should render add to cart button', () => {
    renderWithRouter('test-product-1', [mockProduct])

    expect(screen.getByText('Agregar al Carrito')).toBeInTheDocument()
  })

  it('should render buy now button', () => {
    renderWithRouter('test-product-1', [mockProduct])

    expect(screen.getByText('Comprar')).toBeInTheDocument()
  })

  it('should disable buttons when product is out of stock', () => {
    renderWithRouter('test-product-2', [mockOutOfStockProduct])

    const agotadoButton = screen.getByRole('button', { name: 'Agotado' })
    expect(agotadoButton).toBeInTheDocument()
    expect(screen.getByText('Agregar al Carrito')).toBeDisabled()
    expect(agotadoButton).toBeDisabled()
  })

  it('should not show quantity selector when out of stock', () => {
    renderWithRouter('test-product-2', [mockOutOfStockProduct])

    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
  })

  it('should display shipping information', () => {
    renderWithRouter('test-product-1', [mockProduct])

    expect(screen.getByText('Envío disponible')).toBeInTheDocument()
    expect(screen.getByText(/El método de envío y el costo de envío/)).toBeInTheDocument()
  })

  it('should toggle information section', async () => {
    const user = userEvent.setup()
    renderWithRouter('test-product-1', [mockProduct])

    const infoButton = screen.getByText('Información').closest('button')
    expect(infoButton).toBeInTheDocument()

    // Initially should be open (isInfoOpen defaults to true)
    expect(screen.getByText('Nombre del Producto')).toBeInTheDocument()

    // Click to close
    await user.click(infoButton!)
    await waitFor(() => {
      expect(screen.queryByText('Nombre del Producto')).not.toBeInTheDocument()
    })

    // Click to open again
    await user.click(infoButton!)
    await waitFor(() => {
      expect(screen.getByText('Nombre del Producto')).toBeInTheDocument()
    })
  })

  it('should display product specifications', () => {
    renderWithRouter('test-product-1', [mockProduct])

    expect(screen.getByText('Nombre del Producto')).toBeInTheDocument()
    expect(screen.getByText('Marca')).toBeInTheDocument()
    expect(screen.getByText('Tech Store')).toBeInTheDocument()
    expect(screen.getByText('Modelo')).toBeInTheDocument()
    expect(screen.getByText('TEST-PRODUCT-1')).toBeInTheDocument()
    expect(screen.getByText('Categoría')).toBeInTheDocument()
    expect(screen.getByText('Electrónicos')).toBeInTheDocument()
    expect(screen.getByText('Disponibilidad')).toBeInTheDocument()
    expect(screen.getByText('10 unidades')).toBeInTheDocument()
    expect(screen.getByText('Garantía')).toBeInTheDocument()
    expect(screen.getByText('12 meses')).toBeInTheDocument()
  })

  it('should show "Agotado" in specifications when out of stock', () => {
    renderWithRouter('test-product-2', [mockOutOfStockProduct])

    // Check specifications table - look for the specific cell
    expect(screen.getByText('Disponibilidad')).toBeInTheDocument()
    const allAgotadoTexts = screen.getAllByText('Agotado')
    // One in button, one in specifications table
    expect(allAgotadoTexts.length).toBeGreaterThanOrEqual(1)
  })

  it('should display breadcrumb navigation', () => {
    renderWithRouter('test-product-1', [mockProduct])

    expect(screen.getByText('Tecnología')).toBeInTheDocument()
  })
})
