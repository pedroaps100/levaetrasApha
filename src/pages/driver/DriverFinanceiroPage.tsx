import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useSolicitacoesData } from '@/hooks/useSolicitacoesData';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DollarSign, Truck, CalendarClock } from 'lucide-react';
import { Solicitacao } from '@/types';

const MetricCard: React.FC<{ title: string; value: string; icon: React.ElementType; description: string }> = ({ title, value, icon: Icon, description }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

const DriverFinanceiroPage: React.FC = () => {
    const { entregadorData } = useAuth();
    const { solicitacoes, loading } = useSolicitacoesData();

    const calculateComissao = (solicitacao: Solicitacao): number => {
        if (!entregadorData || solicitacao.status !== 'concluida') return 0;
        
        if (entregadorData.tipoComissao === 'percentual') {
            return solicitacao.valorTotalTaxas * (entregadorData.valorComissao / 100);
        }
        // Para comissão fixa, o valor é por entrega (solicitação)
        return entregadorData.valorComissao;
    };

    const financeiroData = useMemo(() => {
        if (!entregadorData || solicitacoes.length === 0) {
            return { monthlySummary: [], currentMonthCommission: 0, totalToReceive: 0, deliveriesThisMonth: 0 };
        }

        const minhasEntregasConcluidas = solicitacoes.filter(
            s => s.entregadorId === entregadorData.id && s.status === 'concluida'
        );

        const monthlyData: Record<string, { totalEntregas: number; comissaoTotal: number }> = {};

        minhasEntregasConcluidas.forEach(entrega => {
            const monthYearKey = format(entrega.dataSolicitacao, 'yyyy-MM');
            const comissao = calculateComissao(entrega);

            if (!monthlyData[monthYearKey]) {
                monthlyData[monthYearKey] = { totalEntregas: 0, comissaoTotal: 0 };
            }

            monthlyData[monthYearKey].totalEntregas += 1;
            monthlyData[monthYearKey].comissaoTotal += comissao;
        });
        
        const monthlySummary = Object.entries(monthlyData)
            .map(([key, value]) => ({
                mesAno: key,
                ...value,
            }))
            .sort((a, b) => b.mesAno.localeCompare(a.mesAno));

        const currentMonthKey = format(new Date(), 'yyyy-MM');
        const currentMonthData = monthlyData[currentMonthKey];

        const totalToReceive = monthlySummary.reduce((sum, month) => sum + month.comissaoTotal, 0);

        return {
            monthlySummary,
            currentMonthCommission: currentMonthData?.comissaoTotal || 0,
            totalToReceive,
            deliveriesThisMonth: currentMonthData?.totalEntregas || 0,
        };
    }, [solicitacoes, entregadorData]);

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (loading) {
        return <div>Carregando dados financeiros...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Meu Financeiro</h1>
                <p className="text-muted-foreground">Acompanhe suas comissões e pagamentos.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <MetricCard 
                    title="Comissão do Mês Atual" 
                    value={formatCurrency(financeiroData.currentMonthCommission)} 
                    icon={DollarSign}
                    description={`${financeiroData.deliveriesThisMonth} entregas este mês`}
                />
                <MetricCard 
                    title="Total a Receber" 
                    value={formatCurrency(financeiroData.totalToReceive)} 
                    icon={CalendarClock}
                    description="Soma de todas as comissões pendentes"
                />
                <MetricCard 
                    title="Total de Entregas (Mês)" 
                    value={String(financeiroData.deliveriesThisMonth)} 
                    icon={Truck}
                    description="Entregas concluídas no mês corrente"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Resumo Mensal de Comissões</CardTitle>
                    <CardDescription>
                        Detalhes de suas entregas e comissões agrupados por mês.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Desktop View */}
                    <div className="hidden md:block border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mês/Ano</TableHead>
                                    <TableHead className="text-center">Nº de Entregas</TableHead>
                                    <TableHead className="text-right">Valor da Comissão</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {financeiroData.monthlySummary.map(item => (
                                    <TableRow key={item.mesAno}>
                                        <TableCell className="font-medium capitalize">
                                            {format(parse(item.mesAno, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ptBR })}
                                        </TableCell>
                                        <TableCell className="text-center">{item.totalEntregas}</TableCell>
                                        <TableCell className="text-right font-bold text-primary">
                                            {formatCurrency(item.comissaoTotal)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {financeiroData.monthlySummary.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            Nenhum dado financeiro encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {/* Mobile View */}
                    <div className="grid gap-4 md:hidden">
                        {financeiroData.monthlySummary.map(item => (
                            <Card key={item.mesAno}>
                                <CardHeader>
                                    <CardTitle className="text-base capitalize">
                                        {format(parse(item.mesAno, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: ptBR })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Nº de Entregas:</span>
                                        <span className="font-medium">{item.totalEntregas}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Comissão:</span>
                                        <span className="font-bold text-primary">{formatCurrency(item.comissaoTotal)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {financeiroData.monthlySummary.length === 0 && (
                            <div className="text-center text-muted-foreground py-10">
                                Nenhum dado financeiro encontrado.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DriverFinanceiroPage;
