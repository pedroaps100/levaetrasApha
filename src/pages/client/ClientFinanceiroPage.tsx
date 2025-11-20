import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, FileText, Download, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFaturasData } from '@/hooks/useFaturasData';
import { Fatura, FaturaStatusGeral } from '@/types';
import { format } from 'date-fns';
import { FaturaDetailsModal } from '@/pages/faturas/FaturaDetailsModal';
import { toast } from 'sonner';

const statusGeralConfig: Record<FaturaStatusGeral, { label: string; badgeClass: string; }> = {
    Aberta: { label: 'Aberta', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800' },
    Fechada: { label: 'Fechada', badgeClass: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600' },
    Paga: { label: 'Paga', badgeClass: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800' },
    Finalizada: { label: 'Finalizada', badgeClass: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800' },
    Vencida: { label: 'Vencida', badgeClass: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800' },
};

const ClientFinanceiroPage: React.FC = () => {
    const { clientData } = useAuth();
    const { faturas, loading } = useFaturasData();
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedFatura, setSelectedFatura] = useState<Fatura | null>(null);

    const clientFaturas = useMemo(() => {
        if (!clientData) return [];
        return faturas.filter(f => f.clienteId === clientData.id);
    }, [faturas, clientData]);

    const faturasAbertas = useMemo(() => {
        return clientFaturas.filter(f => f.statusGeral === 'Aberta' || f.statusGeral === 'Vencida');
    }, [clientFaturas]);

    const faturasPagas = useMemo(() => {
        return clientFaturas.filter(f => f.statusGeral === 'Paga' || f.statusGeral === 'Finalizada');
    }, [clientFaturas]);

    const metrics = useMemo(() => {
        const valorTotalAberto = faturasAbertas.reduce((sum, f) => sum + f.valorTaxas, 0);
        const proximoVencimento = faturasAbertas
            .filter(f => f.statusGeral === 'Aberta')
            .sort((a, b) => a.dataVencimento.getTime() - b.dataVencimento.getTime())[0]?.dataVencimento;
        return { valorTotalAberto, proximoVencimento };
    }, [faturasAbertas]);

    const handleViewDetails = (fatura: Fatura) => {
        setSelectedFatura(fatura);
        setIsDetailsOpen(true);
    };

    const handleDownload = () => {
        toast.info("A funcionalidade de download de fatura será implementada.");
    };

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (loading) {
        return <div>Carregando dados financeiros...</div>;
    }

    if (clientData?.modalidade !== 'faturado') {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Financeiro</CardTitle>
                    <CardDescription>Esta área é para clientes com modalidade faturada.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">Seu plano é pré-pago. Consulte seu saldo e extrato.</p>
                </CardContent>
            </Card>
        )
    }
    
    const renderActions = (fatura: Fatura) => (
        <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" title="Visualizar" onClick={() => handleViewDetails(fatura)}><Eye className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" title="Baixar PDF" onClick={handleDownload}><Download className="h-4 w-4" /></Button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Minhas Faturas</h1>
                <p className="text-muted-foreground">Acompanhe suas faturas abertas e o histórico de pagamentos.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Valor Total em Aberto</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metrics.valorTotalAberto > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(metrics.valorTotalAberto)}
                        </div>
                        <p className="text-xs text-muted-foreground">Soma de todas as faturas pendentes e vencidas.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Próximo Vencimento</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metrics.proximoVencimento ? format(metrics.proximoVencimento, 'dd/MM/yyyy') : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">Data de vencimento da fatura mais próxima.</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="abertas">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="abertas">Faturas em Aberto</TabsTrigger>
                    <TabsTrigger value="pagas">Faturas Pagas</TabsTrigger>
                </TabsList>
                <TabsContent value="abertas" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Faturas Pendentes e Vencidas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Desktop View */}
                            <div className="hidden md:block border rounded-lg">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Número</TableHead><TableHead>Período</TableHead><TableHead>Vencimento</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {faturasAbertas.map(f => (
                                            <TableRow key={f.id}>
                                                <TableCell className="font-medium">{f.numero}</TableCell>
                                                <TableCell>{format(f.dataEmissao, 'dd/MM/yy')} - {format(f.dataVencimento, 'dd/MM/yy')}</TableCell>
                                                <TableCell>{format(f.dataVencimento, 'dd/MM/yyyy')}</TableCell>
                                                <TableCell>{formatCurrency(f.valorTaxas)}</TableCell>
                                                <TableCell><Badge className={statusGeralConfig[f.statusGeral].badgeClass}>{statusGeralConfig[f.statusGeral].label}</Badge></TableCell>
                                                <TableCell className="text-right">{renderActions(f)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {faturasAbertas.length === 0 && <TableRow><TableCell colSpan={6} className="h-24 text-center">Nenhuma fatura em aberto.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Mobile View */}
                            <div className="grid gap-4 md:hidden">
                                {faturasAbertas.map(f => (
                                    <Card key={f.id}><CardHeader><div className="flex justify-between items-start"><CardTitle className="text-base">{f.numero}</CardTitle><Badge className={statusGeralConfig[f.statusGeral].badgeClass}>{statusGeralConfig[f.statusGeral].label}</Badge></div></CardHeader><CardContent className="space-y-2 text-sm"><div className="flex justify-between"><span>Vencimento:</span> <span className="font-medium">{format(f.dataVencimento, 'dd/MM/yyyy')}</span></div><div className="flex justify-between"><span>Valor:</span> <span className="font-bold">{formatCurrency(f.valorTaxas)}</span></div></CardContent><CardFooter className="flex justify-end">{renderActions(f)}</CardFooter></Card>
                                ))}
                                {faturasAbertas.length === 0 && <div className="text-center text-muted-foreground py-10">Nenhuma fatura em aberto.</div>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="pagas" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Faturas Pagas</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {/* Desktop View */}
                             <div className="hidden md:block border rounded-lg">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Número</TableHead><TableHead>Período</TableHead><TableHead>Data Pagamento</TableHead><TableHead>Valor</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {faturasPagas.map(f => (
                                            <TableRow key={f.id}>
                                                <TableCell className="font-medium">{f.numero}</TableCell>
                                                <TableCell>{format(f.dataEmissao, 'dd/MM/yy')} - {format(f.dataVencimento, 'dd/MM/yy')}</TableCell>
                                                <TableCell>{f.historico.find(h => h.acao === 'pagamento_taxa') ? format(new Date(f.historico.find(h => h.acao === 'pagamento_taxa')!.data), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                                <TableCell>{formatCurrency(f.valorTaxas)}</TableCell>
                                                <TableCell className="text-right">{renderActions(f)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {faturasPagas.length === 0 && <TableRow><TableCell colSpan={5} className="h-24 text-center">Nenhuma fatura paga.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Mobile View */}
                            <div className="grid gap-4 md:hidden">
                                {faturasPagas.map(f => (
                                    <Card key={f.id}><CardHeader><CardTitle className="text-base">{f.numero}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><div className="flex justify-between"><span>Data Pagamento:</span> <span className="font-medium">{f.historico.find(h => h.acao === 'pagamento_taxa') ? format(new Date(f.historico.find(h => h.acao === 'pagamento_taxa')!.data), 'dd/MM/yyyy') : 'N/A'}</span></div><div className="flex justify-between"><span>Valor:</span> <span className="font-bold">{formatCurrency(f.valorTaxas)}</span></div></CardContent><CardFooter className="flex justify-end">{renderActions(f)}</CardFooter></Card>
                                ))}
                                {faturasPagas.length === 0 && <div className="text-center text-muted-foreground py-10">Nenhuma fatura paga.</div>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            
            <FaturaDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                fatura={selectedFatura}
                onRegisterTaxPayment={() => {}}
                onRegisterRepassePayment={() => {}}
                onAddEntrega={() => {}}
                onUpdateEntrega={() => {}}
                onDeleteEntrega={() => {}}
                viewOnly={true}
            />
        </div>
    );
};

export default ClientFinanceiroPage;
