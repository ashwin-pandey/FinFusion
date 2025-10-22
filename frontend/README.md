# FinFusion Frontend

React + TypeScript frontend for FinFusion financial tracking application.

## Features

- 🔐 **Authentication**: Login/Register with Google OAuth support
- 💳 **Transactions**: Full CRUD operations with filtering and search
- 💰 **Budgets**: Advanced budget tracking with alerts and recommendations
- 📊 **Dashboard**: Interactive charts and financial insights
- 📁 **Categories**: Hierarchical category management
- 📈 **Analytics**: Spending trends and category breakdowns
- 🎨 **Modern UI**: Responsive design with beautiful gradients and animations

## Tech Stack

- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router DOM** for routing
- **Recharts** for data visualization
- **Axios** for API calls
- **CSS** for styling

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

4. Start development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx       # Main layout with sidebar
│   └── PrivateRoute.tsx # Protected route wrapper
├── pages/               # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Transactions.tsx
│   ├── Categories.tsx
│   ├── Budgets.tsx
│   ├── Analytics.tsx
│   └── Profile.tsx
├── services/            # API service modules
│   ├── api.ts          # Axios instance
│   ├── authService.ts
│   ├── transactionService.ts
│   ├── categoryService.ts
│   ├── budgetService.ts
│   └── analyticsService.ts
├── store/              # Redux store
│   ├── index.ts        # Store configuration
│   └── slices/         # Redux slices
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useTransactions.ts
│   ├── useCategories.ts
│   ├── useBudgets.ts
│   └── useAnalytics.ts
├── utils/              # Utility functions
│   ├── formatters.ts
│   ├── validation.ts
│   ├── dateHelpers.ts
│   ├── chartHelpers.ts
│   └── exportHelpers.ts
├── types/              # TypeScript types
│   └── index.ts
└── App.tsx            # Main app component
```

## Features Implementation Status

### ✅ Completed
- Authentication flow (Login/Register)
- Protected routes
- Redux store setup
- API services
- Custom hooks
- Utility functions
- Dashboard with charts
- Transactions page (full CRUD)
- Responsive layout

### 🚧 In Progress
- Categories management UI
- Budgets management UI
- Analytics page UI
- Google OAuth integration

### 📋 Planned
- Transaction import/export
- Budget recommendations
- Advanced analytics
- Notifications
- Dark mode

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR

## License

MIT
