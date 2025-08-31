import { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { faker } from '@faker-js/faker';

// --- LocalStorage Helper ---
function loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
        const item = window.localStorage.getItem(key);
        if (!item) return defaultValue;
        
        // Handle date deserialization
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed)) {
            return parsed.map(t => ({
                ...t,
                date: new Date(t.date),
            })) as T;
        }
        return parsed;

    } catch (error) {
        console.error(`Error loading ${key} from localStorage`, error);
        return defaultValue;
    }
}

function saveToStorage<T>(key: string, value: T) {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage`, error);
    }
}

const generateMockTransactions = (): Transaction[] => {
    const transactions: Transaction[] = [];

    // Recharges
    for (let i = 0; i < 4; i++) {
        const method = faker.helpers.arrayElement(['Pix', 'Cartão'] as const);
        transactions.push({
            id: faker.string.uuid(),
            date: faker.date.recent({ days: 30 }),
            type: 'credit',
            origin: method === 'Pix' ? 'recharge_pix' : 'recharge_card',
            description: `Recarga via ${method}`,
            value: faker.number.float({ min: 50, max: 200, multipleOf: 10 }),
        });
    }

    // Deliveries
    for (let i = 0; i < 10; i++) {
        transactions.push({
            id: faker.string.uuid(),
            date: faker.date.recent({ days: 30 }),
            type: 'debit',
            origin: 'delivery_fee',
            description: `Entrega #${faker.string.numeric(4)}`,
            value: faker.number.float({ min: 10, max: 45, multipleOf: 0.5 }),
        });
    }

    // Cancellations
    transactions.push({
        id: faker.string.uuid(),
        date: faker.date.recent({ days: 30 }),
        type: 'debit',
        origin: 'cancellation_fee',
        description: `Taxa de Cancelamento`,
        value: 5.00,
    });

    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
};


export const useTransactionsData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadFromStorage('app_transactions', generateMockTransactions()));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    saveToStorage('app_transactions', transactions);
  }, [transactions]);


  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
        ...transactionData,
        id: faker.string.uuid(),
        date: new Date(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  return { transactions, loading, addTransaction };
};
