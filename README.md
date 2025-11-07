# Financial Analytics Dashboard - Frontend

A modern, responsive React dashboard for managing personal finances, tracking investments, and analyzing spending patterns with interactive charts and real-time stock data.

## Features

- 🎨 **Beautiful UI** - Dark/Light theme with Tailwind CSS
- 📊 **Interactive Charts** - Recharts for data visualization
- 💼 **Portfolio Tracking** - Real-time stock prices and performance
- 💰 **Transaction Management** - Full CRUD operations
- 📈 **Analytics** - Monthly reports with CSV/PDF export
- 🔐 **Secure Authentication** - JWT-based auth with protected routes
- 📱 **Responsive Design** - Mobile-first approach
- ⚡ **Fast & Modern** - Built with React 19 and Vite

## Tech Stack

- **React 19** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Recharts** - Charts and graphs
- **Axios** - HTTP client
- **Lucide React** - Icons
- **jsPDF** - PDF export
- **date-fns** - Date utilities

## Prerequisites

- Node.js (v14 or higher)
- Backend API running (see backend README)

## Installation

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## Running the App

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ChartCard.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatsCard.jsx
│   │   └── Toast.jsx
│   ├── context/        # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/          # Page components
│   │   ├── Analytics.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Investments.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Settings.jsx
│   │   └── Transactions.jsx
│   ├── services/       # API services
│   │   ├── api.js
│   │   └── index.js
│   ├── App.jsx         # Main app component
│   ├── index.css       # Global styles
│   └── main.jsx        # Entry point
├── .env                # Environment variables
├── .env.example        # Environment template
├── tailwind.config.js  # Tailwind configuration
├── vite.config.js      # Vite configuration
└── package.json        # Dependencies
```

## Pages Overview

### Dashboard
- Portfolio value and performance
- Income vs expense charts
- Recent transactions
- Category breakdown

### Transactions
- Add/Edit/Delete transactions
- Filter by type, date, category
- Search functionality
- Categorized income/expenses

### Investments
- Portfolio management
- Real-time stock prices
- Add stocks with live search
- Gain/loss tracking
- Stock price history charts

### Analytics
- Monthly income/expense trends
- Category-wise breakdown
- Savings analysis
- Export to CSV/PDF
- AI-powered financial tips

### Settings
- Profile management
- Theme toggle (Dark/Light)
- Chart preferences
- Account information

## Features in Detail

### Authentication
- JWT token storage in localStorage
- Protected routes
- Auto-redirect on token expiration
- Secure login/register flows

### Dark Mode
- System preference detection
- Toggle switch
- Persistent theme storage
- Smooth transitions

### Charts & Visualizations
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Interactive tooltips
- Responsive design

### Data Export
- CSV export for transactions
- PDF reports with jsPDF
- Custom date ranges
- Summary statistics

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard

### Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy `dist` folder to Netlify

3. Set environment variables in Netlify dashboard

### Environment Variables

Make sure to update `VITE_API_URL` to your production backend URL after deployment.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Dependencies Installation Issues
If you encounter peer dependency errors:
```bash
npm install --legacy-peer-deps
```

### Build Errors
Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### API Connection Issues
- Check if backend is running
- Verify `VITE_API_URL` in `.env`
- Check CORS configuration in backend

## License

MIT


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
