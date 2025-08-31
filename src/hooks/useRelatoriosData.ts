import { useMemo } from 'react';
import { useFinanceiroData } from './useFinanceiroData';
import { useSolicitacoesData } from './useSolicitacoesData';
import { useEntregadoresData } from './useEntregadoresData';
import { isWithinInterval } from 'date-fns';
import { DateRange } from 'react-day-picker';

export const useRelatoriosData = (dateRange?: DateRange) => {
    const { despesas } = useFinanceiroData();
    const { solicitacoes } = useSolicitacoesData();
    const { entregadores } = useEntregadoresData();

    const data = useMemo(() => {
        const filteredSolicitacoes = dateRange?.from && dateRange?.to 
            ? solicitacoes.filter(s => isWithinInterval(s.dataSolicitacao, { start: dateRange.from!, end: dateRange.to! }))
            : solicitacoes;

        const filteredDespesas = dateRange?.from && dateRange?.to
            ? despesas.filter(d => isWithinInterval(d.vencimento, { start: dateRange.from!, end: dateRange.to! }))
            : despesas;

        // 1. Calcular Receitas (baseado em taxas de entregas concluídas)
        const totalReceitas = filteredSolicitacoes
            .filter(s => s.status === 'concluida')
            .reduce((sum, s) => sum + s.valorTotalTaxas, 0);

        // 2. Calcular Despesas
        const totalDespesas = filteredDespesas.reduce((sum, d) => sum + d.valor, 0);

        // 3. Calcular Comissões
        const comissoesPorEntregador = entregadores.map(entregador => {
            const entregasDoEntregador = filteredSolicitacoes.filter(
                s => s.status === 'concluida' && s.entregadorId === entregador.id
            );

            const totalEntregas = entregasDoEntregador.length;
            const valorTotalGerado = entregasDoEntregador.reduce((sum, s) => sum + s.valorTotalTaxas, 0);
            
            let comissaoTotal = 0;
            if (entregador.tipoComissao === 'percentual') {
                comissaoTotal = valorTotalGerado * (entregador.valorComissao / 100);
            } else { // Fixo
                comissaoTotal = totalEntregas * entregador.valorComissao;
            }

            return {
                entregadorId: entregador.id,
                nome: entregador.nome,
                avatar: entregador.avatar,
                totalEntregas,
                valorTotalGerado,
                comissaoTotal,
            };
        });

        const totalComissoes = comissoesPorEntregador.reduce((sum, c) => sum + c.comissaoTotal, 0);

        // 4. Calcular Lucro
        const lucroOperacional = totalReceitas - totalDespesas - totalComissoes;

        return {
            metrics: {
                totalReceitas,
                totalDespesas,
                totalComissoes,
                lucroOperacional,
            },
            detalhamentoDespesas: filteredDespesas,
            relatorioComissoes: comissoesPorEntregador.filter(c => c.totalEntregas > 0),
        };

    }, [dateRange, solicitacoes, despesas, entregadores]);

    return { ...data, loading: false };
};
