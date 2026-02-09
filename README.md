# Invoice Billing System

A full-stack web application for managing invoices, customers, items, and payments. The system helps businesses create, track, and manage invoices with comprehensive billing features.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Important Design Decisions](#important-design-decisions)
- [Project Setup](#project-setup)
- [Running Locally](#running-locally)
- [API Documentation](#api-documentation)

## ✨ Features

- **User Management**
  - User registration and login with JWT authentication
  - Secure password hashing with bcrypt
  - Role-based access control via authentication middleware

- **Invoice Management**
  - Create and manage invoices
  - Track invoice status (draft, sent, paid, etc.)
  - Calculate tax amounts and totals automatically
  - View invoices filtered by user
  - Pagination support for invoice listings

- **Customer Management**
  - Create and manage customer records
  - Track customer information (name, email, address)
  - Active/inactive customer status

- **Item Management**
  - Create reusable line items for invoices
  - Track item pricing and descriptions
  - Categorize items by creator

- **Payment Tracking**
  - Record payments against invoices
  - Support for multiple payment methods
  - Track outstanding amounts
  - Link payments to specific invoices

- **Reporting**
  - Generate user-specific reports
  - Track invoice metrics

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Validation**: Zod schema validation
- **Testing**: Jest + Supertest
- **Package Manager**: npm

### Frontend
- **Framework**: Next.js 16.x
- **Language**: TypeScript
- **React**: 19.x
- **Styling**: CSS Modules
- **Package Manager**: npm

### DevOps & Tools
- **Database Adapter**: Prisma PostgreSQL Adapter
- **API Testing**: Thunder Client / Postman
- **Version Control**: Git

## 🏗 Architecture Overview

The project follows a **monorepo structure** with separate backend and frontend applications:

```
Invoice-Billing-System/
├── src/                           # Backend (Express.js + TypeScript)
│   ├── controller/               # Request handlers
│   ├── repository/               # Data access layer
│   ├── routes/                   # API route definitions
│   ├── middleware/               # Authentication & validation
│   ├── validators/               # Zod schema validation
│   ├── utils/                    # Helper functions
│   ├── constants/                # Application constants
│   ├── prisma/                   # Database schema & migrations
│   ├── generated/                # Prisma client generated files
│   ├── lib/                      # Prisma client configuration
│   ├── test/                     # Unit & integration tests
│   └── index.ts                  # Server entry point
│
└── invoice-billing-system-frontend/  # Frontend (Next.js + React)
    ├── app/                      # Next.js app router structure
    │   ├── dashboard/           # Dashboard page
    │   ├── invoices/            # Invoice management pages
    │   ├── customers/           # Customer management pages
    │   ├── items/               # Item management pages
    │   ├── login/               # Login page
    │   ├── register/            # Registration page
    │   └── components/          # Reusable components
    ├── lib/                     # Frontend utilities
    └── public/                  # Static assets
```

### Layered Architecture

**Backend follows a clean layered architecture:**

1. **Controllers** - Handle HTTP requests/responses and business logic
2. **Repositories** - Abstract database operations using Prisma
3. **Validators** - Validate incoming request data using Zod schemas
4. **Middleware** - Cross-cutting concerns (authentication, logging)
5. **Utils** - Shared utility functions

**Frontend follows Next.js best practices:**

1. **Pages** - File-based routing
2. **Components** - Reusable React components
3. **Lib** - Utility functions and API helpers

## 🎯 Important Design Decisions

### 1. **Prisma as ORM**
   - **Decision**: Use Prisma with PostgreSQL adapter for data access
   - **Rationale**: Type-safe database access, automatic migrations, and excellent developer experience

### 2. **JWT Authentication**
   - **Decision**: Stateless JWT-based authentication with cookies
   - **Rationale**: Scalable, RESTful, and supports distributed systems without session storage

### 3. **Zod Validation**
   - **Decision**: Schema validation using Zod before database operations
   - **Rationale**: Runtime type safety, comprehensive error messages, and automatic TypeScript type inference

### 4. **User-Scoped Data**
   - **Decision**: All invoices, items, and payments are scoped to the authenticated user
   - **Rationale**: Multi-tenant safety and proper data isolation

### 5. **Pagination on Invoices**
   - **Decision**: Implement cursor-based pagination with configurable page size (max 50)
   - **Rationale**: Better performance on large datasets and prevents memory overload

### 6. **Automatic Amount Calculation**
   - **Decision**: Server-side calculation of tax amounts and totals
   - **Rationale**: Ensures data integrity and prevents client-side manipulation

### 7. **Database Indexes**
   - **Decision**: Indexes on frequently queried fields (email, createdBy, createdAt)
   - **Rationale**: Optimized query performance for common search operations

### 8. **Monorepo Structure**
   - **Decision**: Keep frontend and backend in the same repository
   - **Rationale**: Easier dependency management, unified versioning, and simplified deployment

## 🚀 Project Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to the backend directory**
   ```bash
   cd src
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `src` directory:
   ```env
   DATABASE_URL=YOUR_DB_URL
   PORT=YOUR_PORT
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=YOUR_ENVIRONMENT
   ```

4. **Setup the database**
   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd invoice-billing-system-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

## 🏃 Running Locally

### Start the Backend Server

```bash
cd src
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`)

**Available npm scripts:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm test` - Run Jest test suite
- `npm run dev:watch` - Watch TypeScript compilation

### Start the Frontend Application

```bash
cd invoice-billing-system-frontend
npm run dev -- -p 5500 (to run on the port 5500)
```

The frontend will start on `http://localhost:3000` (Next.js default port)

**Available npm scripts:**
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Verify the Setup

Check the health of the backend:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is healthy"
}
```

## 📚 API Documentation

All API endpoints (except `/auth/register` and `/auth/login`) require JWT authentication. Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Alternatively, the token is stored in cookies after login.

### Authentication Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Login User
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Invoice Endpoints

#### Get All Invoices (Paginated)
```
GET /invoices?page=1&pageSize=10
Authorization: Bearer <token>
```

#### Get Single Invoice
```
GET /invoices/:id
Authorization: Bearer <token>
```

#### Create Invoice
```
POST /invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientName": "ABC Corp",
  "clientAddress": "123 Main St",
  "invoiceDate": "2026-02-09",
  "dueDate": "2026-03-09",
  "email": "client@example.com",
  "taxRate": 10,
  "items": [
    {
      "itemName": "Consulting Services",
      "description": "Professional consulting",
      "unitPrice": 150.00,
      "quantity": 5
    }
  ]
}
```

#### Change Invoice Status
```
PATCH /invoices/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Sent"
}
```

### Customer Endpoints

#### Get All Customers
```
GET /customers
Authorization: Bearer <token>
```

#### Create Customer
```
POST /customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St"
}
```

### Item Endpoints

#### Get All Items
```
GET /items
Authorization: Bearer <token>
```

#### Create Item
```
POST /items
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemName": "Consulting Services",
  "description": "Professional consulting",
  "unitPrice": 150.00
}
```

### Payment Endpoints

#### Make Payment for Invoice
```
POST /payments/:invoiceId
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "Card",
  "amount": 550.00
}
```

#### Get Payments for Invoice
```
GET /payments/:invoiceId
Authorization: Bearer <token>
```

### Report Endpoints

#### Get User Report
```
GET /report
Authorization: Bearer <token>
```

### Health Check Endpoint

#### Server Health
```
GET /health
```

## 📝 Database Schema

The application uses the following main entities:

- **User** - Registered users with authentication
- **Customer** - Client information
- **Invoice** - Invoice records with line items
- **InvoiceItem** - Line items within an invoice
- **Item** - Reusable product/service catalog
- **Payment** - Payment records linked to invoices

All entities include timestamp tracking (`createdAt`, `updatedAt`) and creator tracking (`createdBy`).

## 🔐 Security Features

- **Password Hashing**: bcrypt with automatic salt generation
- **JWT Authentication**: Stateless token-based authentication
- **CORS**: Configured to accept requests from specific origins
- **Input Validation**: Zod schema validation on all inputs
- **Data Isolation**: User-scoped data access for multi-tenancy

## 📧 CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5500`
- `http://127.0.0.1:5500`

Modify the CORS settings in [src/index.ts](src/index.ts) to add additional allowed origins.

## 🤝 Contributing

When contributing to this project:

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Validate all inputs with Zod schemas
4. Add tests for new features
5. Keep database operations in the repository layer

## 📄 License

ISC

## 👤 Author

Suriyaprasath

---
