"use client"
// ExpenseCharts.tsx
import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Sector, BarChart, Bar, Rectangle
} from 'recharts';

// Types
interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  createdAt: Date;
}

interface ExpenseChartProps {
  expenses: Expense[];
  currency: string;
}

// Colors for pie chart segments and stacked bar chart
const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16'  // Lime
];

export const ExpenseLineChart: React.FC<ExpenseChartProps> = ({ expenses, currency }) => {
  // Process data for line chart (date vs amount) - filter for current month only
  const lineChartData = useMemo(() => {
    // Get current month and year
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    
    // Filter expenses for current month only
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === currentYear && expenseDate.getMonth() + 1 === currentMonth;
    });
    
    // Create a map to aggregate expenses by date
    const expensesByDate = currentMonthExpenses.reduce((acc, expense) => {
      const date = expense.date;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert map to array and sort by date
    return Object.entries(expensesByDate)
      .map(([date, amount]) => {
        // Format the date to show only day (e.g., "12" instead of "2025-04-12")
        const dayOnly = new Date(date).getDate().toString();
        return { date: dayOnly, fullDate: date, amount };
      })
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [expenses]);

  if (lineChartData.length === 0) {
    return <div className="p-4 text-center text-gray-500">No expenses for this month</div>;
  }

  // Get month name for the title
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div>
      <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        {currentMonthName} Trend
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={lineChartData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#64748b"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#64748b"
          />
          <Tooltip
            formatter={(value) => [`${currency}${value}`, 'Amount']}
            labelFormatter={(label, payload) => {
              // Use the fullDate stored in the payload to show a better formatted date
              if (payload && payload.length > 0 && payload[0].payload.fullDate) {
                return `Date: ${new Date(payload[0].payload.fullDate).toLocaleDateString()}`;
              }
              return `Day: ${label}`;
            }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            name="Expense Amount"
            stroke="#6b7280"
            strokeWidth={2}
            dot={{ r: 3, fill: '#6b7280' }}
            activeDot={{ r: 5, fill: '#374151' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ExpenseCategoryMonthlyBarChart: React.FC<ExpenseChartProps> = ({ expenses, currency }) => {
  // Process data for heatmap
  const heatmapData = useMemo(() => {
    const expensesByMonth: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const dateParts = expense.date.split('-');
      if (dateParts.length >= 2) {
        const yearMonth = `${dateParts[0]}-${dateParts[1]}`;
        expensesByMonth[yearMonth] = (expensesByMonth[yearMonth] || 0) + expense.amount;
      }
    });
    
    // Get last 12 months or all available data (whichever is less)
    const monthEntries = Object.entries(expensesByMonth)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
    
    const last12Months = monthEntries.slice(-12);
    
    // If we have less than 12 months, fill from current month backwards
    const result: Array<{ yearMonth: string; amount: number; monthName: string; year: string }> = [];
    
    if (last12Months.length > 0) {
      // Use actual data
      last12Months.forEach(([yearMonth, amount]) => {
        const date = new Date(`${yearMonth}-01`);
        result.push({
          yearMonth,
          amount,
          monthName: date.toLocaleString('default', { month: 'short' }),
          year: date.getFullYear().toString()
        });
      });
    } else {
      // No data, show empty heatmap for current year
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        result.push({
          yearMonth,
          amount: 0,
          monthName: date.toLocaleString('default', { month: 'short' }),
          year: date.getFullYear().toString()
        });
      }
    }
    
    return result;
  }, [expenses]);

  if (heatmapData.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">No monthly data available</p>
      </div>
    );
  }

  const maxAmount = Math.max(...heatmapData.map(d => d.amount));
  const minAmount = Math.min(...heatmapData.filter(d => d.amount > 0).map(d => d.amount));

  // Function to get color intensity based on amount with new ranges
  const getColorIntensity = (amount: number) => {
    if (amount === 0) return 'bg-gray-100';
    
    // Green: 0-30k
    if (amount < 30000) {
      if (amount >= 25000) return 'bg-green-600';      // 25k-30k: darker green
      if (amount >= 20000) return 'bg-green-500';      // 20k-25k
      if (amount >= 15000) return 'bg-green-400';      // 15k-20k
      if (amount >= 10000) return 'bg-green-300';      // 10k-15k
      if (amount >= 5000) return 'bg-green-200';       // 5k-10k
      return 'bg-green-100';                           // 0-5k: lightest green
    }
    
    // Yellow: 30k-35k
    if (amount < 35000) {
      if (amount >= 34000) return 'bg-yellow-600';     // 34k-35k: darker yellow
      if (amount >= 33000) return 'bg-yellow-500';     // 33k-34k
      if (amount >= 32000) return 'bg-yellow-400';     // 32k-33k
      if (amount >= 31000) return 'bg-yellow-300';     // 31k-32k
      return 'bg-yellow-200';                          // 30k-31k: lighter yellow
    }
    
    // Red: 35k+ with increasing density
    if (amount >= 50000) return 'bg-red-900';         // 50k+: darkest red
    if (amount >= 45000) return 'bg-red-800';         // 45k-50k
    if (amount >= 42000) return 'bg-red-700';         // 42k-45k
    if (amount >= 39000) return 'bg-red-600';         // 39k-42k
    if (amount >= 37000) return 'bg-red-500';         // 37k-39k
    if (amount >= 36000) return 'bg-red-400';         // 36k-37k
    return 'bg-red-300';                              // 35k-36k: lightest red
  };

  // Calculate average monthly expense (excluding current and future months)
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  
  // Only include months that are in the past AND have some expense data
  const completedMonths = heatmapData.filter(month => {
    const monthDate = new Date(`${month.yearMonth}-01`);
    const currentDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
    
    // Month must be before current month and have expenses
    return monthDate < currentDate && month.amount > 0;
  });
  
  const totalAmount = completedMonths.reduce((sum, month) => sum + month.amount, 0);
  
  const averageMonthlyExpense = completedMonths.length > 0 
    ? totalAmount / completedMonths.length 
    : 0;

  // Group by year for better organization
  const yearGroups = heatmapData.reduce((groups, month) => {
    if (!groups[month.year]) {
      groups[month.year] = [];
    }
    groups[month.year].push(month);
    return groups;
  }, {} as Record<string, typeof heatmapData>);

  return (
    <div>
      <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Monthly Expenses Heatmap ({currency}{averageMonthlyExpense.toFixed(0)})
      </h3>
      
      <div className="bg-white p-4 rounded-lg">
        {Object.entries(yearGroups).map(([year, months]) => (
          <div key={year} className="mb-6 last:mb-0">
            <h4 className="text-sm font-medium text-gray-700 mb-3">{year}</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {months.map((monthData) => (
                <div
                  key={monthData.yearMonth}
                  className={`
                    aspect-square rounded-lg p-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md
                    ${getColorIntensity(monthData.amount)}
                    border border-gray-200
                  `}
                  title={`${monthData.monthName} ${monthData.year}: ${currency}${monthData.amount.toLocaleString()}`}
                >
                  <div className="h-full flex flex-col justify-between text-center">
                    <div className="text-xs font-medium text-gray-700">
                      {monthData.monthName}
                    </div>
                    <div className="text-xs font-bold text-gray-900">
                      {monthData.amount > 0 ? `${currency}${monthData.amount.toLocaleString()}` : '-'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 mb-3">Expense ranges</div>
          
          {/* Updated color scale */}
          <div className="flex items-center gap-1 mb-4">
            <span className="text-xs text-gray-500">₹0</span>
            <div className="w-3 h-3 bg-gray-100 rounded border"></div>
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <div className="w-3 h-3 bg-green-300 rounded"></div>
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <div className="w-3 h-3 bg-yellow-200 rounded"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <div className="w-3 h-3 bg-red-300 rounded"></div>
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <div className="w-3 h-3 bg-red-900 rounded"></div>
            <span className="text-xs text-gray-500 ml-1">₹50k+</span>
          </div>
          
          {/* Range indicators */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded"></div>
              <span>₹0-30k</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-400 rounded"></div>
              <span>₹30-35k</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded"></div>
              <span>₹35k+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExpensePieChart: React.FC<ExpenseChartProps> = ({ expenses, currency }) => {
  // Process data for pie chart (category vs amount)
  const pieChartData = useMemo(() => {
    // Create a map to aggregate expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert map to array
    return Object.entries(expensesByCategory).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize category name
      value
    }));
  }, [expenses]);

  // Custom label for pie segments
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, name
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (pieChartData.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">No category data</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
        Category Distribution
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={pieChartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {pieChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${currency}${value}`, 'Amount']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Combined charts component
const ExpenseCharts: React.FC<ExpenseChartProps> = ({ expenses, currency }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-900">Expense Analytics</h2>
          <p className="text-sm text-gray-500">Visual insights into your spending patterns</p>
        </div>
      </div>

      {/* Charts Container */}
      <div className="space-y-8">
        {/* Mobile: Stack charts vertically, Desktop: Show charts side by side */}
        <div className="bg-gray-50 rounded-lg p-4">
          <ExpenseLineChart expenses={expenses} currency={currency} />
        </div>
        
        {/* Monthly bar chart takes full width */}
        <div className="bg-gray-50 rounded-lg p-4">
          <ExpenseCategoryMonthlyBarChart expenses={expenses} currency={currency} />
        </div>
      </div>
    </div>
  );
};

export default ExpenseCharts;