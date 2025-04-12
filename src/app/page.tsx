"use client";

// src/App.tsx
import React, { useState, useEffect, useCallback } from "react";
import { User } from "firebase/auth";
import { Expense, CategoryTotals, ExpenseFormData } from "./types";
import { DEFAULT_CURRENCY, EXPENSE_CATEGORIES } from "@/app/constants";
import {
    signInWithGoogle,
    signOutUser,
    onAuthStateChange,
    addExpense,
    updateExpense,
    deleteExpense,
    listenToExpenses,
} from "@/app/firebaseService";

// Components
import AuthForm from "./AuthForm";
import Header from "./components/Header";
import StatsPanel from "@/app/components/StatsPanel";
import ExpenseForm from "@/app/components/ExpenseForm";
import ExpenseList from "@/app/components/ExpenseList";
import ExpenseCharts from "@/app/components/ExpenseCharts";

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
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            {user ? (
                <div className="max-w-screen-xl mx-auto">
                    <Header userName={user.displayName} onSignOut={handleSignOut}  />

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                        {/* Stats Panel */}
                        <StatsPanel expenses={expenses} totalExpenses={totalExpenses} categoryTotals={categoryTotals} currency={currency} />

                        {/* Expense Form */}
                        <div className="lg:col-span-3">
                            <ExpenseForm
                                formData={formData}
                                isEditing={!!editingId}
                                onSubmit={handleSubmitExpense}
                                onChange={handleFormChange}
                                onCancel={resetForm}
                            />
                        </div>
                    </div>

                    {/* Expense Charts */}
                    {expenses.length > 0 && <ExpenseCharts expenses={expenses} currency={currency} />}

                    {/* Expenses List */}
                    <div className="mt-6">
                        <ExpenseList expenses={expenses} currency={currency} onEdit={handleEditExpense} onDelete={handleDeleteExpense} />
                    </div>
                </div>
            ) : (
                <AuthForm onGoogleSignIn={handleGoogleSignIn} isLoading={isAuthLoading} />
            )}
        </div>
    );
}

export default App;
