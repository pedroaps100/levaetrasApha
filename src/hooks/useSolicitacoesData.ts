import { useState, useEffect } from 'react';
import { Solicitacao, Rota, SolicitacaoStatus, Entregador, Cliente, ConciliacaoData, FormaPagamentoConciliacao } from '@/types';
import { faker } from '@faker-js/faker';
import { useFaturasData } from './useFaturasData';
import { useTransaction } from '@/contexts/TransactionContext';

// --- LocalStorage Helper ---
function loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
        const item = window.localStorage.getItem(key);
        if (!item) return defaultValue;
        
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed)) {
            return parsed.map(s => ({
                ...s,
                dataSolicitacao: new Date(s.dataSolicitacao),
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

const generateMockSolicitacoes = (count: number): Solicitacao[] => {
    return Array.from({ length: count }, (_, i) => {
        const rotas: Rota[] = Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => ({
            id: faker.string.uuid(),
            bairroDestinoId: faker.string.uuid(),
            responsavel: faker.person.fullName(),
            telefone: faker.phone.number(),
            observacoes: faker.lorem.sentence(),
            receberDoCliente: faker.datatype.boolean(0.3),
            valorExtra: faker.helpers.maybe(() => faker.number.float({ min: 20, max: 150 }), { probability: 0.3 }),
            taxaEntrega: faker.number.float({ min: 7, max: 25, multipleOf: 0.5 }),
            status: 'pendente',
        }));

        const clienteNome = faker.company.name();
        const status = faker.helpers.arrayElement<SolicitacaoStatus>(['pendente', 'aceita', 'em_andamento', 'concluida', 'cancelada', 'rejeitada']);
        const entregadorNome = status !== 'pendente' ? faker.person.fullName() : undefined;
        const justificativa = ['cancelada', 'rejeitada'].includes(status) ? faker.lorem.sentence() : undefined;

        return {
            id: faker.string.uuid(),
            codigo: `SOL-${1001 + i}`,
            clienteId: faker.string.uuid(),
            clienteNome,
            clienteAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${clienteNome.replace(/\s/g, '+')}`,
            entregadorId: entregadorNome ? faker.string.uuid() : undefined,
            entregadorNome,
            entregadorAvatar: entregadorNome ? `https://api.dicebear.com/7.x/initials/svg?seed=${entregadorNome.replace(/\s/g, '+')}` : undefined,
            status,
            dataSolicitacao: faker.date.recent({ days: 10 }),
            tipoOperacao: 'coleta',
            operationDescription: 'Coletar na loja X Entregar ao Cliente',
            pontoColeta: faker.location.streetAddress(false),
            rotas,
            valorTotalTaxas: rotas.reduce((sum, r) => sum + r.taxaEntrega, 0),
            valorTotalRepasse: rotas.reduce((sum, r) => sum + (r.valorExtra || 0), 0),
            justificativa,
        };
    });
};

export const useSolicitacoesData = () => {
    const { addEntregaToFatura } = useFaturasData();
    const { addTransaction } = useTransaction();
    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(() => {
        let data = loadFromStorage<Solicitacao[]>('app_solicitacoes', []);
        
        if (data.length === 0) {
            data = generateMockSolicitacoes(25).sort((a, b) => b.dataSolicitacao.getTime() - a.dataSolicitacao.getTime());
        }
        
        // Data migration/validation to ensure every rota has a unique ID
        return data.map(s => ({
            ...s,
            rotas: Array.isArray(s.rotas) ? s.rotas.map(r => ({
                ...r,
                id: r.id || faker.string.uuid()
            })) : []
        }));
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        saveToStorage('app_solicitacoes', solicitacoes);
    }, [solicitacoes]);


    const addSolicitacao = (data: Omit<Solicitacao, 'id' | 'codigo' | 'dataSolicitacao' | 'status'>, byAdmin: boolean = true): Solicitacao => {
        const newSolicitacao: Solicitacao = {
            ...data,
            id: faker.string.uuid(),
            codigo: `SOL-${1000 + solicitacoes.length + 1}`,
            dataSolicitacao: new Date(),
            status: byAdmin ? 'aceita' : 'pendente',
            rotas: data.rotas.map(r => ({ ...r, id: r.id || faker.string.uuid() })),
        };
        setSolicitacoes(prev => [newSolicitacao, ...prev]);
        return newSolicitacao;
    };
    
    const updateSolicitacao = (id: string, data: Partial<Omit<Solicitacao, 'id' | 'codigo' | 'dataSolicitacao'>>) => {
        setSolicitacoes(prev => prev.map(s => {
            if (s.id === id) {
                const updatedData = { ...s, ...data };
                if (updatedData.rotas) {
                    updatedData.rotas = updatedData.rotas.map(r => ({
                        ...r,
                        id: r.id || faker.string.uuid()
                    }));
                }
                return updatedData;
            }
            return s;
        }));
    };

    const deleteSolicitacao = (id: string) => {
        setSolicitacoes(prev => prev.filter(s => s.id !== id));
    };

    const updateConciliacao = (id: string, conciliacao: ConciliacaoData) => {
        setSolicitacoes(prev => prev.map(s => 
            s.id === id ? { ...s, conciliacao } : s
        ));
    };

    const updateStatusSolicitacao = (id: string, newStatus: SolicitacaoStatus, details?: { justificativa?: string; entregador?: Entregador; cliente?: Cliente; conciliacao?: ConciliacaoData; formasPagamento?: FormaPagamentoConciliacao[] }) => {
        setSolicitacoes(prev => prev.map(s => {
            if (s.id === id) {
                const updatedSolicitacao: Solicitacao = { ...s, status: newStatus };
                if (details?.justificativa) updatedSolicitacao.justificativa = details.justificativa;
                if (details?.entregador) {
                    updatedSolicitacao.entregadorId = details.entregador.id;
                    updatedSolicitacao.entregadorNome = details.entregador.nome;
                    updatedSolicitacao.entregadorAvatar = details.entregador.avatar;
                }
                if (details?.conciliacao) updatedSolicitacao.conciliacao = details.conciliacao;

                // Financial Flow Logic
                if (newStatus === 'concluida' && details?.cliente) {
                    if (details.cliente.modalidade === 'pré-pago') {
                        addTransaction({
                            type: 'debit',
                            origin: 'delivery_fee',
                            description: `Taxa da entrega ${s.codigo}`,
                            value: s.valorTotalTaxas,
                            clientName: s.clienteNome,
                            clientAvatar: s.clienteAvatar,
                        });
                    } else if (details.cliente.modalidade === 'faturado' && details.conciliacao && details.formasPagamento) {
                        addEntregaToFatura(updatedSolicitacao, details.conciliacao, details.formasPagamento);
                    }
                }

                return updatedSolicitacao;
            }
            return s;
        }));
    };

    return { solicitacoes, loading, addSolicitacao, updateSolicitacao, deleteSolicitacao, updateStatusSolicitacao, updateConciliacao };
};
