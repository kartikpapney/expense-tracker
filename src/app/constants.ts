// constants.ts
export const EXPENSE_CATEGORIES = [
    { value: "necessities", label: "Necessities" }, 
    { value: "basics", label: "Basics" },   
    { value: "comforts", label: "Comforts" }
];

export const DEFAULT_CURRENCY = "₹";

// Firebase collection paths
export const EXPENSES_COLLECTION = (userId: string) => `users/${userId}/expenses`;
