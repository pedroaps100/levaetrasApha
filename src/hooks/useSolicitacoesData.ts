import { useState, useEffect } from 'react';
import { Solicitacao, Rota, SolicitacaoStatus, Entregador, Cliente, ConciliacaoData, FormaPagamentoConciliacao, TaxaExtra, SolicitacaoHistoricoItem, SolicitacaoAcao } from '@/types';
import { faker } from '@faker-js/faker';
import { useFaturasData } from './useFaturasData';
import { useTransaction } from '@/contexts/TransactionContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
                historico: Array.isArray(s.historico) ? s.historico.map((h: any) => ({...h, data: new Date(h.data)})) : []
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

        const historico: SolicitacaoHistoricoItem[] = [
            { id: faker.string.uuid(), data: faker.date.recent({days: 2}), acao: 'criada', usuarioId: 'user-1', usuarioNome: 'Admin' }
        ];
        if (status !== 'pendente') {
            historico.push({ id: faker.string.uuid(), data: faker.date.recent({days: 1}), acao: 'aceita', usuarioId: 'user-1', usuarioNome: 'Admin' });
        }

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
            historico,
        };
    });
};

export const useSolicitacoesData = () => {
    const { addEntregaToFatura } = useFaturasData();
    const { addTransaction } = useTransaction();
    const { user } = useAuth();
    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(() => {
        let data = loadFromStorage<Solicitacao[]>('app_solicitacoes', []);
        
        if (data.length === 0) {
            data = generateMockSolicitacoes(25).sort((a, b) => b.dataSolicitacao.getTime() - a.dataSolicitacao.getTime());
        }
        
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
        const historicoInicial: SolicitacaoHistoricoItem = {
            id: faker.string.uuid(),
            data: new Date(),
            acao: 'criada',
            usuarioId: user!.id,
            usuarioNome: user!.nome,
        };
        
        const newSolicitacao: Solicitacao = {
            ...data,
            id: faker.string.uuid(),
            codigo: `SOL-${1000 + solicitacoes.length + 1}`,
            dataSolicitacao: new Date(),
            status: byAdmin ? 'aceita' : 'pendente',
            rotas: data.rotas.map(r => ({ ...r, id: r.id || faker.string.uuid() })),
            historico: [historicoInicial],
        };
        setSolicitacoes(prev => [newSolicitacao, ...prev]);
        return newSolicitacao;
    };
    
    const updateSolicitacao = (id: string, data: Partial<Omit<Solicitacao, 'id' | 'codigo' | 'dataSolicitacao'>>) => {
        setSolicitacoes(prev => prev.map(s => {
            if (s.id === id) {
                const updatedData: Solicitacao = { ...s, ...data };
                if (updatedData.rotas) {
                    updatedData.rotas = updatedData.rotas.map(r => ({
                        ...r,
                        id: r.id || faker.string.uuid()
                    }));
                }
                const historicoEdicao: SolicitacaoHistoricoItem = {
                    id: faker.string.uuid(),
                    data: new Date(),
                    acao: 'editada',
                    usuarioId: user!.id,
                    usuarioNome: user!.nome,
                };
                updatedData.historico = [...(updatedData.historico || []), historicoEdicao];
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

    const updateStatusSolicitacao = (id: string, newStatus: SolicitacaoStatus, details?: { justificativa?: string; entregador?: Entregador; cliente?: Cliente; conciliacao?: ConciliacaoData; formasPagamento?: FormaPagamentoConciliacao[]; taxasExtras?: TaxaExtra[] }) => {
        const solicitacaoToUpdate = solicitacoes.find(s => s.id === id);
        if (!solicitacaoToUpdate) return;

        if (newStatus === 'concluida') {
            if (!details?.cliente) {
                console.error("ERRO CRÍTICO: Tentativa de concluir solicitação sem dados do cliente. Faturamento não será gerado.");
                toast.error("Erro ao gerar fatura: Dados do cliente ausentes.");
            } else {
                if (details.cliente.modalidade === 'pré-pago') {
                    addTransaction({
                        type: 'debit',
                        origin: 'delivery_fee',
                        description: `Taxa da entrega ${solicitacaoToUpdate.codigo}`,
                        value: solicitacaoToUpdate.valorTotalTaxas,
                        clientName: solicitacaoToUpdate.clienteNome,
                        clientAvatar: solicitacaoToUpdate.clienteAvatar,
                    });
                } else if (details.cliente.modalidade === 'faturado') {
                    // Relaxed condition: removed strict check for taxasExtras to ensure fatura is created even if extras are missing
                    const updatedForFatura = { 
                        ...solicitacaoToUpdate, 
                        status: newStatus,
                        ...(details.conciliacao && { conciliacao: details.conciliacao })
                    };
                    
                    // Call context function with safe defaults
                    addEntregaToFatura(
                        updatedForFatura, 
                        details.taxasExtras || [], 
                        details.conciliacao, 
                        details.formasPagamento || [], 
                        details.cliente
                    );
                }
            }
        }

        setSolicitacoes(prev => prev.map(s => {
            if (s.id === id) {
                const updatedSolicitacao: Solicitacao = { ...s, status: newStatus };
                
                const newHistoryItem: Partial<SolicitacaoHistoricoItem> = {
                    id: faker.string.uuid(),
                    data: new Date(),
                    usuarioId: user!.id,
                    usuarioNome: user!.nome,
                };

                let acao: SolicitacaoAcao | null = null;
                switch (newStatus) {
                    case 'aceita': acao = 'aceita'; break;
                    case 'em_andamento': acao = 'iniciada'; break;
                    case 'concluida': acao = 'conciliada'; break;
                    case 'rejeitada': acao = 'rejeitada'; break;
                    case 'cancelada': acao = 'cancelada'; break;
                }

                if (acao) {
                    newHistoryItem.acao = acao;
                    if (details?.justificativa) {
                        newHistoryItem.detalhes = details.justificativa;
                    }
                    updatedSolicitacao.historico = [...(s.historico || []), newHistoryItem as SolicitacaoHistoricoItem];
                }

                if (details?.justificativa) updatedSolicitacao.justificativa = details.justificativa;
                if (details?.entregador) {
                    updatedSolicitacao.entregadorId = details.entregador.id;
                    updatedSolicitacao.entregadorNome = details.entregador.nome;
                    updatedSolicitacao.entregadorAvatar = details.entregador.avatar;
                }
                if (details?.conciliacao) updatedSolicitacao.conciliacao = details.conciliacao;

                return updatedSolicitacao;
            }
            return s;
        }));
    };

    return { solicitacoes, loading, addSolicitacao, updateSolicitacao, deleteSolicitacao, updateStatusSolicitacao, updateConciliacao };
};
