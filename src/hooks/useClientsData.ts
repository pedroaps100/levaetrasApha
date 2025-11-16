import { useState, useEffect } from 'react';
import { Cliente } from '@/types';
import { faker } from '@faker-js/faker';
import { initialClients } from '@/lib/mockData';

// --- LocalStorage Helper ---
function loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
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

export const useClientsData = () => {
    const [clients, setClients] = useState<Cliente[]>(() => loadFromStorage('app_clients', initialClients));
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        saveToStorage('app_clients', clients);
    }, [clients]);

    const addClient = (clientData: Omit<Cliente, 'id' | 'totalPedidos' | 'valorTotal'>): Cliente => {
        const newClient: Cliente = {
            ...clientData,
            id: faker.string.uuid(),
            totalPedidos: 0,
            valorTotal: 0,
        };
        setClients(prev => [newClient, ...prev]);
        return newClient;
    };

    const updateClient = (clientId: string, updatedData: Partial<Omit<Cliente, 'id'>>) => {
        setClients(prev => prev.map(client => client.id === clientId ? { ...client, ...updatedData } : client));
    };

    const deleteClient = (clientId: string) => {
        setClients(prev => prev.filter(client => client.id !== clientId));
    };

    return { clients, loading, addClient, updateClient, deleteClient };
};
