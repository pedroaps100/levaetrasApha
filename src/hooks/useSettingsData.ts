import { useState, useEffect } from 'react';
import { Region, Bairro, PaymentMethod, User, Category, Cargo, FormaPagamentoConciliacao } from '@/types';
import { faker } from '@faker-js/faker';
import { ALL_PERMISSIONS } from '@/lib/permissions';

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


// --- Initial Data Generators ---
const generateInitialRegions = (): Region[] => [
    { id: 'zona-sul', name: 'Zona Sul' },
    { id: 'zona-norte', name: 'Zona Norte' },
    { id: 'zona-oeste', name: 'Zona Oeste' },
    { id: 'zona-leste', name: 'Zona Leste' },
    { id: 'centro', name: 'Centro' },
];

const generateInitialBairros = (): Bairro[] => [
  { id: faker.string.uuid(), nome: 'Copacabana', taxa: 7.00, regionId: 'zona-sul' },
  { id: faker.string.uuid(), nome: 'Ipanema', taxa: 8.50, regionId: 'zona-sul' },
  { id: faker.string.uuid(), nome: 'Tijuca', taxa: 6.00, regionId: 'zona-norte' },
  { id: faker.string.uuid(), nome: 'Barra da Tijuca', taxa: 12.00, regionId: 'zona-oeste' },
  { id: faker.string.uuid(), nome: 'Tatuapé', taxa: 9.00, regionId: 'zona-leste' },
  { id: faker.string.uuid(), nome: 'Sé', taxa: 5.00, regionId: 'centro' },
];

const generateInitialPaymentMethods = (): PaymentMethod[] => [
    { id: faker.string.uuid(), name: 'Pix', enabled: true, description: 'Pagamentos instantâneos via Pix.' },
    { id: faker.string.uuid(), name: 'Cartão de Crédito', enabled: false, description: 'Visa, Mastercard, etc. (requer gateway).' },
    { id: faker.string.uuid(), name: 'Dinheiro na Entrega', enabled: true, description: 'Pagamento em espécie ao entregador.' },
];

const generateInitialFormasPagamentoConciliacao = (): FormaPagamentoConciliacao[] => [
    { id: 'pix-levaetras', nome: 'PIX Leva e Trás', acaoFaturamento: 'NENHUMA' },
    { id: 'dinheiro-levaetras', nome: 'Dinheiro Leva e Trás', acaoFaturamento: 'NENHUMA' },
    { id: 'faturar-taxa', nome: 'Faturar Taxa (Pago pela Loja)', acaoFaturamento: 'GERAR_DEBITO_TAXA' },
    { id: 'repassar-valor', nome: 'Repassar Valor (Recebido pela Leva e Trás)', acaoFaturamento: 'GERAR_CREDITO_REPASSE' },
    { id: 'pix-loja', nome: 'PIX Loja (Resolvido)', acaoFaturamento: 'NENHUMA' },
];

const generateInitialCargos = (): Cargo[] => [
    {
        id: 'admin-master',
        name: 'Administrador Master',
        description: 'Acesso total a todas as funcionalidades do sistema.',
        permissions: ALL_PERMISSIONS.map(p => p.id),
    },
    {
        id: 'gerente-logistica',
        name: 'Gerente de Logística',
        description: 'Gerencia solicitações e entregadores, mas não tem acesso ao financeiro.',
        permissions: ['dashboard:view', 'solicitacoes:view', 'solicitacoes:create', 'solicitacoes:edit', 'solicitacoes:manage_status', 'clientes:view', 'entregadores:view', 'entregadores:create', 'entregadores:edit', 'entregas:view'],
    }
];

const generateInitialUsers = (): User[] => [
  { id: 'admin-1', nome: 'Ricardo Martins', email: 'ricardo@empresa.com', role: 'admin', cargoId: 'admin-master', avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Ricardo+Martins` },
  { id: 'admin-2', nome: 'Ana Silva', email: 'ana.silva@empresa.com', role: 'admin', cargoId: 'gerente-logistica', avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Ana+Silva` },
  { id: 'entregador-1', nome: 'Carlos Souza', email: 'carlos.souza@entregas.com', role: 'entregador', avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Carlos+Souza` },
  { id: 'client-1', nome: 'Padaria Pão Quente', email: 'padaria@email.com', role: 'cliente', avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Padaria` },
  { id: 'client-2', nome: 'Restaurante Sabor Divino', email: 'restaurante@email.com', role: 'cliente', avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Restaurante` },
];

const generateInitialCategories = (): { receitas: Category[], despesas: Category[] } => ({
  receitas: [
    { id: faker.string.uuid(), name: 'Taxa de Entrega' },
    { id: faker.string.uuid(), name: 'Venda de Produtos' },
  ],
  despesas: [
    { id: faker.string.uuid(), name: 'Combustível' },
    { id: faker.string.uuid(), name: 'Manutenção' },
    { id: faker.string.uuid(), name: 'Alimentação' },
  ],
});


// --- The Hook ---
export const useSettingsData = () => {
    // State Initialization from LocalStorage or Defaults
    const [regions, setRegions] = useState<Region[]>(() => loadFromStorage('app_regions', generateInitialRegions()));
    const [bairros, setBairros] = useState<Bairro[]>(() => loadFromStorage('app_bairros', generateInitialBairros()));
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => loadFromStorage('app_payment_methods', generateInitialPaymentMethods()));
    const [formasPagamentoConciliacao, setFormasPagamentoConciliacao] = useState<FormaPagamentoConciliacao[]>(() => loadFromStorage('app_formas_pagamento_conciliacao', generateInitialFormasPagamentoConciliacao()));
    const [users, setUsers] = useState<User[]>(() => loadFromStorage('app_users', generateInitialUsers()));
    const [cargos, setCargos] = useState<Cargo[]>(() => loadFromStorage('app_cargos', generateInitialCargos()));
    const [categories, setCategories] = useState<{ receitas: Category[], despesas: Category[] }>(() => loadFromStorage('app_categories', generateInitialCategories()));
    const [loading, setLoading] = useState(false);

    // Effects to save to LocalStorage on change
    useEffect(() => { saveToStorage('app_regions', regions) }, [regions]);
    useEffect(() => { saveToStorage('app_bairros', bairros) }, [bairros]);
    useEffect(() => { saveToStorage('app_payment_methods', paymentMethods) }, [paymentMethods]);
    useEffect(() => { saveToStorage('app_formas_pagamento_conciliacao', formasPagamentoConciliacao) }, [formasPagamentoConciliacao]);
    useEffect(() => { saveToStorage('app_users', users) }, [users]);
    useEffect(() => { saveToStorage('app_cargos', cargos) }, [cargos]);
    useEffect(() => { saveToStorage('app_categories', categories) }, [categories]);

    // --- Modifier Functions ---

    // Users
    const addUser = (data: Omit<User, 'id' | 'avatar'>) => {
        const newUser: User = { id: faker.string.uuid(), ...data, avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.nome}` };
        setUsers(prev => [...prev, newUser]);
    };
    const updateUser = (id: string, data: Partial<Omit<User, 'id' | 'avatar'>>) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data, avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.nome || u.nome}` } : u));
    };
    const deleteUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));

    // Cargos
    const addCargo = (data: Omit<Cargo, 'id'>) => {
        const newCargo: Cargo = { id: faker.string.uuid(), ...data };
        setCargos(prev => [...prev, newCargo]);
    };
    const updateCargo = (id: string, data: Partial<Omit<Cargo, 'id'>>) => {
        setCargos(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    };
    const deleteCargo = (id: string) => {
        const isCargoInUse = users.some(user => user.cargoId === id);
        if (isCargoInUse) {
            throw new Error("Não é possível remover um cargo que está em uso por um ou mais usuários.");
        }
        setCargos(prev => prev.filter(c => c.id !== id));
    };

    // Categories
    const addCategory = (type: 'receitas' | 'despesas', data: { name: string }) => {
        setCategories(prev => ({ ...prev, [type]: [...prev[type], { id: faker.string.uuid(), ...data }] }));
    };
    const updateCategory = (type: 'receitas' | 'despesas', id: string, data: { name: string }) => {
        setCategories(prev => ({ ...prev, [type]: prev[type].map(c => c.id === id ? { ...c, ...data } : c) }));
    };
    const deleteCategory = (type: 'receitas' | 'despesas', id: string) => {
        setCategories(prev => ({ ...prev, [type]: prev[type].filter(c => c.id !== id) }));
    };

    // Regions
    const addRegion = (data: { name: string }) => {
        setRegions(prev => [...prev, { id: faker.string.uuid(), ...data }]);
    };
    const updateRegion = (id: string, data: { name: string }) => {
        setRegions(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    };
    const deleteRegion = (id: string) => {
        setRegions(prev => prev.filter(r => r.id !== id));
        setBairros(prev => prev.filter(b => b.regionId !== id)); // Cascade delete
    };

    // Bairros
    const addBairro = (data: Omit<Bairro, 'id'>) => {
        setBairros(prev => [...prev, { id: faker.string.uuid(), ...data }]);
    };
    const updateBairro = (id: string, data: Omit<Bairro, 'id'>) => {
        setBairros(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
    };
    const deleteBairro = (id: string) => setBairros(prev => prev.filter(b => b.id !== id));

    // Payment Methods
    const addPaymentMethod = (data: Omit<PaymentMethod, 'id' | 'enabled'>) => {
        setPaymentMethods(prev => [...prev, { id: faker.string.uuid(), ...data, enabled: true }]);
    };
    const updatePaymentMethod = (id: string, data: Omit<PaymentMethod, 'id' | 'enabled'>) => {
        setPaymentMethods(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    };
    const togglePaymentMethod = (id: string) => {
        setPaymentMethods(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
    };
    const deletePaymentMethod = (id: string) => setPaymentMethods(prev => prev.filter(m => m.id !== id));

    // Formas de Pagamento (Conciliação)
    const addFormaPagamentoConciliacao = (data: Omit<FormaPagamentoConciliacao, 'id'>) => {
        setFormasPagamentoConciliacao(prev => [...prev, { id: faker.string.uuid(), ...data }]);
    };
    const updateFormaPagamentoConciliacao = (id: string, data: Partial<Omit<FormaPagamentoConciliacao, 'id'>>) => {
        setFormasPagamentoConciliacao(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
    };
    const deleteFormaPagamentoConciliacao = (id: string) => {
        setFormasPagamentoConciliacao(prev => prev.filter(f => f.id !== id));
    };

    return {
        loading,
        users, addUser, updateUser, deleteUser,
        cargos, addCargo, updateCargo, deleteCargo,
        categories, addCategory, updateCategory, deleteCategory,
        regions, addRegion, updateRegion, deleteRegion,
        bairros, addBairro, updateBairro, deleteBairro,
        paymentMethods, addPaymentMethod, updatePaymentMethod, togglePaymentMethod, deletePaymentMethod,
        enabledPaymentMethods: paymentMethods.filter(pm => pm.enabled),
        formasPagamentoConciliacao, addFormaPagamentoConciliacao, updateFormaPagamentoConciliacao, deleteFormaPagamentoConciliacao,
    };
};
