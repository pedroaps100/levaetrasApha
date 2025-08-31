import { useState, useEffect } from 'react';
import { Fatura, FaturaStatusGeral, FaturaStatusPagamento, FaturaStatusRepasse, EntregaIncluida, HistoricoItem, Solicitacao, ConciliacaoData, FormaPagamentoConciliacao } from '@/types';
import { faker } from '@faker-js/faker';
import { subDays, addDays, addHours } from 'date-fns';

// --- LocalStorage Helper ---
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

const generateMockEntregasIncluidas = (count: number): EntregaIncluida[] => {
    return Array.from({length: count}, (_, i) => ({
        id: `ENT-${5842 + i}`,
        data: faker.date.recent({days: 10}),
        endereco: faker.location.streetAddress(true),
        entregador: faker.person.fullName(),
        taxa: faker.number.float({min: 8, max: 20, multipleOf: 0.5}),
        valorExtra: faker.number.float({min: 50, max: 200, multipleOf: 0.1}),
    }))
}

const generateMockFaturas = (count: number): Fatura[] => {
    return Array.from({ length: count }, (_, i) => {
        const statusTaxas = faker.helpers.arrayElement<FaturaStatusPagamento>(['Pendente', 'Paga', 'Vencida']);
        const statusRepasse = faker.helpers.arrayElement<FaturaStatusRepasse>(['Pendente', 'Repassado']);
        const entregas = generateMockEntregasIncluidas(faker.number.int({min: 3, max: 8}));
        const dataEmissao = subDays(new Date(2025, 5, 1), i * 5);
        
        let statusGeral: FaturaStatusGeral = 'Aberta';
        const historico: HistoricoItem[] = [{ id: faker.string.uuid(), acao: 'criada', data: dataEmissao }];
        
        if (statusTaxas === 'Paga' && statusRepasse === 'Pendente') {
            statusGeral = 'Paga';
            historico.push({ id: faker.string.uuid(), acao: 'pagamento_taxa', data: addHours(dataEmissao, 2), detalhes: 'Pagamento via Pix' });
        } else if (statusTaxas === 'Paga' && statusRepasse === 'Repassado') {
            statusGeral = 'Finalizada';
            historico.push({ id: faker.string.uuid(), acao: 'pagamento_taxa', data: addHours(dataEmissao, 2), detalhes: 'Pagamento via Pix' });
            historico.push({ id: faker.string.uuid(), acao: 'pagamento_repasse', data: addHours(dataEmissao, 4), detalhes: 'Repasse via Transferência' });
            historico.push({ id: faker.string.uuid(), acao: 'finalizada', data: addHours(dataEmissao, 5) });
        } else if (statusTaxas === 'Vencida') {
            statusGeral = 'Vencida';
        } else if (statusTaxas === 'Pendente' && statusRepasse === 'Pendente') {
            statusGeral = 'Aberta';
        }
        
        return {
            id: faker.string.uuid(),
            numero: `FAT-2025-000${i + 1}`,
            clienteId: `client-${i+1}`,
            clienteNome: faker.company.name(),
            tipoFaturamento: faker.helpers.arrayElement(['Mensal', 'Semanal', 'Diário', 'Manual']),
            totalEntregas: entregas.length,
            dataEmissao,
            dataVencimento: addDays(new Date(2025, 5, 15), i * 3),
            valorTaxas: entregas.reduce((sum, e) => sum + e.taxa, 0),
            statusTaxas,
            valorRepasse: entregas.reduce((sum, e) => sum + e.valorExtra, 0),
            statusRepasse,
            statusGeral,
            observacoes: `Fatura referente ao período de ${faker.date.month({ abbreviated: false })}.`,
            entregas,
            historico: historico.sort((a,b) => a.data.getTime() - b.data.getTime()),
        };
    });
};

export const useFaturasData = () => {
    const [faturas, setFaturas] = useState<Fatura[]>(() => loadFromStorage('app_faturas', generateMockFaturas(6)));
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        saveToStorage('app_faturas', faturas);
    }, [faturas]);

    const addEntregaToFatura = (solicitacao: Solicitacao, conciliacao: ConciliacaoData, formasPagamento: FormaPagamentoConciliacao[]) => {
        let debitosTaxa = 0;
        let creditosRepasse = 0;

        Object.values(conciliacao).forEach(rotaConciliada => {
            rotaConciliada.pagamentosTaxa.forEach(pagamento => {
                const forma = formasPagamento.find(f => f.id === pagamento.formaPagamentoId);
                if (forma?.acaoFaturamento === 'GERAR_DEBITO_TAXA') {
                    debitosTaxa += pagamento.valor;
                }
            });
            rotaConciliada.pagamentosRepasse.forEach(pagamento => {
                const forma = formasPagamento.find(f => f.id === pagamento.formaPagamentoId);
                if (forma?.acaoFaturamento === 'GERAR_CREDITO_REPASSE') {
                    creditosRepasse += pagamento.valor;
                }
            });
        });
        
        if (debitosTaxa === 0 && creditosRepasse === 0) {
            return; // No financial impact, no invoice needed
        }

        setFaturas(prevFaturas => {
            const faturasClone = [...prevFaturas];
            let faturaAberta = faturasClone.find(f => f.clienteId === solicitacao.clienteId && f.statusGeral === 'Aberta');

            const novasEntregas = solicitacao.rotas.map(r => ({
                id: r.id,
                data: solicitacao.dataSolicitacao,
                endereco: `Bairro: ${r.bairroDestinoId}`, // Placeholder
                entregador: solicitacao.entregadorNome || 'N/A',
                taxa: r.taxaEntrega,
                valorExtra: r.valorExtra || 0,
            }));

            if (faturaAberta) {
                faturaAberta.entregas.push(...novasEntregas);
                faturaAberta.valorTaxas += debitosTaxa;
                faturaAberta.valorRepasse += creditosRepasse;
                faturaAberta.totalEntregas = faturaAberta.entregas.length;
            } else {
                const novaFatura: Fatura = {
                    id: faker.string.uuid(),
                    numero: `FAT-2025-00${faturasClone.length + 1}`,
                    clienteId: solicitacao.clienteId,
                    clienteNome: solicitacao.clienteNome,
                    tipoFaturamento: 'Manual',
                    totalEntregas: novasEntregas.length,
                    dataEmissao: new Date(),
                    dataVencimento: addDays(new Date(), 30),
                    valorTaxas: debitosTaxa,
                    statusTaxas: debitosTaxa > 0 ? 'Pendente' : 'Paga',
                    valorRepasse: creditosRepasse,
                    statusRepasse: creditosRepasse > 0 ? 'Pendente' : 'Repassado',
                    statusGeral: 'Aberta',
                    entregas: novasEntregas,
                    historico: [{ id: faker.string.uuid(), acao: 'criada', data: new Date() }],
                };
                faturasClone.push(novaFatura);
            }
            return faturasClone;
        });
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

    const deleteFatura = (id: string) => {
        setFaturas(prev => prev.filter(f => f.id !== id));
    };

    return { faturas, loading, addEntregaToFatura, deleteFatura, registrarPagamentoTaxa, registrarPagamentoRepasse };
};
