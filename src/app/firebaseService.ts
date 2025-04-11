// firebaseService.ts
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, doc, 
  deleteDoc, updateDoc, onSnapshot, Unsubscribe
} from 'firebase/firestore';
import { 
  getAuth, signOut, onAuthStateChanged, User,
  GoogleAuthProvider, signInWithPopup 
} from 'firebase/auth';
import { Expense } from './types';
import { EXPENSES_COLLECTION } from '@/app/constants';

// Firebase configuration - loaded from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Auth functions
export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const signOutUser = async (): Promise<void> => {
  return signOut(auth);
};

export const onAuthStateChange = (callback: (user: User | null) => void): Unsubscribe => {
  return onAuthStateChanged(auth, callback);
};

// Firestore functions
export const addExpense = async (userId: string, expenseData: Omit<Expense, 'id'>): Promise<void> => {
  await addDoc(collection(db, EXPENSES_COLLECTION(userId)), expenseData);
};

export const updateExpense = async (userId: string, expenseId: string, expenseData: Partial<Expense>): Promise<void> => {
  const expenseRef = doc(db, EXPENSES_COLLECTION(userId), expenseId);
  await updateDoc(expenseRef, expenseData);
};

export const deleteExpense = async (userId: string, expenseId: string): Promise<void> => {
  await deleteDoc(doc(db, EXPENSES_COLLECTION(userId), expenseId));
};

export const listenToExpenses = (
  userId: string, 
  callback: (expenses: Expense[]) => void
): Unsubscribe => {
  const expensesRef = collection(db, EXPENSES_COLLECTION(userId));
  
  return onSnapshot(expensesRef, (snapshot) => {
    const expensesData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    } as Expense));
    
    callback(expensesData);
  });
};