import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner";
import { Plus, Search, Trash2, Eye, FileText, Clock, TrendingUp, TrendingDown, MoreHorizontal, Download, Filter, RefreshCw } from 'lucide-react';
import { Fatura, FaturaStatusGeral, FaturaStatusPagamento, FaturaStatusRepasse } from '@/types';
import { useFaturasData } from '@/hooks/useFaturasData';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FaturaDetailsModal } from './FaturaDetailsModal';

const statusGeralConfig: Record<FaturaStatusGeral, { label: string; badgeClass: string; }> = {
    Aberta: { label: 'Aberta', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' },
    Fechada: { label: 'Fechada', badgeClass: 'bg-gray-100 text-gray-800 border-gray-200' },
    Paga: { label: 'Paga', badgeClass: 'bg-green-100 text-green-800 border-green-200' },
    Finalizada: { label: 'Finalizada', badgeClass: 'bg-purple-100 text-purple-800 border-purple-200' },
    Vencida: { label: 'Vencida', badgeClass: 'bg-red-100 text-red-700 border-red-200' },
};

const statusPagamentoConfig: Record<FaturaStatusPagamento, { label: string; badgeClass: string; }> = {
    Pendente: { label: 'Pendente', badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    Paga: { label: 'Paga', badgeClass: 'bg-green-100 text-green-800 border-green-200' },
    Vencida: { label: 'Vencida', badgeClass: 'bg-red-100 text-red-700 border-red-200' },
};

const statusRepasseConfig: Record<FaturaStatusRepasse, { label: string; badgeClass: string; }> = {
    Pendente: { label: 'Pendente', badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    Repassado: { label: 'Repassado', badgeClass: 'bg-teal-100 text-teal-800 border-teal-200' },
};

export const FaturasPage: React.FC = () => {
    const { faturas, loading, deleteFatura, registrarPagamentoTaxa, registrarPagamentoRepasse, addManualEntregaToFatura, updateManualEntregaInFatura, deleteManualEntregaFromFatura } = useFaturasData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedFatura, setSelectedFatura] = useState<Fatura | null>(null);

    useEffect(() => {
        if (selectedFatura && isDetailsOpen) {
            const updatedFatura = faturas.find(f => f.id === selectedFatura.id);
            if (updatedFatura) {
                setSelectedFatura(updatedFatura);
            }
        }
    }, [faturas, selectedFatura, isDetailsOpen]);

    const handleViewDetails = (fatura: Fatura) => {
        setSelectedFatura(fatura);
        setIsDetailsOpen(true);
    };

    const activeFaturas = useMemo(() => {
        return faturas.filter(f => f.statusGeral !== 'Finalizada');
    }, [faturas]);

    const filteredFaturas = useMemo(() => {
        return activeFaturas.filter(f => 
            f.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.numero.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [activeFaturas, searchTerm]);

    const metrics = useMemo(() => {
        const faturasEmAberto = activeFaturas.filter(f => f.statusGeral === 'Aberta' || f.statusGeral === 'Vencida');
        const vencidasCount = activeFaturas.filter(f => f.statusGeral === 'Vencida').length;
        const taxasPendentes = activeFaturas.filter(f => f.statusTaxas === 'Pendente' || f.statusTaxas === 'Vencida').reduce((sum, f) => sum + f.valorTaxas, 0);
        const repassesPendentes = activeFaturas.filter(f => f.statusRepasse === 'Pendente').reduce((sum, f) => sum + f.valorRepasse, 0);
        
        return {
            total: activeFaturas.length,
            emAberto: faturasEmAberto.length,
            vencidas: vencidasCount,
            taxasPendentes,
            repassesPendentes,
        };
    }, [activeFaturas]);

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const handleDelete = (id: string) => {
        deleteFatura(id);
        toast.success("Fatura removida com sucesso!");
    }

    const renderActions = (fatura: Fatura) => (
        <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" title="Visualizar" onClick={() => handleViewDetails(fatura)}><Eye className="h-4 w-4" /></Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>Marcar como Paga</DropdownMenuItem>
                    <DropdownMenuItem>Marcar como Repassada</DropdownMenuItem>
                    <DropdownMenuItem>Exportar PDF</DropdownMenuItem>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:bg-red-50 focus:text-red-600">
                                Excluir Fatura
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>Esta ação removerá permanentemente a fatura {fatura.numero}.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(fatura.id)}>Sim, excluir</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );

    if (loading) {
        return <div className="p-6 text-center">Carregando faturas...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Faturas</h1>
                <p className="text-muted-foreground">Controle e gerencie as faturas ativas dos seus clientes.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total de Faturas Ativas</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.total}</div><p className="text-xs text-muted-foreground">+8% vs. mês anterior</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Faturas em Aberto</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.emAberto}</div><p className="text-xs text-muted-foreground">{metrics.vencidas} vencidas</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Taxas Pendentes</CardTitle><TrendingDown className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(metrics.taxasPendentes)}</div><p className="text-xs text-muted-foreground">aguardando pagamento</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Repasses Pendentes</CardTitle><TrendingUp className="h-4 w-4 text-purple-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(metrics.repassesPendentes)}</div><p className="text-xs text-muted-foreground">valores a repassar</p></CardContent></Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative w-full md:flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar por número, cliente ou status..." className="pl-8 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <Button variant="outline" className="w-full md:w-auto gap-2" onClick={() => window.location.reload()}><RefreshCw className="h-4 w-4" />Recarregar</Button>
                        <Button variant="outline" className="w-full md:w-auto gap-2"><Filter className="h-4 w-4" />Filtros</Button>
                        <Button variant="outline" className="w-full md:w-auto gap-2"><Download className="h-4 w-4" />Exportar PDF</Button>
                        <Button className="w-full md:w-auto gap-2"><Plus className="h-4 w-4" />Ações</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Desktop View */}
                    <div className="hidden lg:block border rounded-lg">
                        <Table>
                            <TableHeader><TableRow><TableHead>Número</TableHead><TableHead>Cliente</TableHead><TableHead>Data Emissão</TableHead><TableHead>Data Vencimento</TableHead><TableHead>Valor Taxas</TableHead><TableHead>Valor Repasse</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {filteredFaturas.map(f => (
                                    <TableRow key={f.id}>
                                        <TableCell><div className="font-medium">{f.numero}</div><div className="text-sm text-muted-foreground">{f.tipoFaturamento}</div></TableCell>
                                        <TableCell><div className="font-medium">{f.clienteNome}</div><div className="text-sm text-muted-foreground">{f.totalEntregas} entregas</div></TableCell>
                                        <TableCell>{format(f.dataEmissao, 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>{format(f.dataVencimento, 'dd/MM/yyyy')}</TableCell>
                                        <TableCell><div>{formatCurrency(f.valorTaxas)}</div><Badge className={statusPagamentoConfig[f.statusTaxas].badgeClass}>{statusPagamentoConfig[f.statusTaxas].label}</Badge></TableCell>
                                        <TableCell><div>{formatCurrency(f.valorRepasse)}</div><Badge className={statusRepasseConfig[f.statusRepasse].badgeClass}>{statusRepasseConfig[f.statusRepasse].label}</Badge></TableCell>
                                        <TableCell><Badge className={statusGeralConfig[f.statusGeral].badgeClass}>{statusGeralConfig[f.statusGeral].label}</Badge></TableCell>
                                        <TableCell className="text-right">{renderActions(f)}</TableCell>
                                    </TableRow>
                                ))}
                                {filteredFaturas.length === 0 && <TableRow><TableCell colSpan={8} className="text-center h-24">Nenhuma fatura ativa encontrada.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile/Tablet View */}
                    <div className="grid gap-4 lg:hidden">
                        {filteredFaturas.map(f => (
                            <Card key={f.id} className="w-full">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{f.numero}</CardTitle>
                                        <Badge className={statusGeralConfig[f.statusGeral].badgeClass}>{statusGeralConfig[f.statusGeral].label}</Badge>
                                    </div>
                                    <CardDescription>{f.clienteNome} - {f.totalEntregas} entregas</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex justify-between"><span className="font-medium text-muted-foreground">Vencimento:</span><span>{format(f.dataVencimento, 'dd/MM/yyyy')}</span></div>
                                    <div className="flex justify-between items-center"><span className="font-medium text-muted-foreground">Taxas:</span><div className="text-right">{formatCurrency(f.valorTaxas)}<Badge className={`${statusPagamentoConfig[f.statusTaxas].badgeClass} ml-2`}>{statusPagamentoConfig[f.statusTaxas].label}</Badge></div></div>
                                    <div className="flex justify-between items-center"><span className="font-medium text-muted-foreground">Repasse:</span><div className="text-right">{formatCurrency(f.valorRepasse)}<Badge className={`${statusRepasseConfig[f.statusRepasse].badgeClass} ml-2`}>{statusRepasseConfig[f.statusRepasse].label}</Badge></div></div>
                                </CardContent>
                                <CardFooter className="flex justify-end">{renderActions(f)}</CardFooter>
                            </Card>
                        ))}
                        {filteredFaturas.length === 0 && <div className="text-center text-muted-foreground py-10">Nenhuma fatura ativa encontrada.</div>}
                    </div>
                </CardContent>
            </Card>
            <FaturaDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                fatura={selectedFatura}
                onRegisterTaxPayment={registrarPagamentoTaxa}
                onRegisterRepassePayment={registrarPagamentoRepasse}
                onAddEntrega={addManualEntregaToFatura}
                onUpdateEntrega={updateManualEntregaInFatura}
                onDeleteEntrega={deleteManualEntregaFromFatura}
            />
        </div>
    );
};
