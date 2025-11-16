import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTransaction } from '@/contexts/TransactionContext';
import { Transaction } from '@/types';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';

const originMap: Record<Transaction['origin'], string> = {
    recharge_pix: 'Recarga Pix',
    recharge_card: 'Recarga Cartão',
    recharge_manual: 'Crédito Manual',
    delivery_fee: 'Taxa de Entrega',
    cancellation_fee: 'Taxa de Cancelamento',
};

const ClientFinanceiroPage: React.FC = () => {
    const { clientData } = useAuth();
    const { transactions, loading } = useTransaction();
    const [typeFilter, setTypeFilter] = useState('todos');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const clientTransactions = useMemo(() => {
        if (!clientData) return [];
        return transactions.filter(tx => tx.clientName === clientData.nome);
    }, [transactions, clientData]);
    
    const currentBalance = useMemo(() => {
        return clientTransactions.reduce((acc, tx) => {
            if (tx.type === 'credit') {
                return acc + tx.value;
            }
            return acc - tx.value;
        }, 0);
    }, [clientTransactions]);

    const filteredTransactions = useMemo(() => {
        return clientTransactions.filter(tx => {
            const matchesType = typeFilter === 'todos' || tx.type === typeFilter;
            const matchesDate = !dateRange || (dateRange.from && dateRange.to && new Date(tx.date) >= dateRange.from && new Date(tx.date) <= dateRange.to);
            return matchesType && matchesDate;
        });
    }, [clientTransactions, typeFilter, dateRange]);

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (loading) {
        return <div>Carregando dados financeiros...</div>;
    }

    if (clientData?.modalidade !== 'pré-pago') {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Financeiro</CardTitle>
                    <CardDescription>Esta área é para clientes com modalidade pré-paga.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">Seu plano é faturado. Consulte suas faturas para detalhes financeiros.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
                <p className="text-muted-foreground">Consulte seu saldo e extrato de movimentações.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(currentBalance)}
                    </div>
                    <p className="text-xs text-muted-foreground">Saldo disponível para novas solicitações.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Extrato de Movimentações</CardTitle>
                    <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
                        <DatePickerWithRange onDateChange={setDateRange} />
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-[180px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos os Tipos</SelectItem>
                                <SelectItem value="credit">Créditos</SelectItem>
                                <SelectItem value="debit">Débitos</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="w-full md:w-auto gap-2" onClick={() => { setTypeFilter('todos'); setDateRange(undefined) }}>
                            <Trash2 className="h-4 w-4" />Limpar Filtros
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Desktop View */}
                    <div className="hidden md:block border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Origem</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.map(tx => (
                                    <TableRow key={tx.id}>
                                        <TableCell>{format(new Date(tx.date), 'dd/MM/yyyy HH:mm')}</TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            {tx.type === 'credit' ? <ArrowUpCircle className="h-4 w-4 text-green-500" /> : <ArrowDownCircle className="h-4 w-4 text-red-500" />}
                                            {tx.description}
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{originMap[tx.origin]}</Badge></TableCell>
                                        <TableCell className={`text-right font-medium ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'credit' ? '+' : '-'} {formatCurrency(tx.value)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredTransactions.length === 0 && <TableRow><TableCell colSpan={4} className="text-center h-24">Nenhuma transação encontrada.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile/Tablet View */}
                    <div className="grid gap-4 md:hidden">
                        {filteredTransactions.map(tx => (
                            <Card key={tx.id} className="w-full">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {tx.type === 'credit' ? <ArrowUpCircle className="h-5 w-5 text-green-500" /> : <ArrowDownCircle className="h-5 w-5 text-red-500" />}
                                            <CardTitle className="text-base">{tx.description}</CardTitle>
                                        </div>
                                        <p className={`font-bold text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'credit' ? '+' : '-'} {formatCurrency(tx.value)}
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div><span className="font-medium text-muted-foreground">Data:</span> {format(new Date(tx.date), 'dd/MM/yy HH:mm')}</div>
                                    <div className="flex items-center">
                                        <span className="font-medium text-muted-foreground mr-2">Origem:</span>
                                        <Badge variant="outline">{originMap[tx.origin]}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {filteredTransactions.length === 0 && <div className="text-center text-muted-foreground py-10">Nenhuma transação encontrada.</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ClientFinanceiroPage;
