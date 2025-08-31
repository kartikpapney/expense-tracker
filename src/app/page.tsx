"use client";

// src/App.tsx
import React, { useState, useEffect, useCallback } from "react";
import { User } from "firebase/auth";
import { Expense, CategoryTotals, ExpenseFormData } from "./types";
import { DEFAULT_CURRENCY, EXPENSE_CATEGORIES } from "./constants";
import {
    signInWithGoogle,
    signOutUser,
    onAuthStateChange,
    addExpense,
    updateExpense,
    deleteExpense,
    listenToExpenses,
} from "./firebaseService";

// Components
import AuthForm from "./AuthForm";
import Header from "./components/Header";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import ExpenseCharts from "./components/ExpenseCharts";

// Simple StatsPanel component defined inline
const StatsPanel: React.FC<{
  expenses: Expense[];
  totalExpenses: number;
  categoryTotals: CategoryTotals;
  currency: string;
}> = ({ expenses, currency }) => {
  const currentMonthExpenses = React.useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const yearMonthStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    
    return expenses.reduce((sum, expense) => {
      if (expense.date.startsWith(yearMonthStr)) {
        return sum + expense.amount;
      }
      return sum;
    }, 0);
  }, [expenses]);
  
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{currentMonthName} Expenses</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{currency}{currentMonthExpenses.toFixed(2)}</p>
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2h-2a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
    // Auth state
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    // Expense state
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [formData, setFormData] = useState<ExpenseFormData>({
        description: "",
        amount: "",
        category: EXPENSE_CATEGORIES[0].value,
        date: new Date().toISOString().substr(0, 10),
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    // Statistics
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [categoryTotals, setCategoryTotals] = useState<CategoryTotals>({});
    const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

    // Auth listener
    useEffect(() => {
        const unsubscribe = onAuthStateChange((currentUser) => {
            setUser(currentUser);
        });

        return unsubscribe;
    }, []);

    // Listen for expenses when user is logged in
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        if (user) {
            unsubscribe = listenToExpenses(user.uid, (expensesData) => {
                setExpenses(expensesData);
            });
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [user]);

    // Calculate statistics when expenses change
    useEffect(() => {
        calculateStats();
    }, [expenses]);

    // Calculate expense statistics
    const calculateStats = useCallback(() => {
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        setTotalExpenses(total);

        const catTotals = expenses.reduce((totals, expense) => {
            const cat = expense.category;
            totals[cat] = (totals[cat] || 0) + expense.amount;
            return totals;
        }, {} as CategoryTotals);

        setCategoryTotals(catTotals);
    }, [expenses]);

    // Handle Google Sign-In
    const handleGoogleSignIn = async () => {
        try {
            setIsAuthLoading(true);
            await signInWithGoogle();
        } catch (error: any) {
            alert(`Authentication error: ${error.message}`);
        } finally {
            setIsAuthLoading(false);
        }
    };

    // Sign out
    const handleSignOut = async () => {
        try {
            await signOutUser();
            // Reset states after signing out
            setExpenses([]);
            setTotalExpenses(0);
            setCategoryTotals({});
        } catch (error: any) {
            alert(`Sign out error: ${error.message}`);
        }
    };

    // Handle form field changes
    const handleFormChange = (field: keyof ExpenseFormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Add or update expense
    const handleSubmitExpense = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.description || !formData.amount) {
            alert("Please provide both description and amount");
            return;
        }

        if (!user) return;

        const expenseData = {
            description: formData.description,
            amount: parseFloat(formData.amount.toString()),
            category: formData.category,
            date: formData.date,
            createdAt: new Date(),
        };

        try {
            if (editingId) {
                // Update existing expense
                await updateExpense(user.uid, editingId, expenseData);
                setEditingId(null);
            } else {
                // Add new expense
                await addExpense(user.uid, expenseData);
            }

            // Reset form
            resetForm();
        } catch (error: any) {
            alert(`Error saving expense: ${error.message}`);
        }
    };

    // Delete expense
    const handleDeleteExpense = async (id: string) => {
        if (!user) return;

        if (window.confirm("Are you sure you want to delete this expense?")) {
            try {
                await deleteExpense(user.uid, id);
            } catch (error: any) {
                alert(`Error deleting expense: ${error.message}`);
            }
        }
    };

    // Edit expense
    const handleEditExpense = (expense: Expense) => {
        setFormData({
            description: expense.description,
            amount: expense.amount.toString(),
            category: expense.category,
            date: expense.date,
        });
        setEditingId(expense.id);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            description: "",
            amount: "",
            category: EXPENSE_CATEGORIES[0].value,
            date: new Date().toISOString().substr(0, 10),
        });
        setEditingId(null);
    };

    // Render app content based on auth state
    return (
        <div className="min-h-screen bg-gray-50">
            {user ? (
                <div className="mobile-container max-w-7xl mx-auto">
                    <Header userName={user.displayName} onSignOut={handleSignOut} />

                    {/* Mobile-first layout */}
                    <div className="space-y-6">
                        {/* Stats Panel - Full width on mobile */}
                        <StatsPanel 
                            expenses={expenses} 
                            totalExpenses={totalExpenses} 
                            categoryTotals={categoryTotals} 
                            currency={currency} 
                        />

                        {/* Expense Form */}
                        <ExpenseForm
                            formData={formData}
                            isEditing={!!editingId}
                            onSubmit={handleSubmitExpense}
                            onChange={handleFormChange}
                            onCancel={resetForm}
                        />

                        {/* Expense Charts */}
                        {expenses.length > 0 && (
                            <ExpenseCharts expenses={expenses} currency={currency} />
                        )}

                        {/* Expenses List */}
                        <ExpenseList 
                            expenses={expenses} 
                            currency={currency} 
                            onEdit={handleEditExpense} 
                            onDelete={handleDeleteExpense} 
                        />
                    </div>
                </div>
            ) : (
                <AuthForm onGoogleSignIn={handleGoogleSignIn} isLoading={isAuthLoading} />
            )}
        </div>
    );
}

export default App;
