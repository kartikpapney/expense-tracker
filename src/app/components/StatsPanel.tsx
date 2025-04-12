// StatsPanel.tsx
import React, { useMemo } from 'react';
import { CategoryTotals } from '../types';
import { Expense } from '../types';

interface StatsPanelProps {
  expenses: Expense[];
  totalExpenses: number;
  categoryTotals: CategoryTotals;
  currency: string;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ 
  expenses,
  totalExpenses, 
  categoryTotals, 
  currency 
}) => {
  // Calculate current month's expenses
  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    
    // Format current month as 'YYYY-MM'
    const yearMonthStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    
    // Sum expenses for current month
    return expenses.reduce((sum, expense) => {
      // Check if expense date starts with current year-month
      if (expense.date.startsWith(yearMonthStr)) {
        return sum + expense.amount;
      }
      return sum;
    }, 0);
  }, [expenses]);
  
  // Format month name
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  // Calculate percent of monthly vs total
  const monthlyPercent = totalExpenses > 0 
    ? Math.round((currentMonthExpenses / totalExpenses) * 100) 
    : 0;

  return (
    <div className="bg-white p-6 rounded shadow">
      {/* <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Total Expenses</h3>
        <div className="text-3xl font-bold text-black">{currency}{totalExpenses.toFixed(2)}</div>
      </div> */}
      
      {/* Current Month Expenses */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-medium text-gray-800">{currentMonthName} Expenses</h3>
        </div>
        <div className="text-2xl font-bold text-black">{currency}{currentMonthExpenses.toFixed(2)}</div>
      </div>
      
      {/* Categories */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Categories</h3>
        {Object.entries(categoryTotals).length > 0 ? (
          Object.entries(categoryTotals).map(([cat, amount]) => (
            <div key={cat} className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-700 capitalize">{cat}</span>
              <span className="font-medium">{currency}{amount.toFixed(2)}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No expenses yet</p>
        )}
      </div>
    </div>
  );
};

export default StatsPanel;