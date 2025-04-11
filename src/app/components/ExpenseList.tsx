"use client"

import React, { useState, useMemo } from 'react';
import { Expense } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  currency: string;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ 
  expenses, 
  currency, 
  onEdit, 
  onDelete 
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const expensesPerPage = 3;

  // Sort expenses by date (newest first)
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);

  // Get current expenses for pagination
  const indexOfLastExpense = currentPage * expensesPerPage;
  const indexOfFirstExpense = indexOfLastExpense - expensesPerPage;
  const currentExpenses = sortedExpenses.slice(indexOfFirstExpense, indexOfLastExpense);
  
  // Calculate total pages
  const totalPages = Math.ceil(expenses.length / expensesPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Function to convert expenses to CSV format
  const convertToCSV = (expenses: Expense[]) => {
    // CSV header
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    
    // Create CSV rows
    const csvRows = [
      headers.join(','), // Header row
      ...sortedExpenses.map(expense => {
        // Format the row data and handle potential commas in description
        return [
          expense.date,
          `"${expense.description.replace(/"/g, '""')}"`, // Escape quotes
          expense.category,
          expense.amount.toFixed(2)
        ].join(',');
      })
    ];
    
    // Combine rows to create CSV content
    return csvRows.join('\n');
  };
  
  // Function to download CSV file
  const downloadCSV = () => {
    if (expenses.length === 0) {
      alert('No expenses to download');
      return;
    }
    
    // Convert expense data to CSV
    const csvContent = convertToCSV(expenses);
    
    // Create a data URI for the CSV
    const encodedUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
    
    // Create a temporary link and trigger the download
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination controls component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded px-4 py-2 text-sm font-medium ${
              currentPage === 1 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`relative ml-3 inline-flex items-center rounded px-4 py-2 text-sm font-medium ${
              currentPage === totalPages 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstExpense + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastExpense, expenses.length)}
              </span>{' '}
              of <span className="font-medium">{expenses.length}</span> expenses
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                  currentPage === 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show only current page, first, last, and pages near current page
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        page === currentPage 
                          ? 'bg-black text-white focus:z-20' 
                          : 'text-gray-900 hover:bg-gray-50 focus:z-20'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                
                // Show ellipsis for skipped pages
                if (
                  page === currentPage - 2 || 
                  page === currentPage + 2
                ) {
                  return (
                    <span
                      key={page}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700"
                    >
                      ...
                    </span>
                  );
                }
                
                return null;
              })}
              
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                  currentPage === totalPages 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-black">Your Expenses</h2>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            Showing {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
          </div>
          {expenses.length > 0 && (
            <button
              onClick={downloadCSV}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-black text-xs transition-colors flex items-center"
            >
              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 13L12 16L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 20H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Download CSV
            </button>
          )}
        </div>
      </div>
      
      {expenses.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center rounded">
          <p className="text-gray-500">No expenses yet. Add your first expense above!</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm bg-gray-50 text-gray-600 border-b border-gray-200">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentExpenses.map(expense => (
                  <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{expense.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{expense.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 capitalize">{expense.category}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{currency}{expense.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => onEdit(expense)}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-black text-xs transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => onDelete(expense.id)}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-black text-xs transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination controls */}
          <PaginationControls />
        </>
      )}
    </div>
  );
};

export default ExpenseList;