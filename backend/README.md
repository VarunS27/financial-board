# Financial Analytics Dashboard - Backend

A powerful RESTful API for managing financial transactions, investments, and portfolio tracking with real-time stock data integration.

## Features

- 🔐 JWT-based authentication
- 💰 Transaction management (Income/Expense CRUD)
- 📊 Portfolio tracking with real-time stock prices
- 📈 Stock market data integration (Alpha Vantage API)
- 🗄️ MongoDB database with Mongoose ODM
- ⚡ Express.js server with CORS support
- 🔄 API caching to optimize rate limits

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Alpha Vantage API** - Stock market data

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (free tier)
- Alpha Vantage API key (free from https://www.alphavantage.co/)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
FRONTEND_URL=http://localhost:5173
```

## Getting MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `<dbname>` with your database name

## Getting Alpha Vantage API Key

1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Enter your email and get instant free API key
3. Free tier: 25 requests/day

## Running the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/user/profile` - Get user profile (Protected)
- `PUT /api/user/profile` - Update user profile (Protected)

### Transactions
- `GET /api/transactions` - Get all transactions (Protected)
- `POST /api/transactions` - Create transaction (Protected)
- `GET /api/transactions/:id` - Get single transaction (Protected)
- `PUT /api/transactions/:id` - Update transaction (Protected)
- `DELETE /api/transactions/:id` - Delete transaction (Protected)
- `GET /api/transactions/stats/summary` - Get analytics (Protected)

### Portfolio
- `GET /api/portfolio` - Get portfolio with current prices (Protected)
- `POST /api/portfolio` - Add stock to portfolio (Protected)
- `GET /api/portfolio/:id` - Get single portfolio item (Protected)
- `PUT /api/portfolio/:id` - Update portfolio item (Protected)
- `DELETE /api/portfolio/:id` - Delete portfolio item (Protected)

### Stocks
- `GET /api/stocks/:symbol` - Get stock quote (Protected)
- `GET /api/stocks/:symbol/history` - Get stock history (Protected)
- `GET /api/stocks/search/:query` - Search stocks (Protected)

## Deployment

### Railway / Render

1. Create account on [Railway](https://railway.app/) or [Render](https://render.com/)
2. Connect your GitHub repository
3. Set environment variables in dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set all variables from `.env.example` in your hosting platform's environment variables section.

## Project Structure

```
backend/
├── config/
│   └── db.js           # MongoDB connection
├── middleware/
│   └── auth.js         # JWT authentication middleware
├── models/
│   ├── User.js         # User model
│   ├── Transaction.js  # Transaction model
│   └── Portfolio.js    # Portfolio model
├── routes/
│   ├── auth.js         # Auth & user routes
│   ├── transactions.js # Transaction routes
│   ├── portfolio.js    # Portfolio routes
│   └── stocks.js       # Stock data routes
├── .env                # Environment variables (create from .env.example)
├── .env.example        # Environment variables template
├── server.js           # Express app entry point
└── package.json        # Dependencies
```

## Security Notes

- Never commit `.env` file to version control
- Use strong JWT_SECRET in production
- Enable MongoDB network access restrictions
- Use HTTPS in production
- Implement rate limiting for production

## License

MIT
