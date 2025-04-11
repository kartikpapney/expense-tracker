// types.ts
export interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    createdAt: Date;
}

export type CategoryTotals = {
    [key: string]: number;
};

export interface ExpenseFormData {
    description: string;
    amount: number | string;
    category: string;
    date: string;
}
