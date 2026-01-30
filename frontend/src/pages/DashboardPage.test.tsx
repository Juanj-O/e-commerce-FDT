import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import cartReducer from '../features/cart/cartSlice'
import checkoutReducer from '../features/checkout/checkoutSlice'
import notificationsReducer from '../features/notifications/notificationSlice'
import productsReducer from '../features/products/productsSlice'
import transactionReducer from '../features/transaction/transactionSlice'
import DashboardPage from './DashboardPage'

// Mock child components
jest.mock('../components/Header', () => ({
  Header: () => <div data-testid="header">Header Component</div>
}))

jest.mock('../components/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer Component</div>
}))

jest.mock('../components/HeroSlider', () => ({
  HeroSlider: () => <div data-testid="hero-slider">Hero Slider Component</div>
}))

interface MockProductGridProps {
  products: unknown[]
  loading: boolean
  error: string | null
}

jest.mock('../components/ProductGrid', () => ({
  ProductGrid: ({ products, loading, error }: MockProductGridProps) => (
    <div data-testid="product-grid">
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {products.length > 0 && <div>Products: {products.length}</div>}
    </div>
  )
}))

// Mock productsApi to control async behavior
jest.mock('../services/api', () => ({
  productsApi: {
    getAll: jest.fn()
  },
  transactionsApi: {}
}))

import { productsApi } from '../services/api'

const mockProductsApi = productsApi as jest.Mocked<typeof productsApi>

describe('DashboardPage', () => {
  const createMockStore = (initialState = {}) => {
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
          items: [],
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
        },
        ...initialState
      }
    })
  }

  beforeEach(() => {
    mockProductsApi.getAll.mockClear()
    mockProductsApi.getAll.mockResolvedValue({ success: true, data: [] })
  })

  it('should render all main sections', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('hero-slider')).toBeInTheDocument()
    expect(screen.getByTestId('product-grid')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('should display page title', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    expect(screen.getByText('Productos')).toBeInTheDocument()
  })

  it('should display all category tabs', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    const categories = ['Todo', 'Electrónicos', 'Computadoras', 'Audio', 'Wearables', 'Accesorios']
    categories.forEach((category) => {
      expect(screen.getByText(category)).toBeInTheDocument()
    })
  })

  it('should display announcements section', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    expect(screen.getByText('Novedades')).toBeInTheDocument()
    expect(screen.getByText('Ver todo ›')).toBeInTheDocument()
  })

  it('should display all announcements', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    expect(screen.getByText('NUEVO')).toBeInTheDocument()
    expect(screen.getByText('PROMO')).toBeInTheDocument()
    expect(screen.getByText('INFO')).toBeInTheDocument()
    expect(screen.getByText('TECH')).toBeInTheDocument()

    expect(screen.getByText(/Oferta Especial.*Preventa/)).toBeInTheDocument()
    expect(screen.getByText(/Regalo especial en compras/)).toBeInTheDocument()
  })

  it('should call fetchProducts on mount', async () => {
    const store = createMockStore()

    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    await waitFor(() => {
      expect(mockProductsApi.getAll).toHaveBeenCalled()
    })
  })

  it('should pass loading state to ProductGrid', () => {
    const store = createMockStore({
      products: {
        items: [],
        loading: true,
        error: null
      }
    })

    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should pass error state to ProductGrid', async () => {
    mockProductsApi.getAll.mockRejectedValue(new Error('Failed to load products'))

    const store = createMockStore()

    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load products')).toBeInTheDocument()
    })
  })

  it('should pass products to ProductGrid', () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Product 1',
        description: 'Description 1',
        price: 100000,
        stock: 10,
        imageUrl: 'https://example.com/image1.jpg'
      },
      {
        id: '2',
        name: 'Product 2',
        description: 'Description 2',
        price: 200000,
        stock: 5,
        imageUrl: 'https://example.com/image2.jpg'
      }
    ]

    const store = createMockStore({
      products: {
        items: mockProducts,
        loading: false,
        error: null
      }
    })

    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    expect(screen.getByText('Products: 2')).toBeInTheDocument()
  })

  it('should render with responsive layout', () => {
    const store = createMockStore()
    const { container } = render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    expect(container.querySelector('.min-h-screen')).toBeInTheDocument()
    expect(container.querySelector('.max-w-7xl')).toBeInTheDocument()
    expect(container.querySelector('.lg\\:flex-row')).toBeInTheDocument()
  })

  it('should display announcement dates', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    expect(screen.getByText('28 ene. 2026')).toBeInTheDocument()
    expect(screen.getByText('25 ene. 2026')).toBeInTheDocument()
    expect(screen.getByText('20 ene. 2026')).toBeInTheDocument()
    expect(screen.getByText('15 ene. 2026')).toBeInTheDocument()
  })

  it('should have sticky sidebar on desktop', () => {
    const store = createMockStore()
    const { container } = render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    const sidebar = container.querySelector('.sticky')
    expect(sidebar).toBeInTheDocument()
    expect(sidebar).toHaveClass('top-20')
  })

  it('should display more options button in categories', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    expect(screen.getByText('⋮')).toBeInTheDocument()
  })
})
