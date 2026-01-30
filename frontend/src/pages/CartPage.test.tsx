import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import cartReducer, { CartItem } from '../features/cart/cartSlice'
import checkoutReducer from '../features/checkout/checkoutSlice'
import notificationsReducer from '../features/notifications/notificationSlice'
import productsReducer from '../features/products/productsSlice'
import transactionReducer from '../features/transaction/transactionSlice'
import CartPage from './CartPage'

// Mock child components
jest.mock('../components/Header', () => ({
  Header: () => <div data-testid="header">Header Component</div>
}))

jest.mock('../components/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer Component</div>
}))

const mockCartItem: CartItem = {
  product: {
    id: 'product-1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100000,
    stock: 10,
    imageUrl: 'https://example.com/image.jpg'
  },
  quantity: 2
}

const mockCartItem2: CartItem = {
  product: {
    id: 'product-2',
    name: 'Second Product',
    description: 'Second Description',
    price: 50000,
    stock: 5,
    imageUrl: 'https://example.com/image2.jpg'
  },
  quantity: 1
}

describe('CartPage', () => {
  const createMockStore = (cartItems: CartItem[] = []) => {
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
          items: cartItems
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

  const renderWithRouter = (cartItems: CartItem[] = []) => {
    const store = createMockStore(cartItems)
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      </Provider>
    )
  }

  it('should render empty cart message when cart is empty', () => {
    renderWithRouter([])

    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
    expect(screen.getByText('Agrega productos para comenzar tu compra')).toBeInTheDocument()
    expect(screen.getByText('Explorar Productos')).toBeInTheDocument()
  })

  it('should render header and footer in empty state', () => {
    renderWithRouter([])

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('should render cart with items', () => {
    renderWithRouter([mockCartItem])

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    const prices = screen.getAllByText('$ 200.000')
    expect(prices.length).toBeGreaterThan(0) // Price appears multiple times (item price + subtotal)
  })

  it('should display multiple cart items', () => {
    renderWithRouter([mockCartItem, mockCartItem2])

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Second Product')).toBeInTheDocument()
  })

  it('should display cart header information', () => {
    renderWithRouter([mockCartItem])

    expect(screen.getByText('Ecommerce - W')).toBeInTheDocument()
    expect(screen.getByText(/Envío 19 mar. 2026 - 26 mar. 2026/)).toBeInTheDocument()
  })

  it('should display shipping company badge', () => {
    renderWithRouter([mockCartItem])

    expect(screen.getByText('DHL')).toBeInTheDocument()
    expect(screen.getByText('Empresa de envío')).toBeInTheDocument()
  })

  it('should display product image', () => {
    renderWithRouter([mockCartItem])

    const image = screen.getByAltText('Test Product') as HTMLImageElement
    expect(image).toBeInTheDocument()
    expect(image.src).toBe('https://example.com/image.jpg')
  })

  it('should display product tags', () => {
    renderWithRouter([mockCartItem])

    expect(screen.getAllByText('EXCLUSIVO')[0]).toBeInTheDocument()
    expect(screen.getAllByText('PREVENTA')[0]).toBeInTheDocument()
  })

  it('should allow increasing quantity', async () => {
    const user = userEvent.setup()
    renderWithRouter([mockCartItem])

    const increaseButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('path[d*="M12 4v16m8-8H4"]'))

    await user.click(increaseButtons[0])

    const quantityInput = screen.getAllByRole('spinbutton')[0] as HTMLInputElement
    await waitFor(() => {
      expect(parseInt(quantityInput.value)).toBeGreaterThan(2)
    })
  })

  it('should allow decreasing quantity', async () => {
    const user = userEvent.setup()
    renderWithRouter([mockCartItem])

    const decreaseButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('path[d*="M20 12H4"]'))

    await user.click(decreaseButtons[0])

    const quantityInput = screen.getAllByRole('spinbutton')[0] as HTMLInputElement
    await waitFor(() => {
      expect(parseInt(quantityInput.value)).toBeLessThan(2)
    })
  })

  it('should disable decrease button when quantity is 1', () => {
    const singleItemCart = {
      ...mockCartItem,
      quantity: 1
    }
    renderWithRouter([singleItemCart])

    const decreaseButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('path[d*="M20 12H4"]'))

    expect(decreaseButtons[0]).toBeDisabled()
  })

  it('should disable increase button when quantity reaches stock', () => {
    const maxStockItem = {
      ...mockCartItem,
      quantity: 10 // Same as stock
    }
    renderWithRouter([maxStockItem])

    const increaseButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('path[d*="M12 4v16m8-8H4"]'))

    expect(increaseButtons[0]).toBeDisabled()
  })

  it('should display subtotal', () => {
    renderWithRouter([mockCartItem])

    expect(screen.getByText('Subtotal')).toBeInTheDocument()
    const subtotals = screen.getAllByText('$ 200.000')
    expect(subtotals.length).toBeGreaterThan(0)
  })

  it('should display estimated shipping cost', () => {
    renderWithRouter([mockCartItem])

    expect(screen.getByText('Costo estimado de envío')).toBeInTheDocument()
    expect(screen.getAllByText('$ 83.630').length).toBeGreaterThan(0)
  })

  it('should display total cost', () => {
    renderWithRouter([mockCartItem])

    expect(screen.getByText('Costo estimado')).toBeInTheDocument()
    // Total = 200000 + 83630 = 283630
    expect(screen.getAllByText('$ 283.630').length).toBeGreaterThan(0)
  })

  it('should calculate total for multiple items', () => {
    renderWithRouter([mockCartItem, mockCartItem2])

    // mockCartItem: 100000 * 2 = 200000
    // mockCartItem2: 50000 * 1 = 50000
    // Total: 250000 + 83630 = 333630
    expect(screen.getAllByText('$ 333.630').length).toBeGreaterThan(0)
  })

  it('should render checkout button with correct text for single item', () => {
    renderWithRouter([mockCartItem])

    expect(screen.getByText('Comprar 1 producto')).toBeInTheDocument()
  })

  it('should render checkout button with correct text for multiple items', () => {
    renderWithRouter([mockCartItem, mockCartItem2])

    expect(screen.getByText('Comprar 2 productos')).toBeInTheDocument()
  })

  it('should display cart expiration notice', () => {
    renderWithRouter([mockCartItem])

    expect(
      screen.getByText(/Los productos del carrito se eliminarán después de 90 días/)
    ).toBeInTheDocument()
  })

  it('should have remove button for each item', () => {
    renderWithRouter([mockCartItem, mockCartItem2])

    const removeButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('path[d*="M6 18L18 6M6 6l12 12"]'))

    expect(removeButtons.length).toBe(2)
  })
})
