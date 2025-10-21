# FinFusion Backend Setup Guide

This guide will help you set up the FinFusion backend application with proper database configuration and all necessary dependencies.

## Prerequisites

- Node.js 18+ (recommended: Node.js 20+)
- PostgreSQL 15+
- npm or pnpm package manager

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/finfusion?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Server
PORT=5000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:3000"
```

### 3. Database Setup

#### Option A: Automated Setup (Recommended)
```bash
npm run db:setup
```

#### Option B: Manual Setup
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run dev
```

## Database Configuration

### PostgreSQL Setup

1. **Install PostgreSQL** (if not already installed)
2. **Create Database**:
   ```sql
   CREATE DATABASE finfusion;
   ```
3. **Update DATABASE_URL** in your `.env` file

### Database Schema

The application uses the following main entities:

- **Users**: User accounts with Google OAuth integration
- **Categories**: Income/expense categories with hierarchy support
- **Transactions**: Financial transactions with categorization
- **Budgets**: Budget allocations with alert thresholds
- **Budget Alerts**: Alert notifications for budget thresholds

### Default Categories

The database is seeded with default categories:

**Income Categories:**
- Salary, Freelance, Investment, Business, Other Income

**Expense Categories:**
- Food & Dining (with subcategories: Groceries, Restaurants, Coffee & Snacks, Fast Food)
- Transportation (with subcategories: Gas, Public Transport, Rideshare, Parking, Car Maintenance)
- Shopping, Entertainment, Bills & Utilities, Healthcare, Education, Travel, Personal Care, Home & Garden, Technology, Sports & Fitness, Gifts & Donations, Insurance, Taxes, Other Expenses

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### Transactions
- `GET /api/transactions` - List transactions (with filtering)
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction details
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/analytics/overview` - Get transaction analytics
- `POST /api/transactions/import` - Import transactions
- `GET /api/transactions/export` - Export transactions

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create custom category
- `GET /api/categories/:id` - Get category details
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/categories/hierarchy` - Get category hierarchy
- `GET /api/categories/stats` - Get category statistics

### Budgets
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets/:id` - Get budget details
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/recommendations` - Get budget recommendations
- `GET /api/budgets/analytics` - Get budget analytics
- `GET /api/budgets/performance` - Get budget performance
- `POST /api/budgets/check-alerts` - Check budget alerts
- `GET /api/budgets/:budgetId/alerts` - Get budget alerts
- `PUT /api/budgets/alerts/:alertId/acknowledge` - Acknowledge alert

### Analytics
- `GET /api/analytics/overview` - Dashboard overview
- `GET /api/analytics/trends` - Spending trends
- `GET /api/analytics/category-breakdown` - Category distribution
- `GET /api/analytics/budget-performance` - Budget vs actual
- `GET /api/analytics/insights` - Financial insights

## Development Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build           # Build for production
npm start               # Start production server

# Database
npm run db:setup        # Complete database setup
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run database migrations
npm run prisma:seed     # Seed database with default data
npm run prisma:studio   # Open Prisma Studio

# Testing
npm test               # Run tests (when implemented)
```

## Architecture

The backend follows a clean architecture pattern:

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── models/          # Data access layer
├── routes/          # API route definitions
├── middleware/      # Express middleware
├── config/          # Configuration files
└── utils/           # Utility functions
```

### Layer Responsibilities

- **Controllers**: Handle HTTP requests/responses, input validation
- **Services**: Business logic, data processing, external integrations
- **Models**: Database operations, data access patterns
- **Routes**: API endpoint definitions, middleware composition
- **Middleware**: Cross-cutting concerns (auth, validation, error handling)

## Security Features

- **Rate Limiting**: API endpoint protection
- **Input Validation**: Request validation with express-validator
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **CORS Configuration**: Secure cross-origin requests
- **Security Headers**: Helmet.js for HTTP security
- **JWT Authentication**: Secure token-based authentication
- **Environment Variables**: Secure configuration management

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env file
   - Ensure database exists

2. **Prisma Client Error**
   - Run `npm run prisma:generate`
   - Check Prisma schema syntax

3. **Migration Errors**
   - Reset database: `npx prisma migrate reset`
   - Check for schema conflicts

4. **Google OAuth Error**
   - Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
   - Check redirect URLs in Google Console

### Debug Mode

Enable debug logging:
```env
NODE_ENV=development
DEBUG=finfusion:*
```

## Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment variables**:
   ```env
   NODE_ENV=production
   DATABASE_URL="your-production-database-url"
   JWT_SECRET="your-production-jwt-secret"
   ```

3. **Run database migrations**:
   ```bash
   npx prisma migrate deploy
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

## Support

If you encounter any issues:

1. Check the logs for error messages
2. Verify all environment variables are set
3. Ensure PostgreSQL is running and accessible
4. Check the Prisma schema for syntax errors
5. Review the API documentation for correct endpoint usage

For additional help, refer to the main README.md file or create an issue in the repository.
