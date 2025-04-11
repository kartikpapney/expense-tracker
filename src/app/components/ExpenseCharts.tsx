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
  '#333333', // Dark gray
  '#555555', // Medium-dark gray
  '#777777', // Medium gray
  '#999999', // Medium-light gray
  '#BBBBBB', // Light gray
  '#DDDDDD'  // Very light gray
];

export const ExpenseLineChart: React.FC<ExpenseChartProps> = ({ expenses, currency }) => {
  // Process data for line chart (date vs amount)
  const lineChartData = useMemo(() => {
    // Create a map to aggregate expenses by date
    const expensesByDate = expenses.reduce((acc, expense) => {
      const date = expense.date;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert map to array and sort by date
    return Object.entries(expensesByDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expenses]);

  if (lineChartData.length === 0) {
    return <div className="p-4 text-center text-gray-500">No data available for chart</div>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium text-gray-800 mb-3">Expense Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={lineChartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis 
            tickFormatter={(value) => `${currency}${value}`}
          />
          <Tooltip 
            formatter={(value) => [`${currency}${value}`, 'Amount']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="amount"
            name="Expense Amount"
            stroke="#333333"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ExpenseCategoryMonthlyBarChart: React.FC<ExpenseChartProps> = ({ expenses, currency }) => {
  // Process data for monthly stacked bar chart
  const monthlyChartData = useMemo(() => {
    // Step 1: Get all unique categories
    const categories = Array.from(new Set(expenses.map(e => e.category)));
    
    // Step 2: Group expenses by month and then by category
    const expensesByMonth: Record<string, Record<string, number>> = {};
    
    expenses.forEach(expense => {
      // Extract year and month from date (format: YYYY-MM-DD)
      const dateParts = expense.date.split('-');
      if (dateParts.length >= 2) {
        const yearMonth = `${dateParts[0]}-${dateParts[1]}`; // YYYY-MM
        
        // Initialize month if not exists
        if (!expensesByMonth[yearMonth]) {
          expensesByMonth[yearMonth] = {};
          // Initialize all categories with 0
          categories.forEach(cat => {
            expensesByMonth[yearMonth][cat] = 0;
          });
        }
        
        // Add expense amount to corresponding category
        expensesByMonth[yearMonth][expense.category] += expense.amount;
      }
    });
    
    // Step 3: Convert map to array format for recharts
    const result = Object.entries(expensesByMonth).map(([yearMonth, categoryAmounts]) => {
      // Create an object with month name and all category amounts
      const monthData: any = {
        month: new Date(`${yearMonth}-01`).toLocaleString('default', { month: 'short', year: 'numeric' }),
        yearMonth // Keep for sorting
      };
      
      // Add all category amounts
      Object.entries(categoryAmounts).forEach(([category, amount]) => {
        monthData[category] = amount;
      });
      
      return monthData;
    });
    
    // Sort by date
    return result.sort((a, b) => new Date(a.yearMonth).getTime() - new Date(b.yearMonth).getTime());
  }, [expenses]);

  // Get all unique categories for legend
  const categories = useMemo(() => {
    return Array.from(new Set(expenses.map(e => e.category)));
  }, [expenses]);

  if (monthlyChartData.length === 0) {
    return <div className="p-4 text-center text-gray-500">No data available for chart</div>;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-800 mb-3">Monthly Expenses by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={monthlyChartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#333333' }}
            axisLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis 
            tickFormatter={(value) => `${currency}${value}`}
            tick={{ fill: '#333333' }}
            axisLine={{ stroke: '#e0e0e0' }}
          />
          <Tooltip 
            formatter={(value) => [
              `${currency}${value}`
            ]}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #f0f0f0',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
            }}
          />
          <Legend />
          {categories.map((category, index) => (
            <Bar 
              key={category}
              dataKey={category}
              name={category.charAt(0).toUpperCase() + category.slice(1)} // Capitalize
              stackId="a"
              fill={COLORS[index % COLORS.length]}
              radius={index === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} // Round only top of last bar
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
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
    return <div className="p-4 text-center text-gray-500">No data available for chart</div>;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-800 mb-3">Expense by Category</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={pieChartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${currency}${value}`, 'Amount']}
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
    <div className="bg-white p-6 rounded shadow">
      <ExpenseLineChart expenses={expenses} currency={currency} />
      <ExpenseCategoryMonthlyBarChart expenses={expenses} currency={currency} />
      <ExpensePieChart expenses={expenses} currency={currency} />
    </div>
  );
};

export default ExpenseCharts;