import { useState, useEffect } from 'react';
import { Entregador } from '@/types';
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

const generateMockEntregadores = (): Entregador[] => {
    return [
        {
            id: 'entregador-1',
            nome: 'Ana Silva',
            documento: '11122233344',
            email: 'ana.silva@entregas.com',
            telefone: '(11) 98765-4321',
            cidade: 'São Paulo',
            bairro: 'Pinheiros',
            veiculo: 'Moto - Honda CG 160',
            status: 'ativo',
            tipoComissao: 'percentual',
            valorComissao: 10,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Ana+Silva`,
        },
        {
            id: 'entregador-2',
            nome: 'Carlos Souza',
            documento: '55566677788',
            email: 'carlos.souza@entregas.com',
            telefone: '(11) 91234-5678',
            cidade: 'São Paulo',
            bairro: 'Vila Madalena',
            veiculo: 'Carro - Fiat Fiorino',
            status: 'ativo',
            tipoComissao: 'fixo',
            valorComissao: 7.5,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Carlos+Souza`,
        },
    ];
};

export const useEntregadoresData = () => {
    const [entregadores, setEntregadores] = useState<Entregador[]>(() => loadFromStorage('app_entregadores', generateMockEntregadores()));
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        saveToStorage('app_entregadores', entregadores);
    }, [entregadores]);

    const addEntregador = (data: Omit<Entregador, 'id' | 'avatar'>) => {
        const newEntregador: Entregador = {
            ...data,
            id: faker.string.uuid(),
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.nome.replace(/\s/g, '+')}`,
        };
        setEntregadores(prev => [newEntregador, ...prev]);
    };

    const updateEntregador = (id: string, data: Partial<Omit<Entregador, 'id' | 'avatar'>>) => {
        setEntregadores(prev => prev.map(e => e.id === id ? { ...e, ...data, avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.nome || e.nome}` } : e));
    };

    const deleteEntregador = (id: string) => {
        setEntregadores(prev => prev.filter(e => e.id !== id));
    };

    return { entregadores, loading, addEntregador, updateEntregador, deleteEntregador };
};
