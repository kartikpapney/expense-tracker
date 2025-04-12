"use client"

// Header.tsx
import React from 'react';

interface HeaderProps {
  userName: string | null | undefined;
  onSignOut: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ userName, onSignOut }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-medium text-black">Expense Tracker</h1>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">Hey, {userName?.split(" ")[0]}</span>
        <button 
          onClick={onSignOut}
          className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-black text-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Header;