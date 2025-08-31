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
  // Process data for monthly chart
  const monthlyChartData = useMemo(() => {
    const categories = Array.from(new Set(expenses.map(e => e.category)));
    const expensesByMonth: Record<string, Record<string, number>> = {};
    
    expenses.forEach(expense => {
      const dateParts = expense.date.split('-');
      if (dateParts.length >= 2) {
        const yearMonth = `${dateParts[0]}-${dateParts[1]}`;
        
        if (!expensesByMonth[yearMonth]) {
          expensesByMonth[yearMonth] = {};
          categories.forEach(cat => {
            expensesByMonth[yearMonth][cat] = 0;
          });
        }
        
        expensesByMonth[yearMonth][expense.category] += expense.amount;
      }
    });
    
    const result = Object.entries(expensesByMonth).map(([yearMonth, categoryAmounts]) => {
      const total = Object.values(categoryAmounts).reduce((sum, amount) => sum + amount, 0);
      return {
        month: new Date(`${yearMonth}-01`).toLocaleString('default', { month: 'short', year: 'numeric' }),
        yearMonth,
        total,
        categories: categoryAmounts
      };
    });
    
    return result.sort((a, b) => new Date(a.yearMonth).getTime() - new Date(b.yearMonth).getTime());
  }, [expenses]);

  const categories = useMemo(() => {
    return Array.from(new Set(expenses.map(e => e.category)));
  }, [expenses]);

  if (monthlyChartData.length === 0) {
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

  const maxTotal = Math.max(...monthlyChartData.map(d => d.total));
  const categoryColors = [
    '#ef4444', // Red for Comforts
    '#eab308', // Yellow for Necessities  
    '#22c55e', // Green for Basics
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#84cc16'  // Lime
  ];

  return (
    <div>
      <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center">
        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Monthly by Category
      </h3>
      
      {/* Custom HTML/CSS Chart */}
      <div className="bg-white p-4 rounded-lg">
        <div className="flex items-end justify-between space-x-3 mb-4" style={{ height: '280px' }}>
          {monthlyChartData.map((monthData, monthIndex) => {
            const heightPercentage = (monthData.total / maxTotal) * 80; // Use 80% of container height
            const minHeight = 40; // Minimum height in pixels
            const barHeight = Math.max(heightPercentage, minHeight);
            
            return (
              <div key={monthData.month} className="flex-1 flex flex-col items-center justify-end h-full">
                {/* Total amount label */}
                <div className="text-xs font-semibold text-gray-700 mb-2 text-center">
                  {currency}{monthData.total.toLocaleString()}
                </div>
                
                {/* Stacked bar container */}
                <div className="flex flex-col justify-end w-full max-w-12" style={{ height: '200px' }}>
                  <div 
                    className="w-full rounded-t-md relative flex flex-col-reverse border border-gray-200"
                    style={{ 
                      height: `${barHeight}px`,
                      minHeight: `${minHeight}px`
                    }}
                  >
                    {categories.map((category, categoryIndex) => {
                      const amount = monthData.categories[category] || 0;
                      if (amount === 0) return null;
                      
                      const segmentPercentage = (amount / monthData.total) * 100;
                      const color = categoryColors[categoryIndex % categoryColors.length];
                      
                      return (
                        <div
                          key={category}
                          className="w-full"
                          style={{
                            height: `${segmentPercentage}%`,
                            backgroundColor: color,
                            borderTopLeftRadius: categoryIndex === categories.length - 1 ? '6px' : '0',
                            borderTopRightRadius: categoryIndex === categories.length - 1 ? '6px' : '0'
                          }}
                          title={`${category}: ${currency}${amount.toLocaleString()}`}
                        />
                      );
                    })}
                  </div>
                </div>
                
                {/* Month label */}
                <div className="text-xs text-gray-600 mt-2 text-center">
                  {monthData.month}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          {categories.map((category, index) => (
            <div key={category} className="flex items-center">
              <div 
                className="w-3 h-3 rounded mr-2"
                style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
              />
              <span className="text-gray-700 capitalize">{category}</span>
            </div>
          ))}
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