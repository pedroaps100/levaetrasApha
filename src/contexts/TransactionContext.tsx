import React, { createContext, useContext, ReactNode } from 'react';
import { Transaction } from '@/types';
import { useTransactionsData } from '@/hooks/useTransactionsData';

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (transactionData: Omit<Transaction, 'id' | 'date'>) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const { transactions, loading, addTransaction } = useTransactionsData();

  const value = {
    transactions,
    loading,
    addTransaction,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};
