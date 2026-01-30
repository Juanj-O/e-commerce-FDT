# E-Commerce Payment App (Wompi Integration)

Full-stack e-commerce application with credit card payment processing integration using Wompi payment gateway.

## 🚀 Tech Stack

### Frontend

- **React 19.2.0** + TypeScript
- **Vite 7.3.1** (build tool)
- **Redux Toolkit 2.11.2** + Redux Persist (state management)
- **React Router DOM 7.5.1** (routing)
- **Tailwind CSS 4.1.6** (styling)
- **Axios 1.8.0** (HTTP client)
- **Jest 30.2.0** + Testing Library (testing)

### Backend

- **NestJS 11.0.1** + TypeScript
- **Hexagonal Architecture** (Ports & Adapters)
- **Railway Oriented Programming** (ROP)
- **TypeORM 0.3.28** + PostgreSQL
- **Swagger** (API documentation)
- **Jest** (testing)

## 📊 Test Coverage

### Backend

- **Coverage: 85.53%** ✅ (Target: 80%)
- **Tests: 401 passing**
- Coverage breakdown:
  - Statements: 85.53%
  - Branches: 85.16%
  - Functions: 95.31%
  - Lines: 84.51%

### Frontend

- **Coverage: 53.82%** 🔄 (Target: 80%)
- **Tests: 276 passing**
- Coverage breakdown:
  - Statements: 53.82%
  - Branches: 25.27%
  - Functions: 52.21%
  - Lines: 53.41%

## 📁 Project Structure

```
e-commerce-FDT/
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── app/                # Redux store configuration
│   │   ├── components/         # Reusable UI components
│   │   │   ├── checkout/       # Payment modal, card inputs
│   │   │   ├── layout/         # Header, Footer
│   │   │   └── ui/             # Buttons, inputs, modals
│   │   ├── features/           # Redux slices
│   │   │   ├── cart/           # Shopping cart logic
│   │   │   ├── checkout/       # Checkout flow state
│   │   │   ├── products/       # Products state
│   │   │   ├── transaction/    # Payment processing
│   │   │   └── notifications/  # Toast notifications
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   │   ├── DashboardPage   # Product catalog
│   │   │   ├── ProductPage     # Product details
│   │   │   ├── CartPage        # Shopping cart
│   │   │   └── CheckoutPage    # Payment flow
│   │   ├── services/           # API client (Axios)
│   │   ├── types/              # TypeScript types
│   │   ├── utils/              # Formatters, validation
│   │   └── __tests__/          # Test suites (276 tests)
│   └── ...
├── backend/                     # NestJS API
│   ├── src/
│   │   ├── domain/             # Core business logic
│   │   │   ├── entities/       # Product, Customer, Transaction, Delivery
│   │   │   ├── ports/          # Interface definitions
│   │   │   │   ├── inbound/    # Use case interfaces
│   │   │   │   └── outbound/   # Repository & gateway interfaces
│   │   │   ├── value-objects/  # Email, CreditCard, Address
│   │   │   └── exceptions/     # Domain exceptions
│   │   ├── application/        # Use cases
│   │   │   ├── use-cases/      # Business operations
│   │   │   │   ├── products/   # Get products, get by ID
│   │   │   │   ├── transactions/ # Create, get transaction
│   │   │   │   └── customers/  # Customer management
│   │   │   ├── dtos/           # Data transfer objects
│   │   │   └── mappers/        # Entity ↔ DTO conversion
│   │   ├── infrastructure/     # External implementations
│   │   │   ├── adapters/       # Controllers & repositories
│   │   │   │   ├── inbound/    # REST controllers
│   │   │   │   └── outbound/   # TypeORM repos, Wompi adapter
│   │   │   ├── modules/        # NestJS modules
│   │   │   └── config/         # Database, env config
│   │   ├── shared/             # Shared utilities (Result type)
│   │   └── __tests__/          # Test suites (401 tests)
│   └── ...
└── docker-compose.yml          # PostgreSQL container
```

## Data Model

```
┌─────────────────┐       ┌─────────────────┐
│    products     │       │    customers    │
├─────────────────┤       ├─────────────────┤
│ id (UUID) PK    │       │ id (UUID) PK    │
│ name            │       │ email           │
│ description     │       │ full_name       │
│ price           │       │ phone           │
│ stock           │       │ created_at      │
│ image_url       │       └────────┬────────┘
│ created_at      │                │
│ updated_at      │                │
└────────┬────────┘       ┌────────┴────────┐
         │                │   deliveries    │
         │                ├─────────────────┤
         │                │ id (UUID) PK    │
         │                │ customer_id FK  │
         │                │ address         │
         │                │ city            │
         │                │ department      │
         │                │ zip_code        │
         │                │ created_at      │
         │                └────────┬────────┘
         │                         │
         │    ┌────────────────────┴───────────────────┐
         │    │              transactions              │
         │    ├────────────────────────────────────────┤
         └────┤ id (UUID) PK                           │
              │ customer_id FK                         │
              │ product_id FK                          │
              │ delivery_id FK                         │
              │ quantity                               │
              │ product_amount                         │
              │ base_fee                               │
              │ delivery_fee                           │
              │ total_amount                           │
              │ status (PENDING|APPROVED|DECLINED|...) │
              │ business_transaction_id                   │
              │ business_reference                        │
              │ payment_method                         │
              │ card_last_four                         │
              │ error_message                          │
              │ created_at                             │
              │ updated_at                             │
              └────────────────────────────────────────┘
```

## API Endpoints

### Products

| Method | Endpoint            | Description                 |
| ------ | ------------------- | --------------------------- |
| GET    | `/api/products`     | Get all products with stock |
| GET    | `/api/products/:id` | Get product by ID           |

### Transactions

| Method | Endpoint                | Description                            |
| ------ | ----------------------- | -------------------------------------- |
| POST   | `/api/transactions`     | Create transaction and process payment |
| GET    | `/api/transactions/:id` | Get transaction by ID                  |

### Swagger Documentation

Once the backend is running, access the API documentation at:

```
http://localhost:3000/api/docs
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (LTS recommended)
- **Docker & Docker Compose**
- **npm** or **yarn**
- **PostgreSQL** (via Docker or local)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Juanj-O/e-commerce-FDT.git
cd e-commerce-FDT
```

2. **Start PostgreSQL with Docker:**

```bash
docker-compose up -d
```

3. **Setup Backend:**

```bash
cd backend
npm install

# Create .env file (see Environment Variables section)
cp .env.example .env

# Run migrations (if any)
npm run start:dev
```

4. **Setup Frontend (new terminal):**

```bash
cd frontend
npm install
npm run dev
```

5. **Access the application:**

- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:3000
- 📚 **Swagger Docs**: http://localhost:3000/api/docs
- 🗄️ **PostgreSQL**: localhost:5432

### Environment Variables

#### Backend (.env)

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres123
DATABASE_NAME=ecommerce

# Wompi Payment Gateway (Sandbox)
BUSINESS_PUBLIC_KEY=pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7
BUSINESS_PRIVATE_KEY=prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg
BUSINESS_INTEGRITY_KEY=stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp
BUSINESS_API_URL=https://api-sandbox.co.uat.business.dev/v1

# Fees (in cents)
BASE_FEE=500000        # $5,000 COP
DELIVERY_FEE=1000000   # $10,000 COP
```

#### Frontend (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Wompi Public Key (for client-side tokenization)
VITE_BUSINESS_PUBLIC_KEY=pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7
```

> **Note**: For production, replace sandbox keys with production keys from Wompi dashboard.

## Architecture

### Hexagonal Architecture

The backend follows Hexagonal Architecture (Ports & Adapters):

- **Domain Layer**: Core business logic, entities, and port interfaces
- **Application Layer**: Use cases implementing business operations
- **Infrastructure Layer**: External adapters (HTTP controllers, database repositories, payment gateway)

### Railway Oriented Programming (ROP)

Error handling is implemented using the Result type pattern:

```typescript
// Success path
Result.ok(value)

// Failure path
Result.fail(error)

// Chaining operations
result.map((value) => transform(value)).flatMap((value) => anotherOperation(value))
```

### Flux Architecture (Frontend)

State management follows Redux/Flux patterns:

- **Actions**: Dispatched events
- **Reducers**: Pure functions updating state
- **Store**: Centralized state container
- **Selectors**: Derived state computation

## Payment Flow

1. User selects product and clicks "Pay with Credit Card"
2. User fills credit card and delivery information
3. Summary is shown with fees breakdown
4. On confirmation:
   - Transaction created with PENDING status
   - Card tokenized via Payment Gateway
   - Payment processed
   - Transaction updated with result
   - Stock updated if approved
5. Result shown to user
6. Redirect to products page

## 🧪 Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e
```

**Backend Test Results:**

- ✅ **401 tests passing**
- ✅ **85.53% coverage** (exceeds 80% target)
- Test suites: Domain entities, repositories, use cases, mappers, adapters

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- ProductPage.test.tsx
```

**Frontend Test Results:**

- ✅ **276 tests passing**
- 🔄 **53.82% coverage** (progressing to 80% target)
- Test suites: Pages (Dashboard, Product, Cart), Redux slices, hooks, API services

### Coverage Reports

After running tests with coverage, view detailed reports:

- Backend: `backend/coverage/lcov-report/index.html`
- Frontend: `frontend/coverage/lcov-report/index.html`

## 🚢 Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build

# Deploy to Vercel
vercel --prod
```

Environment variables needed in Vercel:

- `VITE_API_URL`: Your production API URL
- `VITE_BUSINESS_PUBLIC_KEY`: Wompi production public key

### Backend (Railway/Heroku/AWS)

**Option 1: Railway**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Option 2: Docker**

```bash
cd backend
docker build -t ecommerce-backend .
docker run -p 3000:3000 --env-file .env ecommerce-backend
```

**Option 3: AWS Elastic Beanstalk**

- Use `eb init` and `eb deploy`
- Configure RDS PostgreSQL instance
- Set environment variables in EB console

### Database

- **Development**: Docker Compose (PostgreSQL)
- **Production**:
  - AWS RDS PostgreSQL
  - Railway PostgreSQL
  - Heroku PostgreSQL
  - Supabase

## 🔒 Security Considerations

- ✅ **Credit card data is never stored** - only tokenized through Wompi
- ✅ **Input validation** on all endpoints with class-validator
- ✅ **CORS configured** for allowed origins
- ✅ **Environment variables** for sensitive data
- ✅ **SQL injection prevention** via TypeORM parameterized queries
- ✅ **Rate limiting** can be added with @nestjs/throttler
- ✅ **HTTPS required** in production
- ⚠️ **API authentication** should be added for production (JWT, API keys)

## 📝 API Documentation

### Swagger UI

Access interactive API documentation at: `http://localhost:3000/api/docs`

Features:

- Try out endpoints directly
- View request/response schemas
- See all available operations
- Export OpenAPI specification

### Key Endpoints

**Products:**

- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details

**Transactions:**

- `POST /api/transactions` - Create and process payment
- `GET /api/transactions/:id` - Get transaction status

## 🛠️ Built With

- [NestJS](https://nestjs.com/) - Backend framework
- [React](https://react.dev/) - Frontend library
- [TypeORM](https://typeorm.io/) - ORM for database
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Wompi](https://docs.wompi.co/) - Payment gateway
- [Vite](https://vite.dev/) - Build tool
- [Jest](https://jestjs.io/) - Testing framework

## 👥 Contributing

This is a test project for evaluation purposes. Not open for contributions.

## 📄 License

This project is for evaluation purposes only. All rights reserved.
