# E-Commerce Frontend

Modern React e-commerce application with Redux Toolkit state management and Wompi payment integration.

## 🚀 Tech Stack

- **React 19.2.0** - Modern UI library with Concurrent features
- **Redux Toolkit 2.11.2** - State management
- **React Router 7.6.2** - Client-side routing
- **Vite 7.3.1** - Fast build tool and dev server
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.1.6** - Utility-first styling
- **Axios 1.8.0** - HTTP client
- **Jest 30.2.0** - Testing framework
- **Testing Library** - React component testing

## 🏗️ Architecture

### Project Structure

```
src/
├── app/                        # Redux store configuration
│   ├── store.ts               # Redux store setup with persistence
│   └── hooks.ts               # Typed Redux hooks
│
├── features/                   # Redux slices (state management)
│   ├── cart/                  # Shopping cart state
│   ├── products/              # Products catalog state
│   ├── checkout/              # Checkout flow state
│   ├── notifications/         # Toast notifications
│   └── transaction/           # Transaction history
│
├── pages/                      # Route components
│   ├── DashboardPage.tsx      # Home/products page
│   ├── ProductPage.tsx        # Product details
│   ├── CartPage.tsx           # Shopping cart
│   └── CheckoutPage.tsx       # Checkout & payment
│
├── components/                 # Reusable UI components
│   ├── checkout/              # Payment components
│   │   ├── CardPaymentModal.tsx    # Wompi payment modal
│   │   ├── PaymentStatusView.tsx   # Success/error views
│   │   └── CardNumberInputs.tsx    # Card input fields
│   ├── layout/                # Layout components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── ui/                    # Base UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Backdrop.tsx
│
├── hooks/                      # Custom hooks (ViewModels)
│   ├── useCartViewModel.ts
│   ├── useCheckoutViewModel.ts
│   ├── useProductViewModel.ts
│   └── useNotification.ts
│
├── services/                   # API clients
│   └── api.ts                 # Axios HTTP client
│
├── types/                      # TypeScript interfaces
│   └── index.ts
│
└── utils/                      # Helper functions
    ├── formatters.ts          # Currency, date formatting
    └── cardValidation.ts      # Credit card validation
```

### State Management (Redux Toolkit)

**Cart Slice:**

- Add/remove items
- Update quantities
- Calculate totals
- Cart persistence (localStorage)

**Products Slice:**

- Fetch products catalog
- Product details
- Loading/error states

**Checkout Slice:**

- Multi-step form management
- Form validation
- Payment processing state

**Notifications Slice:**

- Toast notifications
- Success/error messages
- Auto-dismiss

### Routing

```typescript
<Routes>
  <Route path="/" element={<DashboardPage />} />
  <Route path="/product/:id" element={<ProductPage />} />
  <Route path="/cart" element={<CartPage />} />
  <Route path="/checkout" element={<CheckoutPage />} />
</Routes>
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on http://localhost:3000

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment:**

```bash
# Create .env file
cp .env.example .env
```

3. **Run the application:**

```bash
# Development mode (with hot-reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

4. **Access the application:**

- Development: http://localhost:5173
- Production preview: http://localhost:4173

## ⚙️ Environment Variables

Create a `.env` file in the frontend root:

```env
# API Base URL (optional, defaults to http://localhost:3000/api)
VITE_API_URL=http://localhost:3000/api
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Run specific test file
npm test -- ProductPage.test.tsx
```

### Test Coverage Results

✅ **53.82% coverage** (Target: 80%)

- **276 tests passing**
- 16 test suites passing
- Statements: 53.82% (450/836)
- Branches: 49.78% (227/456)
- Functions: 57.51% (139/242)
- Lines: 53.82% (450/836)

### Test Files

```
src/
├── services/
│   └── api.test.ts                    # API client tests (17 tests)
├── pages/
│   ├── DashboardPage.test.tsx         # Dashboard tests (13 tests)
│   ├── ProductPage.test.tsx           # Product details tests (20 tests)
│   ├── CartPage.test.tsx              # Cart tests (20 tests)
│   └── CheckoutPage.test.tsx          # Checkout tests (pending)
└── components/
    └── checkout/
        └── CardPaymentModal.test.tsx  # Payment modal tests (pending)
```

## 🎨 UI Components

### Payment Flow

1. **CardPaymentModal** - Main payment interface
   - Card number inputs (4 groups of 4 digits)
   - Expiration date (MM/YY)
   - CVV (3-4 digits)
   - Card validation
   - Wompi integration

2. **PaymentStatusView** - Transaction result
   - Success view with confirmation
   - Error view with retry button
   - Transaction reference

### Layout

- **Header** - Navigation bar with cart badge
- **Footer** - Site information
- **HeroSlider** - Promotional carousel
- **ProductGrid** - Product catalog display

### Base UI

- **Button** - Primary/secondary variants
- **Input** - Text/number/tel inputs
- **Modal** - Backdrop with overlay
- **Backdrop** - Semi-transparent overlay

## 📝 Key Features

### Shopping Cart

- Add products with quantity selection
- Update quantities (increment/decrement)
- Remove items
- Calculate subtotal, shipping, total
- Persistent cart (localStorage)
- Cart expiration (24 hours)

### Product Catalog

- Browse all products
- Filter by category
- View product details
- Stock availability
- Cash back information

### Checkout Process

1. **Customer Information**
   - Email
   - Full name
   - Phone number

2. **Delivery Information**
   - Full address
   - City
   - Department
   - ZIP code

3. **Payment**
   - Credit/debit card via Wompi
   - Card validation
   - 3DS authentication support
   - Transaction confirmation

### Payment Integration (Wompi)

```typescript
// Wompi sandbox environment
const wompiConfig = {
  publicKey: 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7',
  environment: 'sandbox',
  currency: 'COP'
}
```

## 🛠️ Development Tools

### Vite Configuration

- Fast HMR (Hot Module Replacement)
- TypeScript support
- Path aliases (@/ → src/)
- Production optimizations

### Tailwind CSS

- Utility-first CSS framework
- Custom color palette
- Responsive design utilities
- Dark mode support

### TypeScript

- Strict mode enabled
- Type-safe Redux hooks
- Interface definitions for all data models

## 🔒 Security

- ✅ Input validation (client-side)
- ✅ XSS prevention (React escaping)
- ✅ HTTPS for production
- ✅ Card tokenization via Wompi (no card storage)
- ⚠️ Add CSRF protection
- ⚠️ Add Content Security Policy

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Environment Variables in Vercel:**

- `VITE_API_URL` - Backend API URL

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy
```

### Docker

```bash
# Build image
docker build -t ecommerce-frontend .

# Run container
docker run -p 80:80 ecommerce-frontend
```

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Testing Library Documentation](https://testing-library.com/)
- [Wompi API Documentation](https://docs.wompi.co/)

## 📄 License

This project is for evaluation purposes only.
