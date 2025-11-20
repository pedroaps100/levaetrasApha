import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Search, DollarSign, CheckCircle, XCircle, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSolicitacoesData } from '@/hooks/useSolicitacoesData';
import { Solicitacao } from '@/types';
import { format, isWithinInterval } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { ViewSolicitacaoDialog } from '@/pages/solicitacoes/ViewSolicitacaoDialog';

const statusConfig = {
    concluida: { label: 'Concluída', badgeClass: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800' },
    cancelada: { label: 'Cancelada', badgeClass: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600' },
};

const DriverHistoricoPage: React.FC = () => {
    const { entregadorData } = useAuth();
    const { solicitacoes, loading } = useSolicitacoesData();
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [solicitacaoToView, setSolicitacaoToView] = useState<Solicitacao | null>(null);

    const minhasSolicitacoes = useMemo(() => {
        if (!entregadorData) return [];
        return solicitacoes.filter(s => s.entregadorId === entregadorData.id && (s.status === 'concluida' || s.status === 'cancelada'));
    }, [solicitacoes, entregadorData]);

    const filteredSolicitacoes = useMemo(() => {
        return minhasSolicitacoes.filter(s => {
            const matchesDate = !dateRange || (dateRange.from && dateRange.to && isWithinInterval(s.dataSolicitacao, { start: dateRange.from, end: dateRange.to }));
            const searchTermLower = searchTerm.toLowerCase();
            const matchesSearch = s.codigo.toLowerCase().includes(searchTermLower) || s.clienteNome.toLowerCase().includes(searchTermLower);
            return matchesDate && matchesSearch;
        });
    }, [minhasSolicitacoes, searchTerm, dateRange]);

    const entregasConcluidas = useMemo(() => filteredSolicitacoes.filter(s => s.status === 'concluida'), [filteredSolicitacoes]);
    const entregasCanceladas = useMemo(() => filteredSolicitacoes.filter(s => s.status === 'cancelada'), [filteredSolicitacoes]);
    
    const calculateComissao = (solicitacao: Solicitacao): number => {
        if (!entregadorData || solicitacao.status !== 'concluida') return 0;
        
        if (entregadorData.tipoComissao === 'percentual') {
            return solicitacao.valorTotalTaxas * (entregadorData.valorComissao / 100);
        }
        return entregadorData.valorComissao;
    };

    const metrics = useMemo(() => {
        const totalEntregas = entregasConcluidas.length;
        const comissaoTotal = entregasConcluidas.reduce((sum, s) => sum + calculateComissao(s), 0);
        return { totalEntregas, comissaoTotal };
    }, [entregasConcluidas, entregadorData]);

    if (loading) return <div>Carregando histórico...</div>;

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const renderTable = (data: Solicitacao[], type: 'concluida' | 'cancelada') => (
        <>
            {/* Desktop View */}
            <div className="hidden md:block border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Solicitação</TableHead>
                            <TableHead>Cliente</TableHead>
                            {type === 'concluida' && <TableHead>Comissão</TableHead>}
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map(s => (
                            <TableRow key={s.id}>
                                <TableCell>
                                    <div className="font-medium">{s.codigo}</div>
                                    <div className="text-sm text-muted-foreground">{format(s.dataSolicitacao, 'dd/MM/yyyy HH:mm')}</div>
                                </TableCell>
                                <TableCell>{s.clienteNome}</TableCell>
                                {type === 'concluida' && <TableCell className="font-medium text-green-600">{formatCurrency(calculateComissao(s))}</TableCell>}
                                <TableCell><Badge className={statusConfig[s.status].badgeClass}>{statusConfig[s.status].label}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" title="Visualizar" onClick={() => setSolicitacaoToView(s)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && <TableRow><TableCell colSpan={type === 'concluida' ? 5 : 4} className="h-24 text-center">Nenhuma entrega encontrada.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>
            {/* Mobile View */}
            <div className="grid gap-4 md:hidden">
                {data.map(s => (
                    <Card key={s.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base">{s.codigo}</CardTitle>
                                    <CardDescription>{s.clienteNome}</CardDescription>
                                </div>
                                <Badge className={statusConfig[s.status].badgeClass}>{statusConfig[s.status].label}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Data:</span> <span className="font-medium">{format(s.dataSolicitacao, 'dd/MM/yy HH:mm')}</span></div>
                            {type === 'concluida' && <div className="flex justify-between"><span>Comissão:</span> <span className="font-bold text-green-600">{formatCurrency(calculateComissao(s))}</span></div>}
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button variant="ghost" size="icon" title="Visualizar" onClick={() => setSolicitacaoToView(s)}>
                                <Eye className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                {data.length === 0 && <div className="text-center text-muted-foreground py-10">Nenhuma entrega encontrada.</div>}
            </div>
        </>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Histórico de Entregas</h1>
                <p className="text-muted-foreground">Consulte todas as entregas que você já realizou.</p>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total de Entregas (Período)</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.totalEntregas}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Comissão Total (Período)</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.comissaoTotal)}</div></CardContent></Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative w-full md:flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar por código ou cliente..." className="pl-8 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <DatePickerWithRange onDateChange={setDateRange} />
                        <Button variant="outline" className="w-full md:w-auto gap-2"><Download className="h-4 w-4" />Exportar</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="concluidas">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="concluidas" className="gap-2"><CheckCircle className="h-4 w-4"/>Concluídas</TabsTrigger>
                            <TabsTrigger value="canceladas" className="gap-2"><XCircle className="h-4 w-4"/>Canceladas</TabsTrigger>
                        </TabsList>
                        <TabsContent value="concluidas" className="mt-4">
                            {renderTable(entregasConcluidas, 'concluida')}
                        </TabsContent>
                        <TabsContent value="canceladas" className="mt-4">
                            {renderTable(entregasCanceladas, 'cancelada')}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
            <ViewSolicitacaoDialog isOpen={!!solicitacaoToView} onClose={() => setSolicitacaoToView(null)} solicitacao={solicitacaoToView} />
        </div>
    );
};

export default DriverHistoricoPage;
