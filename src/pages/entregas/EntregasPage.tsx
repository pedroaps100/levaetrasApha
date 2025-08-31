import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner";
import { PlusCircle, Search, Trash2, Pencil, Eye, Box, Clock, Truck, DollarSign, Download, MoreHorizontal } from 'lucide-react';
import { Solicitacao } from '@/types';
import { useSolicitacoesData } from '@/hooks/useSolicitacoesData';
import { format } from 'date-fns';
import { LaunchSolicitacaoDialog } from '../solicitacoes/LaunchSolicitacaoDialog';
import { ViewSolicitacaoDialog } from '../solicitacoes/ViewSolicitacaoDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const EntregasPage: React.FC = () => {
    const { solicitacoes, loading, addSolicitacao, updateSolicitacao, deleteSolicitacao } = useSolicitacoesData();
    const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
    const [solicitacaoToEdit, setSolicitacaoToEdit] = useState<Solicitacao | null>(null);
    const [solicitacaoToView, setSolicitacaoToView] = useState<Solicitacao | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const completedDeliveries = useMemo(() => {
        return solicitacoes.filter(s => s.status === 'concluida');
    }, [solicitacoes]);

    const filteredDeliveries = useMemo(() => {
        return completedDeliveries.filter(s => 
            s.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.entregadorNome?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [completedDeliveries, searchTerm]);

    const metrics = useMemo(() => {
        const totalEntregas = solicitacoes.length;
        const entregasHoje = solicitacoes.filter(s => format(s.dataSolicitacao, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length;
        const emRota = solicitacoes.filter(s => s.status === 'em_andamento').length;
        const receitaDoDia = solicitacoes
            .filter(s => s.status === 'concluida' && format(s.dataSolicitacao, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
            .reduce((acc, s) => acc + s.valorTotalTaxas, 0);

        return { totalEntregas, entregasHoje, emRota, receitaDoDia };
    }, [solicitacoes]);

    const handleOpenEdit = (solicitacao: Solicitacao) => {
        setSolicitacaoToEdit(solicitacao);
        setIsLaunchModalOpen(true);
    }
    
    const handleCloseLaunchModal = () => {
        setIsLaunchModalOpen(false);
        setSolicitacaoToEdit(null);
    }

    const handleDelete = (id: string) => {
        deleteSolicitacao(id);
        toast.success("Entrega removida com sucesso!");
    }

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const renderActions = (entrega: Solicitacao) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSolicitacaoToView(entrega)}><Eye className="mr-2 h-4 w-4" />Visualizar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenEdit(entrega)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:bg-red-50 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />Excluir
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>Esta ação removerá permanentemente o registro da entrega {entrega.codigo}.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(entrega.id)}>Sim, excluir</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    if (loading) {
        return <div className="p-6 text-center">Carregando entregas...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Entregas</h1>
                <p className="text-muted-foreground">Visualize e gerencie todas as entregas concluídas em um só lugar.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total de Entregas</CardTitle><Box className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.totalEntregas}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Entregas Hoje</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.entregasHoje}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Em Rota</CardTitle><Truck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{metrics.emRota}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Receita do Dia</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(metrics.receitaDoDia)}</div></CardContent></Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative w-full md:flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar por código, cliente ou entregador..." className="pl-8 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <Button variant="outline" className="w-full md:w-auto gap-2"><Download className="h-4 w-4" />Exportar PDF</Button>
                        <Button className="w-full md:w-auto gap-2" onClick={() => setIsLaunchModalOpen(true)}>
                            <PlusCircle className="h-4 w-4" />
                            Nova Entrega
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Desktop View */}
                    <div className="hidden lg:block border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Endereço de Entrega</TableHead>
                                    <TableHead>Entregador</TableHead>
                                    <TableHead>Taxa</TableHead>
                                    <TableHead>Valor do Produto</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDeliveries.map(s => (
                                    <TableRow key={s.id}>
                                        <TableCell>
                                            <div className="font-medium">{s.codigo}</div>
                                            <div className="text-sm text-muted-foreground">{format(s.dataSolicitacao, 'dd/MM/yyyy')}</div>
                                        </TableCell>
                                        <TableCell>{s.clienteNome}</TableCell>
                                        <TableCell>{s.rotas[0]?.responsavel} - {s.rotas[0] ? (solicitacoes.find(sol => sol.id === s.id)?.rotas[0]?.bairroDestinoId ? 'Bairro X' : 'Endereço não disponível') : 'N/A'}</TableCell>
                                        <TableCell>{s.entregadorNome}</TableCell>
                                        <TableCell>{formatCurrency(s.valorTotalTaxas)}</TableCell>
                                        <TableCell>{formatCurrency(s.valorTotalRepasse)}</TableCell>
                                        <TableCell><Badge className="bg-green-100 text-green-800 border-green-200">Finalizada</Badge></TableCell>
                                        <TableCell className="text-right">{renderActions(s)}</TableCell>
                                    </TableRow>
                                ))}
                                {filteredDeliveries.length === 0 && <TableRow><TableCell colSpan={8} className="text-center h-24">Nenhuma entrega concluída encontrada.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile/Tablet View */}
                    <div className="grid gap-4 lg:hidden">
                        {filteredDeliveries.map(s => (
                            <Card key={s.id} className="w-full">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{s.codigo}</CardTitle>
                                        <Badge className="bg-green-100 text-green-800 border-green-200">Finalizada</Badge>
                                    </div>
                                    <CardDescription>{s.clienteNome}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div><span className="font-medium text-muted-foreground">Entregador:</span> {s.entregadorNome}</div>
                                    <div><span className="font-medium text-muted-foreground">Taxa:</span> {formatCurrency(s.valorTotalTaxas)}</div>
                                    <div><span className="font-medium text-muted-foreground">Valor Produto:</span> {formatCurrency(s.valorTotalRepasse)}</div>
                                </CardContent>
                                <CardFooter className="flex justify-end">{renderActions(s)}</CardFooter>
                            </Card>
                        ))}
                        {filteredDeliveries.length === 0 && <div className="text-center text-muted-foreground py-10">Nenhuma entrega concluída encontrada.</div>}
                    </div>
                </CardContent>
            </Card>
            <LaunchSolicitacaoDialog 
                isOpen={isLaunchModalOpen} 
                onClose={handleCloseLaunchModal} 
                addSolicitacao={addSolicitacao}
                updateSolicitacao={updateSolicitacao}
                solicitacaoToEdit={solicitacaoToEdit}
            />
            <ViewSolicitacaoDialog
                isOpen={!!solicitacaoToView}
                onClose={() => setSolicitacaoToView(null)}
                solicitacao={solicitacaoToView}
            />
        </div>
    );
};
