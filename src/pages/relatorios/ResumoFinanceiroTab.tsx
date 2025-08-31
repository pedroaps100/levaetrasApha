import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Percent } from 'lucide-react';

interface ResumoFinanceiroTabProps {
    metrics: {
        totalReceitas: number;
        totalDespesas: number;
        totalComissoes: number;
        lucroOperacional: number;
    }
}

export const ResumoFinanceiroTab: React.FC<ResumoFinanceiroTabProps> = ({ metrics }) => {
    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Receita Total (Taxas)</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalReceitas)}</div>
                    <p className="text-xs text-muted-foreground">Total de taxas de entrega recebidas.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(metrics.totalDespesas)}</div>
                    <p className="text-xs text-muted-foreground">Soma de todas as despesas operacionais.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Comissões a Pagar</CardTitle>
                    <Percent className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{formatCurrency(metrics.totalComissoes)}</div>
                    <p className="text-xs text-muted-foreground">Total de comissões para entregadores.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Lucro Operacional</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${metrics.lucroOperacional >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        {formatCurrency(metrics.lucroOperacional)}
                    </div>
                    <p className="text-xs text-muted-foreground">Receitas - (Despesas + Comissões)</p>
                </CardContent>
            </Card>
        </div>
    );
}
