import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionService, portfolioService } from '../services';
import StatsCard from '../components/StatsCard';
import ChartCard from '../components/ChartCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, subMonths } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    transactions: { summary: {}, transactions: [] },
    portfolio: { summary: {}, portfolio: [] },
    stats: { monthlyData: [], categoryData: [] },
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [transactionsRes, portfolioRes, statsRes] = await Promise.all([
        transactionService.getAll(),
        portfolioService.getAll(),
        transactionService.getStats(6),
      ]);

      setDashboardData({
        transactions: transactionsRes,
        portfolio: portfolioRes,
        stats: statsRes,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const { transactions, portfolio, stats } = dashboardData;
  const summary = transactions.summary || {};
  const portfolioSummary = portfolio.summary || {};

  // Prepare chart data
  const monthlyIncomeExpense = [];
  const monthNames = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    monthNames.push(format(date, 'MMM yyyy'));
  }

  monthNames.forEach((month) => {
    const incomeData = stats.monthlyData?.find(
      (d) => d._id.type === 'income' && format(new Date(d._id.year, d._id.month - 1), 'MMM yyyy') === month
    );
    const expenseData = stats.monthlyData?.find(
      (d) => d._id.type === 'expense' && format(new Date(d._id.year, d._id.month - 1), 'MMM yyyy') === month
    );

    monthlyIncomeExpense.push({
      month,
      income: incomeData?.total || 0,
      expense: expenseData?.total || 0,
    });
  });

  // Category pie chart data
  const categoryChartData = stats.categoryData
    ?.filter((d) => d._id.type === 'expense')
    .slice(0, 6)
    .map((d) => ({
      name: d._id.category,
      value: d.total,
    })) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Portfolio performance mock data (you can enhance this with real historical data)
  const portfolioPerformance = monthNames.map((month, idx) => ({
    month,
    value: portfolioSummary.totalValue ? portfolioSummary.totalValue * (0.9 + idx * 0.03) : 0,
  }));

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your finances today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Portfolio Value"
          value={`$${portfolioSummary.totalValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
          change={portfolioSummary.totalGainLossPercentage || 0}
          icon={Wallet}
          trend={portfolioSummary.totalGainLoss > 0 ? 'up' : 'down'}
        />
        <StatsCard
          title="Net Gain/Loss"
          value={`$${portfolioSummary.totalGainLoss?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
          icon={portfolioSummary.totalGainLoss >= 0 ? ArrowUpRight : ArrowDownRight}
          trend={portfolioSummary.totalGainLoss >= 0 ? 'up' : 'down'}
        />
        <StatsCard
          title="Total Income"
          value={`$${summary.totalIncome?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
          icon={TrendingUp}
          trend="up"
        />
        <StatsCard
          title="Total Expenses"
          value={`$${summary.totalExpense?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
          icon={TrendingDown}
          trend="down"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Performance */}
        <ChartCard title="Portfolio Performance">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={portfolioPerformance}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="month" className="text-xs" stroke="#888" />
              <YAxis className="text-xs" stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ fill: '#0ea5e9', r: 4 }}
                activeDot={{ r: 6 }}
                name="Portfolio Value"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Income vs Expense */}
        <ChartCard title="Income vs Expense">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyIncomeExpense}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="month" className="text-xs" stroke="#888" />
              <YAxis className="text-xs" stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense by Category */}
        <ChartCard title="Expenses by Category">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Recent Transactions */}
        <ChartCard title="Recent Transactions">
          <div className="space-y-3">
            {transactions.transactions?.slice(0, 5).map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}
                  >
                    {transaction.type === 'income' ? (
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.category}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-semibold ${
                    transaction.type === 'income'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}$
                  {transaction.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {transactions.transactions?.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No transactions yet
              </p>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
