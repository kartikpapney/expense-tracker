// AuthForm.tsx
import React from "react";
import { DEFAULT_CURRENCY } from "@/app/constants";

interface AuthFormProps {
    onGoogleSignIn: () => Promise<void>;
    isLoading: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ onGoogleSignIn, isLoading }) => {
    return (
        <div className="min-h-screen flex items-center justify-center mobile-container">
            <div className="w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-medium text-gray-900 mb-2">Expense Tracker</h1>
                    <p className="text-gray-600 text-lg">Take control of your finances</p>
                </div>

                {/* Auth Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome!</h2>
                        <p className="text-gray-600">Sign in to start tracking your expenses and manage your budget effectively.</p>
                    </div>

                    <button
                        onClick={onGoogleSignIn}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center px-6 py-4 bg-white border border-gray-300 rounded-lg hover:border-gray-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                                <span className="text-gray-700 font-medium">Signing in...</span>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span className="text-gray-700 font-medium text-lg">Continue with Google</span>
                            </div>
                        )}
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Secure authentication powered by Google
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
