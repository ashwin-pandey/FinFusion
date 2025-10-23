# FinFusion - Personal Finance Tracking Application

A comprehensive full-stack personal finance tracking application built with React, Node.js, and PostgreSQL. Track income, expenses, create budgets, and gain insights into your financial habits.

## 🚀 Features

- **🔐 Authentication**: Google OAuth 2.0 + Email/Password login with JWT tokens
- **💰 Transaction Management**: Track income and expenses with detailed categorization
- **📊 Advanced Budgeting**: Create budgets with alerts, forecasting, and recommendations
- **📈 Analytics Dashboard**: Interactive charts and financial insights with "All Time" filtering
- **🏷️ Category Management**: Hierarchical categories with icons and colors
- **💱 Currency Support**: Multi-currency support with currency switcher
- **👤 Profile Management**: User profiles, password changes, and preferences
- **👑 Admin Features**: User management, role-based access control
- **📱 Responsive Design**: Mobile-friendly interface

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Material-UI** for components
- **React Router** for navigation
- **Recharts** for data visualization
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with TypeScript
- **Express.js** framework
- **Prisma** ORM with PostgreSQL
- **JWT** authentication
- **Google OAuth 2.0** integration
- **Rate limiting** and security headers

### Database
- **PostgreSQL 15+** as primary database
- **Prisma** for schema management
- **UUID** primary keys for all entities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or pnpm

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd FinFusion
   
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   ```

2. **Set up environment variables**
   
   Create `backend/.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/finfusion?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-here"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   PORT=5000
   FRONTEND_URL="http://localhost:3000"
   ADMIN_PASSWORD="admin123"
   ```

3. **Set up the database**
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

4. **Start development servers**
   
   Backend:
   ```bash
   cd backend && npm run dev
   ```
   
   Frontend:
   ```bash
   cd frontend && npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Default Admin: `admin@finfusion.com` / `admin123`

## 📁 Project Structure

```
FinFusion/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── store/           # Redux store and slices
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React contexts (Currency)
│   │   └── types/           # TypeScript definitions
├── backend/                  # Node.js TypeScript API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API route definitions
│   │   ├── models/          # Data models
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   └── utils/           # Utility functions
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Database seeding
└── CHANGELOG.md             # Detailed changelog
```

## 🔧 Development Scripts

### Backend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database
npm run prisma:studio    # Open Prisma Studio
```

### Frontend
```bash
npm start               # Start development server
npm run build           # Build for production
npm test                # Run tests
```

## 🔐 Security Features

- **Rate Limiting**: API endpoint protection
- **Input Validation**: Request validation with express-validator
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **CORS Configuration**: Secure cross-origin requests
- **Security Headers**: Helmet.js for HTTP security
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage

## 📊 Key Features

### Transaction Management
- Add, edit, delete transactions
- Income and expense categorization
- Date-based filtering and search
- Payment method tracking
- Recurring transaction support
- CSV import/export

### Budget Management
- Monthly, quarterly, yearly budgets
- Budget allocation and tracking
- Automatic alert system
- Sub-category budget tracking
- Budget recommendations

### Analytics & Reporting
- Dashboard with financial overview
- Spending trends and patterns
- Category breakdown analysis
- Budget performance tracking
- "All Time" data filtering
- Interactive charts

### User Management
- Profile editing and password changes
- Currency preference settings
- Role-based access control
- Admin user management
- Google OAuth integration

## 🎯 Recent Updates

- ✅ Fixed transaction count calculations
- ✅ Implemented budget sub-category tracking
- ✅ Added "All Time" data filtering
- ✅ Created automatic budget alert system
- ✅ Added currency switcher functionality
- ✅ Implemented profile management
- ✅ Added role-based access control
- ✅ Fixed UI alignment issues

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**FinFusion** - Take control of your finances, one transaction at a time! 💰✨

For detailed changelog and development notes, see [CHANGELOG.md](CHANGELOG.md).