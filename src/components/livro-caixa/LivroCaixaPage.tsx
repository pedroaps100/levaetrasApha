import React, { useState, useMemo } from 'react';
import { useLivroCaixaData } from '@/hooks/useLivroCaixaData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from "sonner";
import { Search, Trash2, Download, ArrowUp, ArrowDown, DollarSign } from 'lucide-react';
import { Transaction } from '@/types';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '../ui/date-range-picker';

const originMap: Record<Transaction['origin'], string> = {
    recharge_pix: 'Recarga Pix',
    recharge_card: 'Recarga Cartão',
    recharge_manual: 'Crédito Manual',
    delivery_fee: 'Taxa de Entrega',
    cancellation_fee: 'Taxa de Cancelamento',
};

export const LivroCaixaPage: React.FC = () => {
    const { transactions, loading } = useLivroCaixaData();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('todos');
    const [originFilter, setOriginFilter] = useState('todos');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const matchesSearch = tx.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) || tx.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'todos' || tx.type === typeFilter;
            const matchesOrigin = originFilter === 'todos' || tx.origin === originFilter;
            const matchesDate = !dateRange || (dateRange.from && dateRange.to && tx.date >= dateRange.from && tx.date <= dateRange.to);
            return matchesSearch && matchesType && matchesOrigin && matchesDate;
        });
    }, [transactions, searchTerm, typeFilter, originFilter, dateRange]);

    const summary = useMemo(() => {
        return filteredTransactions.reduce((acc, tx) => {
            if (tx.type === 'credit') {
                acc.entradas += tx.value;
            } else {
                acc.saidas += tx.value;
            }
            acc.saldo = acc.entradas - acc.saidas;
            return acc;
        }, { entradas: 0, saidas: 0, saldo: 0 });
    }, [filteredTransactions]);

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (loading) {
        return <div className="p-6 text-center">Carregando livro caixa...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Livro Caixa</h1>
                <p className="text-muted-foreground">
                    Visualize todas as movimentações financeiras do sistema.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
                        <ArrowUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.entradas)}</div>
                        <p className="text-xs text-muted-foreground">Créditos no período selecionado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
                        <ArrowDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.saidas)}</div>
                        <p className="text-xs text-muted-foreground">Débitos no período selecionado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo do Período</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${summary.saldo >= 0 ? 'text-primary' : 'text-destructive'}`}>{formatCurrency(summary.saldo)}</div>
                        <p className="text-xs text-muted-foreground">Resultado das movimentações</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative w-full md:flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar por cliente ou descrição..." className="pl-8 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <DatePickerWithRange onDateChange={setDateRange} />
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full md:w-[180px]"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="todos">Todos os Tipos</SelectItem><SelectItem value="credit">Crédito</SelectItem><SelectItem value="debit">Débito</SelectItem></SelectContent>
                        </Select>
                        <Select value={originFilter} onValueChange={setOriginFilter}>
                            <SelectTrigger className="w-full md:w-[180px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todas as Origens</SelectItem>
                                {Object.entries(originMap).map(([key, value]) => <SelectItem key={key} value={key}>{value}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="w-full md:w-auto gap-2" onClick={() => { setSearchTerm(''); setTypeFilter('todos'); setOriginFilter('todos'); setDateRange(undefined) }}>
                            <Trash2 className="h-4 w-4" />Limpar
                        </Button>
                        <Button className="w-full md:w-auto gap-2"><Download className="h-4 w-4" />Exportar</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Desktop View */}
                    <div className="hidden lg:block border rounded-lg">
                        <Table>
                            <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Data</TableHead><TableHead>Descrição</TableHead><TableHead>Origem</TableHead><TableHead className="text-right">Valor</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {filteredTransactions.map(tx => (
                                    <TableRow key={tx.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8"><AvatarImage src={tx.clientAvatar} /><AvatarFallback>{tx.clientName?.charAt(0)}</AvatarFallback></Avatar>
                                                <span className="font-medium">{tx.clientName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{format(tx.date, 'dd/MM/yyyy HH:mm')}</TableCell>
                                        <TableCell>{tx.description}</TableCell>
                                        <TableCell><Badge variant="outline">{originMap[tx.origin]}</Badge></TableCell>
                                        <TableCell className={`text-right font-medium ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'credit' ? '+' : '-'} {formatCurrency(tx.value)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredTransactions.length === 0 && <TableRow><TableCell colSpan={5} className="text-center h-24">Nenhuma transação encontrada.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile/Tablet View */}
                    <div className="grid gap-4 lg:hidden">
                        {filteredTransactions.map(tx => (
                            <Card key={tx.id} className="w-full">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar><AvatarImage src={tx.clientAvatar} /><AvatarFallback>{tx.clientName?.charAt(0)}</AvatarFallback></Avatar>
                                            <CardTitle className="text-base">{tx.clientName}</CardTitle>
                                        </div>
                                        <p className={`font-bold text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'credit' ? '+' : '-'} {formatCurrency(tx.value)}
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div><span className="font-medium text-muted-foreground">Descrição:</span> {tx.description}</div>
                                    <div><span className="font-medium text-muted-foreground">Data:</span> {format(tx.date, 'dd/MM/yy HH:mm')}</div>
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
