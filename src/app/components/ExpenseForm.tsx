"use client"

// ExpenseForm.tsx
import React from 'react';
import { EXPENSE_CATEGORIES } from '../constants';
import { ExpenseFormData } from '../types';

interface ExpenseFormProps {
  formData: ExpenseFormData;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof ExpenseFormData, value: string) => void;
  onCancel: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  formData,
  isEditing,
  onSubmit,
  onChange,
  onCancel
}) => {
  const { description, amount, category, date } = formData;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-medium text-gray-800 mb-4">
        {isEditing ? 'Edit Expense' : 'Add Expense'}
      </h2>
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => onChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => onChange('amount', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => onChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
            >
              {EXPENSE_CATEGORIES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => onChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>
        </div>
        
        <div className="form-actions flex space-x-3 mt-4">
          <button 
            type="submit"
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            {isEditing ? 'Update' : 'Add'}
          </button>
          {isEditing && (
            <button 
              type="button" 
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;