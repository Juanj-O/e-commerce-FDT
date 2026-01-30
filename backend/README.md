# E-Commerce Backend API

NestJS backend application with Hexagonal Architecture and Wompi payment integration.

## 🚀 Tech Stack

- **NestJS 11.0.1** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **TypeORM 0.3.28** - ORM for PostgreSQL
- **PostgreSQL** - Relational database
- **Swagger/OpenAPI** - API documentation
- **Jest** - Testing framework
- **Class Validator** - DTO validation
- **Axios** - HTTP client for Wompi API

## 🏗️ Architecture

### Hexagonal Architecture (Ports & Adapters)

```
src/
├── domain/                     # Core business logic (no dependencies)
│   ├── entities/              # Business entities
│   │   ├── product.entity.ts
│   │   ├── customer.entity.ts
│   │   ├── transaction.entity.ts
│   │   └── delivery.entity.ts
│   ├── ports/                 # Interface contracts
│   │   ├── inbound/          # Use case interfaces
│   │   └── outbound/         # Repository & gateway interfaces
│   ├── value-objects/        # Immutable value objects
│   │   ├── email.vo.ts
│   │   ├── credit-card.vo.ts
│   │   └── address.vo.ts
│   └── exceptions/           # Domain-specific exceptions
│
├── application/              # Use cases (business operations)
│   ├── use-cases/
│   │   ├── products/        # Product operations
│   │   ├── transactions/    # Transaction & payment processing
│   │   └── customers/       # Customer management
│   ├── dtos/                # Data transfer objects
│   └── mappers/             # Entity ↔ DTO conversion
│
├── infrastructure/          # External adapters
│   ├── adapters/
│   │   ├── inbound/        # HTTP controllers (REST API)
│   │   └── outbound/       # Database repos, Wompi gateway
│   ├── modules/            # NestJS dependency injection
│   └── config/             # Database & environment config
│
└── shared/                 # Cross-cutting concerns
    └── result.ts           # Railway Oriented Programming
```

### Railway Oriented Programming (ROP)

Error handling uses the Result monad pattern:

```typescript
// Success case
return Result.ok(data);

// Failure case
return Result.fail(new Error('Operation failed'));

// Chaining operations
const result = await someOperation()
  .map((data) => transform(data))
  .flatMap((data) => anotherOperation(data))
  .mapError((error) => new DomainException(error));
```

## 📊 Database Schema

```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Deliveries table
CREATE TABLE deliveries (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  product_id UUID REFERENCES products(id),
  delivery_id UUID REFERENCES deliveries(id),
  quantity INTEGER NOT NULL,
  product_amount DECIMAL(10, 2) NOT NULL,
  base_fee DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL, -- PENDING, APPROVED, DECLINED, ERROR
  business_transaction_id VARCHAR(255),
  business_reference VARCHAR(255),
  payment_method VARCHAR(50),
  card_last_four VARCHAR(4),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 API Endpoints

### Products

| Method | Endpoint            | Description                           |
| ------ | ------------------- | ------------------------------------- |
| `GET`  | `/api/products`     | Get all products with available stock |
| `GET`  | `/api/products/:id` | Get product by ID                     |

### Transactions

| Method | Endpoint                | Description                            |
| ------ | ----------------------- | -------------------------------------- |
| `POST` | `/api/transactions`     | Create transaction and process payment |
| `GET`  | `/api/transactions/:id` | Get transaction details by ID          |

### Swagger Documentation

Interactive API docs available at: **http://localhost:3000/api/docs**

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (via Docker or local)
- npm or yarn

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Setup database:**

```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Or use your local PostgreSQL instance
```

3. **Configure environment:**

```bash
# Create .env file
cp .env.example .env

# Edit .env with your configuration
```

4. **Run the application:**

```bash
# Development mode (with hot-reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

5. **Access the API:**

- API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs
- Health check: http://localhost:3000/health

## ⚙️ Environment Variables

Create a `.env` file in the backend root:

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

# Fees (in cents COP)
BASE_FEE=500000        # $5,000 COP transaction fee
DELIVERY_FEE=1000000   # $10,000 COP delivery fee
```

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Test Coverage Results

✅ **85.53% coverage** (Target: 80%)

- **401 tests passing**
- Statements: 85.53%
- Branches: 85.16%
- Functions: 95.31%
- Lines: 84.51%

### Test Structure

```
src/
├── domain/
│   ├── entities/*.spec.ts         # Entity business logic tests
│   └── value-objects/*.spec.ts    # Value object validation tests
├── application/
│   ├── use-cases/**/*.spec.ts     # Use case tests
│   └── mappers/*.spec.ts          # Mapper tests
└── infrastructure/
    ├── adapters/
    │   ├── inbound/**/*.spec.ts   # Controller tests
    │   └── outbound/**/*.spec.ts  # Repository & adapter tests
    └── modules/*.spec.ts          # Module tests
```

## 🏛️ Design Patterns

### 1. Hexagonal Architecture

- Separates core business logic from external concerns
- Dependencies point inward (Domain ← Application ← Infrastructure)
- Easy to test and maintain

### 2. Repository Pattern

- Abstracts data access logic
- Allows switching databases without changing business logic

### 3. Factory Pattern

- Creates complex domain objects (entities, value objects)
- Ensures objects are always in valid state

### 4. Result Monad (Railway Oriented Programming)

- Explicit error handling without try-catch
- Composable operations
- Type-safe error propagation

### 5. Dependency Injection

- NestJS IoC container
- Loose coupling between components
- Easy to mock for testing

## 📝 Code Examples

### Creating a Transaction (Use Case)

```typescript
// application/use-cases/transactions/create-transaction.use-case.ts
@Injectable()
export class CreateTransactionUseCase {
  async execute(dto: CreateTransactionDto): Promise<Result<TransactionResponseDto>> {
    // 1. Validate product exists and has stock
    const productResult = await this.getProductById(dto.productId)
    if (productResult.isFailure) return Result.fail(productResult.error)

    // 2. Create customer and delivery records
    const customerResult = await this.createCustomer(dto.customer)
    const deliveryResult = await this.createDelivery(dto.delivery, customerId)

    // 3. Create transaction entity
    const transaction = Transaction.create({
      customer, product, delivery, quantity
    })

    // 4. Process payment via Wompi
    const paymentResult = await this.businessAdapter.processPayment(...)

    // 5. Update transaction status
    transaction.updateStatus(paymentResult.status)

    // 6. Update product stock if approved
    if (paymentResult.isApproved) {
      await this.productRepository.decrementStock(productId, quantity)
    }

    return Result.ok(transactionDto)
  }
}
```

## 🔒 Security

- ✅ Input validation with class-validator
- ✅ SQL injection prevention (TypeORM parameterized queries)
- ✅ CORS configured
- ✅ Environment variables for secrets
- ✅ Credit card tokenization (no storage)
- ⚠️ Add rate limiting for production
- ⚠️ Add authentication/authorization (JWT)
- ⚠️ Add request logging and monitoring

## 🚢 Deployment

### Docker

```bash
# Build image
docker build -t ecommerce-backend .

# Run container
docker run -p 3000:3000 --env-file .env ecommerce-backend
```

### Cloud Platforms

**Railway:**

```bash
railway init
railway up
```

**Heroku:**

```bash
git push heroku main
```

**AWS Elastic Beanstalk:**

```bash
eb init
eb create
eb deploy
```

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Wompi API Documentation](https://docs.wompi.co/)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)

## 📄 License

This project is for evaluation purposes only.
