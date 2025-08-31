import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRelatoriosData } from '@/hooks/useRelatoriosData';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { ResumoFinanceiroTab } from './ResumoFinanceiroTab';
import { ComissoesTab } from './ComissoesTab';
import { DespesasTab } from './DespesasTab';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToPDF, exportToExcel } from '@/lib/exportUtils';
import { format } from 'date-fns';

export const RelatoriosPage: React.FC = () => {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const { metrics, detalhamentoDespesas, relatorioComissoes, loading } = useRelatoriosData(dateRange);
    const [activeTab, setActiveTab] = useState('resumo');

    const handleExport = () => {
        if (activeTab === 'comissoes') {
            const columns = [
                { header: 'Entregador', dataKey: 'nome' },
                { header: 'Nº Entregas', dataKey: 'totalEntregas' },
                { header: 'Valor Gerado', dataKey: 'valorTotalGerado' },
                { header: 'Comissão a Pagar', dataKey: 'comissaoTotal' },
            ];
            const data = relatorioComissoes.map(item => ({ ...item, valorTotalGerado: formatCurrency(item.valorTotalGerado), comissaoTotal: formatCurrency(item.comissaoTotal) }));
            exportToPDF(columns, data, 'Relatório de Comissões', 'comissoes');
        } else if (activeTab === 'despesas') {
            const columns = [
                { header: 'Descrição', dataKey: 'descricao' },
                { header: 'Categoria', dataKey: 'categoria' },
                { header: 'Fornecedor', dataKey: 'fornecedor' },
                { header: 'Vencimento', dataKey: 'vencimento' },
                { header: 'Valor', dataKey: 'valor' },
            ];
            const data = detalhamentoDespesas.map(item => ({ ...item, valor: formatCurrency(item.valor), vencimento: format(item.vencimento, 'dd/MM/yyyy') }));
            exportToPDF(columns, data, 'Relatório de Despesas', 'despesas');
        }
    };

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Relatórios Gerenciais</h1>
                    <p className="text-muted-foreground">Analise os dados financeiros e operacionais do seu negócio.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <DatePickerWithRange onDateChange={setDateRange} />
                    <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" /> Exportar</Button>
                </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="resumo">
                <div className="w-full overflow-x-auto pb-2">
                    <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
                        <TabsTrigger value="resumo">Resumo Financeiro</TabsTrigger>
                        <TabsTrigger value="comissoes">Comissões de Entregadores</TabsTrigger>
                        <TabsTrigger value="despesas">Detalhamento de Despesas</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="resumo" className="mt-4">
                    <ResumoFinanceiroTab metrics={metrics} />
                </TabsContent>
                <TabsContent value="comissoes" className="mt-4">
                    <ComissoesTab relatorioComissoes={relatorioComissoes} />
                </TabsContent>
                <TabsContent value="despesas" className="mt-4">
                    <DespesasTab despesas={detalhamentoDespesas} />
                </TabsContent>
            </Tabs>
        </div>
    );
};
