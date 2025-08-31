import { useState, useEffect } from 'react';
import { Cliente } from '@/types';
import { faker } from '@faker-js/faker';

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

const generateMockClients = (): Cliente[] => {
    return [
        {
            id: 'client-1',
            nome: 'Padaria Pão Quente',
            tipo: 'pessoa_juridica',
            email: 'padaria@email.com',
            telefone: '(21) 98877-6655',
            endereco: 'Av. Atlântica, 1702',
            bairro: 'Copacabana',
            cidade: 'Rio de Janeiro',
            uf: 'RJ',
            chavePix: faker.finance.bitcoinAddress(),
            status: 'ativo',
            totalPedidos: 58,
            valorTotal: 1250.70,
            modalidade: 'faturado',
            ativarFaturamentoAutomatico: true,
            frequenciaFaturamento: 'semanal',
            diaDaSemanaFaturamento: 'sexta',
        },
        {
            id: 'client-2',
            nome: 'Restaurante Sabor Divino',
            tipo: 'pessoa_juridica',
            email: 'restaurante@email.com',
            telefone: '(21) 97766-5544',
            endereco: 'R. Conde de Bonfim, 444',
            bairro: 'Tijuca',
            cidade: 'Rio de Janeiro',
            uf: 'RJ',
            chavePix: faker.finance.bitcoinAddress(),
            status: 'ativo',
            totalPedidos: 120,
            valorTotal: 3420.00,
            modalidade: 'pré-pago',
        }
    ];
};

export const useClientsData = () => {
    const [clients, setClients] = useState<Cliente[]>(() => loadFromStorage('app_clients', generateMockClients()));
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
