import { useState, useEffect } from 'react';
import { transactionService } from '../services';
import ChartCard from '../components/ChartCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Lightbulb } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ monthlyData: [], categoryData: [] });
  const [transactions, setTransactions] = useState([]);
  const [timeRange, setTimeRange] = useState('6');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [statsData, transData] = await Promise.all([
        transactionService.getStats(parseInt(timeRange)),
        transactionService.getAll()
      ]);
      setStats(statsData);
      setTransactions(transData.transactions || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Financial Analytics Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated on ${format(new Date(), 'MMMM dd, yyyy')}`, 14, 30);
    
    // Transactions table
    doc.setFontSize(14);
    doc.text('Recent Transactions', 14, 45);
    
    const tableData = transactions.slice(0, 20).map(t => [
      format(new Date(t.date), 'MMM dd, yyyy'),
      t.type,
      t.category,
      `$${t.amount.toFixed(2)}`
    ]);
    
    doc.autoTable({
      startY: 50,
      head: [['Date', 'Type', 'Category', 'Amount']],
      body: tableData,
    });
    
    doc.save('financial-analytics.pdf');
  };

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
    const rows = transactions.map(t => [
      format(new Date(t.date), 'yyyy-MM-dd'),
      t.type,
      t.category,
      t.amount,
      t.description || ''
    ]);
    
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  };

  // Prepare monthly summary data
  const monthlySummary = {};
  stats.monthlyData?.forEach(item => {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    if (!monthlySummary[key]) {
      monthlySummary[key] = { month: format(new Date(item._id.year, item._id.month - 1), 'MMM yyyy'), income: 0, expense: 0 };
    }
    if (item._id.type === 'income') {
      monthlySummary[key].income = item.total;
    } else {
      monthlySummary[key].expense = item.total;
    }
  });

  const monthlyChartData = Object.values(monthlySummary).map(item => ({
    ...item,
    savings: item.income - item.expense,
  }));

  // Category summary
  const categoryExpenses = stats.categoryData
    ?.filter(d => d._id.type === 'expense')
    .map(d => ({
      category: d._id.category,
      amount: d.total,
    })) || [];

  const categoryIncome = stats.categoryData
    ?.filter(d => d._id.type === 'income')
    .map(d => ({
      category: d._id.category,
      amount: d.total,
    })) || [];

  // AI Financial Tips
  const financialTips = [
    "Build an emergency fund covering 3-6 months of expenses",
    "Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings",
    "Diversify your investment portfolio to reduce risk",
    "Review and reduce recurring subscriptions you don't use",
    "Set up automatic transfers to your savings account",
    "Track every expense to identify spending patterns",
    "Consider high-yield savings accounts for better returns",
    "Pay off high-interest debt before investing",
  ];

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed financial insights and reports
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="3">Last 3 Months</option>
            <option value="6">Last 6 Months</option>
            <option value="12">Last 12 Months</option>
          </select>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income vs Expense */}
        <ChartCard title="Monthly Income vs Expense">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Monthly Savings Trend */}
        <ChartCard title="Monthly Savings Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="savings" stroke="#0ea5e9" strokeWidth={2} name="Net Savings" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category-wise Expenses */}
        <ChartCard title="Expenses by Category">
          <div className="space-y-3">
            {categoryExpenses.slice(0, 8).map((item, idx) => {
              const total = categoryExpenses.reduce((sum, cat) => sum + cat.amount, 0);
              const percentage = (item.amount / total) * 100;
              return (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{item.category}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${item.amount.toFixed(2)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* Category-wise Income */}
        <ChartCard title="Income by Category">
          <div className="space-y-3">
            {categoryIncome.slice(0, 8).map((item, idx) => {
              const total = categoryIncome.reduce((sum, cat) => sum + cat.amount, 0);
              const percentage = (item.amount / total) * 100;
              return (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{item.category}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${item.amount.toFixed(2)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Financial Tips */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-600 rounded-lg">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            AI-Powered Financial Tips
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {financialTips.map((tip, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 bg-white dark:bg-gray-800 p-3 rounded-lg"
            >
              <span className="text-primary-600 dark:text-primary-400 font-bold">•</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
