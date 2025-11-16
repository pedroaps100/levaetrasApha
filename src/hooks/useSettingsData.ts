import { useState, useEffect } from 'react';
import { Region, Bairro, PaymentMethod, User, Category, Cargo, FormaPagamentoConciliacao, TaxaExtra } from '@/types';
import { faker } from '@faker-js/faker';
import { initialUsers, initialCargos, generateInitialRegions, generateInitialBairros, generateInitialPaymentMethods, generateInitialFormasPagamentoConciliacao, generateInitialTaxasExtras, generateInitialCategories } from '@/lib/mockData';

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

// --- Data Versioning and Reset Logic ---
const DATA_VERSION_KEY = 'app_data_version';
const CURRENT_DATA_VERSION = '2.1'; // Increment this version to force a data reset for all users

const checkAndResetData = () => {
    const storedVersion = localStorage.getItem(DATA_VERSION_KEY);

    if (storedVersion !== CURRENT_DATA_VERSION) {
        console.warn(`Data version mismatch. Stored: ${storedVersion}, Current: ${CURRENT_DATA_VERSION}. Resetting all application data.`);
        
        const keysToReset = [
            'app_users', 'app_clients', 'app_entregadores', 'app_cargos', 
            'app_regions', 'app_bairros', 'app_payment_methods', 
            'app_formas_pagamento_conciliacao', 'app_taxas_extras', 'app_categories',
            'app_solicitacoes', 'app_faturas', 'app_despesas', 'app_receitas', 'app_transactions',
            'app_auth_user' // Also clear the logged-in user
        ];
        
        keysToReset.forEach(key => localStorage.removeItem(key));
        
        localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
        return true; // Indicates that data was reset
    }
    return false; // No reset needed
};

// Execute the check once when the module is loaded
checkAndResetData();


// --- The Hook ---
export const useSettingsData = () => {
    // State Initialization from LocalStorage or Defaults
    const [regions, setRegions] = useState<Region[]>(() => loadFromStorage('app_regions', generateInitialRegions()));
    const [bairros, setBairros] = useState<Bairro[]>(() => loadFromStorage('app_bairros', generateInitialBairros()));
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => loadFromStorage('app_payment_methods', generateInitialPaymentMethods()));
    const [formasPagamentoConciliacao, setFormasPagamentoConciliacao] = useState<FormaPagamentoConciliacao[]>(() => loadFromStorage('app_formas_pagamento_conciliacao', generateInitialFormasPagamentoConciliacao()));
    const [taxasExtras, setTaxasExtras] = useState<TaxaExtra[]>(() => loadFromStorage('app_taxas_extras', generateInitialTaxasExtras()));
    const [users, setUsers] = useState<User[]>(() => loadFromStorage('app_users', initialUsers));
    const [cargos, setCargos] = useState<Cargo[]>(() => loadFromStorage('app_cargos', initialCargos));
    const [categories, setCategories] = useState<{ receitas: Category[], despesas: Category[] }>(() => loadFromStorage('app_categories', generateInitialCategories()));
    const [loading, setLoading] = useState(false);

    // Effects to save to LocalStorage on change
    useEffect(() => { saveToStorage('app_regions', regions) }, [regions]);
    useEffect(() => { saveToStorage('app_bairros', bairros) }, [bairros]);
    useEffect(() => { saveToStorage('app_payment_methods', paymentMethods) }, [paymentMethods]);
    useEffect(() => { saveToStorage('app_formas_pagamento_conciliacao', formasPagamentoConciliacao) }, [formasPagamentoConciliacao]);
    useEffect(() => { saveToStorage('app_taxas_extras', taxasExtras) }, [taxasExtras]);
    useEffect(() => { saveToStorage('app_users', users) }, [users]);
    useEffect(() => { saveToStorage('app_cargos', cargos) }, [cargos]);
    useEffect(() => { saveToStorage('app_categories', categories) }, [categories]);

    // --- Modifier Functions ---

    // Users
    const addUser = (data: Omit<User, 'id' | 'avatar'>) => {
        const newUser: User = { 
            id: faker.string.uuid(), 
            ...data, 
            password: data.password || 'password123', // Add default password
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.nome}` 
        };
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

    // Taxas Extras
    const addTaxaExtra = (data: Omit<TaxaExtra, 'id'>) => {
        setTaxasExtras(prev => [...prev, { id: faker.string.uuid(), ...data }]);
    };
    const updateTaxaExtra = (id: string, data: Partial<Omit<TaxaExtra, 'id'>>) => {
        setTaxasExtras(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    };
    const deleteTaxaExtra = (id: string) => {
        setTaxasExtras(prev => prev.filter(t => t.id !== id));
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
        taxasExtras, addTaxaExtra, updateTaxaExtra, deleteTaxaExtra,
    };
};
