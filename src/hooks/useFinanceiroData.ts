import { useState, useEffect } from 'react';
import { Despesa, Receita } from '@/types';
import { faker } from '@faker-js/faker';
import { subDays, addDays } from 'date-fns';

// --- LocalStorage Helper ---
function loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
        const item = window.localStorage.getItem(key);
        if (!item) return defaultValue;
        
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed)) {
            return parsed.map(d => ({
                ...d,
                vencimento: d.vencimento ? new Date(d.vencimento) : undefined,
                dataRecebimento: d.dataRecebimento ? new Date(d.dataRecebimento) : undefined,
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

const generateMockDespesas = (): Despesa[] => [
    { id: faker.string.uuid(), descricao: 'Conta de Energia Elétrica', categoria: 'Utilidades', fornecedor: 'Companhia Elétrica', vencimento: new Date(2025, 5, 15), valor: 850.00, status: 'Pendente' },
    { id: faker.string.uuid(), descricao: 'Conta de Água', categoria: 'Utilidades', fornecedor: 'Companhia de Água', vencimento: new Date(2025, 5, 18), valor: 320.00, status: 'Pendente' },
    { id: faker.string.uuid(), descricao: 'Internet e Telefonia', categoria: 'Utilidades', fornecedor: 'Operadora de Telecom', vencimento: new Date(2025, 5, 20), valor: 299.90, status: 'Pendente' },
    { id: faker.string.uuid(), descricao: 'Manutenção da Moto #M001', categoria: 'Manutenção', fornecedor: 'Oficina do João', vencimento: new Date(2025, 5, 5), valor: 450.00, status: 'Atrasado' },
    { id: faker.string.uuid(), descricao: 'Combustível - Maio', categoria: 'Combustível', fornecedor: 'Posto Central', vencimento: new Date(2025, 5, 10), valor: 1250.00, status: 'Pendente' },
    { id: faker.string.uuid(), descricao: 'Salários - Entregadores', categoria: 'Salários', fornecedor: 'Funcionários', vencimento: new Date(2025, 5, 5), valor: 8500.00, status: 'Pago' },
    { id: faker.string.uuid(), descricao: 'Aluguel do Escritório', categoria: 'Administrativo', fornecedor: 'Imobiliária Silva', vencimento: new Date(2025, 5, 10), valor: 3200.00, status: 'Pago' },
    { id: faker.string.uuid(), descricao: 'Material de Escritório', categoria: 'Administrativo', fornecedor: 'Papelaria Central', vencimento: new Date(2025, 5, 4), valor: 350.00, status: 'Pago' },
];

const generateMockReceitas = (): Receita[] => [
    { id: faker.string.uuid(), descricao: 'Taxas de Entrega - Semana 1', categoria: 'Taxa de Entrega', cliente: 'Padaria Pão Quente', dataRecebimento: new Date(2025, 5, 7), valor: 750.00 },
    { id: faker.string.uuid(), descricao: 'Taxas de Entrega - Semana 2', categoria: 'Taxa de Entrega', cliente: 'Restaurante Sabor Divino', dataRecebimento: new Date(2025, 5, 14), valor: 1200.50 },
];

export const useFinanceiroData = () => {
    const [despesas, setDespesas] = useState<Despesa[]>(() => loadFromStorage('app_despesas', generateMockDespesas()));
    const [receitas, setReceitas] = useState<Receita[]>(() => loadFromStorage('app_receitas', generateMockReceitas()));
    const [loading, setLoading] = useState(false);

    useEffect(() => { saveToStorage('app_despesas', despesas) }, [despesas]);
    useEffect(() => { saveToStorage('app_receitas', receitas) }, [receitas]);

    const addDespesa = (data: Omit<Despesa, 'id'>) => {
        const newDespesa: Despesa = { ...data, id: faker.string.uuid() };
        setDespesas(prev => [newDespesa, ...prev].sort((a,b) => a.vencimento.getTime() - b.vencimento.getTime()));
    };

    const updateDespesa = (id: string, data: Partial<Omit<Despesa, 'id'>>) => {
        setDespesas(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    };

    const deleteDespesa = (id: string) => {
        setDespesas(prev => prev.filter(d => d.id !== id));
    };
    
    // Placeholder for Receitas CRUD
    const addReceita = (data: Omit<Receita, 'id'>) => {
        const newReceita: Receita = { ...data, id: faker.string.uuid() };
        setReceitas(prev => [newReceita, ...prev]);
    };

    return { despesas, receitas, loading, addDespesa, updateDespesa, deleteDespesa, addReceita };
};
