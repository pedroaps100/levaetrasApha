import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Fatura, EntregaIncluida, Solicitacao, TaxaExtra, ConciliacaoData, FormaPagamentoConciliacao, Cliente, FaturaStatusPagamento, FaturaStatusRepasse, FaturaStatusGeral, HistoricoItem } from '@/types';
import { faker } from '@faker-js/faker';
import { addDays, format, setDate, isBefore, nextDay, addMonths, startOfDay, addHours, subDays } from 'date-fns';
import { toast } from 'sonner';

// --- Helper Functions ---
function loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
        const item = window.localStorage.getItem(key);
        if (!item) return defaultValue;
        
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed)) {
            return parsed.map(f => ({
                ...f,
                dataEmissao: new Date(f.dataEmissao),
                dataVencimento: new Date(f.dataVencimento),
                entregas: Array.isArray(f.entregas) ? f.entregas.map((e: any) => ({ ...e, data: new Date(e.data) })) : [],
                historico: Array.isArray(f.historico) ? f.historico.map((h: any) => ({...h, data: new Date(h.data)})) : []
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

const recalculateFaturaTotals = (fatura: Fatura): Fatura => {
    const valorTaxas = fatura.entregas.reduce((sum, e) => {
        if (e.taxaFaturada !== undefined) {
            return sum + e.taxaFaturada;
        }
        const taxasExtrasValor = e.taxasExtras.reduce((subSum, te) => subSum + te.valor, 0);
        return sum + e.taxaEntrega + taxasExtrasValor;
    }, 0);

    const valorRepasse = fatura.entregas.reduce((sum, e) => {
        if (e.repasseFaturado !== undefined) {
            return sum + e.repasseFaturado;
        }
        return sum + e.valorRepasse;
    }, 0);
    
    return { ...fatura, valorTaxas, valorRepasse, totalEntregas: fatura.entregas.length };
};

const calculateDueDate = (cliente?: Cliente): Date => {
    const today = startOfDay(new Date());
    
    if (!cliente || !cliente.ativarFaturamentoAutomatico) {
        return addDays(today, 15);
    }

    switch (cliente.frequenciaFaturamento) {
        case 'diario':
            return addDays(today, 1);
        case 'semanal':
            const dayMap: Record<string, number> = { 'domingo': 0, 'segunda': 1, 'terca': 2, 'quarta': 3, 'quinta': 4, 'sexta': 5, 'sabado': 6 };
            const targetDay = cliente.diaDaSemanaFaturamento ? dayMap[cliente.diaDaSemanaFaturamento] : 5;
            let nextDate = nextDay(today, targetDay as any);
            return nextDate;
        case 'mensal':
            const targetDate = cliente.diaDoMesFaturamento || 28;
            let nextMonthDate = setDate(today, targetDate);
            if (isBefore(nextMonthDate, today)) {
                nextMonthDate = addMonths(nextMonthDate, 1);
            }
            return nextMonthDate;
        case 'por_entrega':
            return addDays(today, 7);
        default:
            return addDays(today, 15);
    }
};

const generateMockFaturas = (count: number): Fatura[] => {
    return Array.from({ length: count }, (_, i) => {
        const dataEmissao = subDays(new Date(), i * 5);
        return {
            id: faker.string.uuid(),
            numero: `FAT-2025-000${i + 1}`,
            clienteId: `client-${i+1}`,
            clienteNome: faker.company.name(),
            tipoFaturamento: 'Mensal',
            totalEntregas: 0,
            dataEmissao,
            dataVencimento: addDays(dataEmissao, 15),
            valorTaxas: 0,
            statusTaxas: 'Pendente',
            valorRepasse: 0,
            statusRepasse: 'Pendente',
            statusGeral: 'Aberta',
            observacoes: '',
            entregas: [],
            historico: [{ id: faker.string.uuid(), acao: 'criada', data: dataEmissao }],
        };
    });
};

// --- Context Definition ---
interface FaturasContextType {
    faturas: Fatura[];
    loading: boolean;
    addEntregaToFatura: (
        solicitacao: Solicitacao, 
        taxasExtras: TaxaExtra[], 
        conciliacao?: ConciliacaoData, 
        regrasPagamento?: FormaPagamentoConciliacao[],
        cliente?: Cliente
    ) => void;
    addManualEntregaToFatura: (faturaId: string, entregaData: Omit<EntregaIncluida, 'id'>) => void;
    updateManualEntregaInFatura: (faturaId: string, entregaId: string, entregaData: Partial<Omit<EntregaIncluida, 'id'>>) => void;
    deleteManualEntregaFromFatura: (faturaId: string, entregaId: string) => void;
    deleteFatura: (id: string) => void;
    registrarPagamentoTaxa: (faturaId: string, detalhes: string) => void;
    registrarPagamentoRepasse: (faturaId: string, detalhes: string) => void;
}

const FaturasContext = createContext<FaturasContextType | undefined>(undefined);

export const useFaturas = () => {
    const context = useContext(FaturasContext);
    if (context === undefined) {
        throw new Error('useFaturas must be used within a FaturasProvider');
    }
    return context;
};

export const FaturasProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [faturas, setFaturas] = useState<Fatura[]>(() => loadFromStorage('app_faturas', generateMockFaturas(0)));
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        saveToStorage('app_faturas', faturas);
    }, [faturas]);

    const addEntregaToFatura = (
        solicitacao: Solicitacao, 
        taxasExtras: TaxaExtra[] = [], 
        conciliacao?: ConciliacaoData, 
        regrasPagamento: FormaPagamentoConciliacao[] = [],
        cliente?: Cliente
    ) => {
        if (!solicitacao || !solicitacao.clienteId) {
            console.error("Tentativa de criar fatura sem dados de solicitação válidos.");
            return;
        }

        setFaturas(prevFaturas => {
            const faturasClone = prevFaturas.map(f => ({ ...f, entregas: [...f.entregas], historico: [...f.historico] }));
            
            let faturaAbertaIndex = faturasClone.findIndex(f => f.clienteId === solicitacao.clienteId && (f.statusGeral === 'Aberta' || f.statusGeral === 'Vencida'));

            const novasEntregas: EntregaIncluida[] = solicitacao.rotas.map(rota => {
                const taxasExtrasDaRota = (rota.taxasExtrasIds || [])
                    .map(id => taxasExtras.find(te => te.id === id))
                    .filter((te): te is TaxaExtra => !!te)
                    .map(te => ({ nome: te.nome, valor: te.valor }));

                const valorTotalTaxaOriginal = rota.taxaEntrega + taxasExtrasDaRota.reduce((sum, t) => sum + t.valor, 0);
                const valorTotalRepasseOriginal = rota.valorExtra || 0;

                let taxaFaturada = valorTotalTaxaOriginal;
                let repasseFaturado = valorTotalRepasseOriginal;

                if (conciliacao && regrasPagamento.length > 0 && conciliacao[rota.id]) {
                    const rotaConciliacao = conciliacao[rota.id];
                    
                    taxaFaturada = rotaConciliacao.pagamentosTaxa.reduce((acc, pag) => {
                        const regra = regrasPagamento.find(r => r.id === pag.formaPagamentoId);
                        if (regra?.acaoFaturamento === 'GERAR_DEBITO_TAXA') return acc + pag.valor;
                        return acc;
                    }, 0);

                    repasseFaturado = rotaConciliacao.pagamentosRepasse.reduce((acc, pag) => {
                        const regra = regrasPagamento.find(r => r.id === pag.formaPagamentoId);
                        if (regra?.acaoFaturamento === 'GERAR_CREDITO_REPASSE') return acc + pag.valor;
                        return acc;
                    }, 0);
                }

                return {
                    id: rota.id,
                    data: solicitacao.dataSolicitacao,
                    descricao: `Entrega para ${rota.responsavel} (Ref: ${solicitacao.codigo})`,
                    entregadorId: solicitacao.entregadorId,
                    entregadorNome: solicitacao.entregadorNome,
                    taxaEntrega: rota.taxaEntrega,
                    taxasExtras: taxasExtrasDaRota,
                    valorRepasse: valorTotalRepasseOriginal,
                    taxaFaturada: taxaFaturada,
                    repasseFaturado: repasseFaturado
                };
            });

            if (faturaAbertaIndex >= 0) {
                const fatura = faturasClone[faturaAbertaIndex];
                const uniqueNovasEntregas = novasEntregas.filter(ne => !fatura.entregas.some(e => e.id === ne.id));
                
                if (uniqueNovasEntregas.length > 0) {
                    fatura.entregas.push(...uniqueNovasEntregas);
                    faturasClone[faturaAbertaIndex] = recalculateFaturaTotals(fatura);
                    toast.success(`Entregas adicionadas à fatura ${fatura.numero}`);
                }
            } else {
                const dataVencimento = calculateDueDate(cliente);
                const novaFatura: Fatura = {
                    id: faker.string.uuid(),
                    numero: `FAT-${new Date().getFullYear()}-${String(faturasClone.length + 1).padStart(4, '0')}`,
                    clienteId: solicitacao.clienteId,
                    clienteNome: solicitacao.clienteNome,
                    tipoFaturamento: cliente?.frequenciaFaturamento === 'mensal' ? 'Mensal' : (cliente?.frequenciaFaturamento === 'semanal' ? 'Semanal' : 'Manual'),
                    totalEntregas: 0,
                    dataEmissao: new Date(),
                    dataVencimento: dataVencimento,
                    valorTaxas: 0,
                    statusTaxas: 'Pendente',
                    valorRepasse: 0,
                    statusRepasse: 'Pendente',
                    statusGeral: 'Aberta',
                    entregas: novasEntregas,
                    historico: [{ id: faker.string.uuid(), acao: 'criada', data: new Date() }],
                    observacoes: `Fatura gerada automaticamente em ${format(new Date(), 'dd/MM/yyyy')}`
                };
                const faturaCalculada = recalculateFaturaTotals(novaFatura);
                faturasClone.push(faturaCalculada);
                toast.success(`Nova fatura ${novaFatura.numero} gerada para ${solicitacao.clienteNome}`);
            }
            return faturasClone;
        });
    };

    const addManualEntregaToFatura = (faturaId: string, entregaData: Omit<EntregaIncluida, 'id'>) => {
        setFaturas(prev => prev.map(f => {
            if (f.id === faturaId) {
                const newEntrega: EntregaIncluida = { 
                    ...entregaData, 
                    id: faker.string.uuid(),
                    taxaFaturada: entregaData.taxaEntrega + (entregaData.taxasExtras?.reduce((s, t) => s + t.valor, 0) || 0),
                    repasseFaturado: entregaData.valorRepasse
                };
                const updatedEntregas = [...f.entregas, newEntrega];
                return recalculateFaturaTotals({ ...f, entregas: updatedEntregas });
            }
            return f;
        }));
    };

    const updateManualEntregaInFatura = (faturaId: string, entregaId: string, entregaData: Partial<Omit<EntregaIncluida, 'id'>>) => {
        setFaturas(prev => prev.map(f => {
            if (f.id === faturaId) {
                const updatedEntregas = f.entregas.map(e => {
                    if (e.id === entregaId) {
                        const updated = { ...e, ...entregaData };
                        if (entregaData.taxaEntrega !== undefined || entregaData.taxasExtras !== undefined) {
                            const extras = updated.taxasExtras?.reduce((s, t) => s + t.valor, 0) || 0;
                            updated.taxaFaturada = updated.taxaEntrega + extras;
                        }
                        if (entregaData.valorRepasse !== undefined) {
                            updated.repasseFaturado = updated.valorRepasse;
                        }
                        return updated;
                    }
                    return e;
                });
                return recalculateFaturaTotals({ ...f, entregas: updatedEntregas });
            }
            return f;
        }));
    };

    const deleteManualEntregaFromFatura = (faturaId: string, entregaId: string) => {
        setFaturas(prev => prev.map(f => {
            if (f.id === faturaId) {
                const updatedEntregas = f.entregas.filter(e => e.id !== entregaId);
                return recalculateFaturaTotals({ ...f, entregas: updatedEntregas });
            }
            return f;
        }));
    };

    const deleteFatura = (id: string) => {
        setFaturas(prev => prev.filter(f => f.id !== id));
    };

    const registrarPagamentoTaxa = (faturaId: string, detalhes: string) => {
        setFaturas(prev => prev.map(f => {
            if (f.id === faturaId) {
                const updatedFatura = { ...f, statusTaxas: 'Paga' as FaturaStatusPagamento };
                const newHistory: HistoricoItem = { id: faker.string.uuid(), acao: 'pagamento_taxa', data: new Date(), detalhes };
                updatedFatura.historico = [...(updatedFatura.historico || []), newHistory].sort((a,b) => a.data.getTime() - b.data.getTime());

                if (updatedFatura.statusRepasse === 'Repassado' || updatedFatura.valorRepasse === 0) {
                    updatedFatura.statusGeral = 'Finalizada';
                    updatedFatura.historico.push({ id: faker.string.uuid(), acao: 'finalizada', data: new Date() });
                } else {
                    updatedFatura.statusGeral = 'Paga';
                }
                return updatedFatura;
            }
            return f;
        }));
    };

    const registrarPagamentoRepasse = (faturaId: string, detalhes: string) => {
        setFaturas(prev => prev.map(f => {
            if (f.id === faturaId) {
                const updatedFatura = { ...f, statusRepasse: 'Repassado' as FaturaStatusRepasse };
                const newHistory: HistoricoItem = { id: faker.string.uuid(), acao: 'pagamento_repasse', data: new Date(), detalhes };
                updatedFatura.historico = [...(updatedFatura.historico || []), newHistory].sort((a,b) => a.data.getTime() - b.data.getTime());

                if (updatedFatura.statusTaxas === 'Paga') {
                    updatedFatura.statusGeral = 'Finalizada';
                    updatedFatura.historico.push({ id: faker.string.uuid(), acao: 'finalizada', data: new Date() });
                }
                return updatedFatura;
            }
            return f;
        }));
    };

    return (
        <FaturasContext.Provider value={{
            faturas,
            loading,
            addEntregaToFatura,
            addManualEntregaToFatura,
            updateManualEntregaInFatura,
            deleteManualEntregaFromFatura,
            deleteFatura,
            registrarPagamentoTaxa,
            registrarPagamentoRepasse
        }}>
            {children}
        </FaturasContext.Provider>
    );
};
