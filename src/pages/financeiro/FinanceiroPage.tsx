import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from "sonner";
import { Plus, Search, Trash2, Eye, MoreHorizontal, Download, Filter, TrendingDown, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { Despesa } from '@/types';
import { useFinanceiroData } from '@/hooks/useFinanceiroData';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DespesaFormDialog } from './DespesaFormDialog';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, XAxis, YAxis, CartesianGrid } from 'recharts';

const statusConfig: Record<Despesa['status'], { label: string; badgeClass: string; }> = {
    Pendente: { label: 'Pendente', badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    Atrasado: { label: 'Atrasado', badgeClass: 'bg-red-100 text-red-700 border-red-200' },
    Pago: { label: 'Pago', badgeClass: 'bg-green-100 text-green-800 border-green-200' },
};

export const FinanceiroPage: React.FC = () => {
    const { despesas, receitas, loading, addDespesa, updateDespesa, deleteDespesa } = useFinanceiroData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [despesaToEdit, setDespesaToEdit] = useState<Despesa | null>(null);
    const [isViewOnly, setIsViewOnly] = useState(false);

    const handleOpenForm = (despesa: Despesa | null) => {
        setDespesaToEdit(despesa);
        setIsViewOnly(false);
        setIsFormOpen(true);
    };

    const handleOpenView = (despesa: Despesa) => {
        setDespesaToEdit(despesa);
        setIsViewOnly(true);
        setIsFormOpen(true);
    };

    const handleFormSubmit = (data: Omit<Despesa, 'id'>) => {
        if (despesaToEdit && !isViewOnly) {
            updateDespesa(despesaToEdit.id, data);
            toast.success("Despesa atualizada com sucesso!");
        } else {
            addDespesa(data);
            toast.success("Nova despesa adicionada com sucesso!");
        }
        setIsFormOpen(false);
    };

    const handleDelete = (id: string) => {
        deleteDespesa(id);
        toast.success("Despesa removida com sucesso!");
    };

    const filteredDespesas = useMemo(() => {
        return despesas.filter(d => 
            d.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.categoria.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [despesas, searchTerm]);

    const metrics = useMemo(() => {
        const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0);
        const despesasPendentes = despesas.filter(d => d.status === 'Pendente' || d.status === 'Atrasado').reduce((sum, d) => sum + d.valor, 0);
        const despesasPagas = despesas.filter(d => d.status === 'Pago').reduce((sum, d) => sum + d.valor, 0);
        const totalReceitas = receitas.reduce((sum, r) => sum + r.valor, 0);
        const atrasadasCount = despesas.filter(d => d.status === 'Atrasado').length;
        return { totalDespesas, despesasPendentes, despesasPagas, totalReceitas, atrasadasCount };
    }, [despesas, receitas]);

    const despesasPorCategoria = useMemo(() => {
        const grouped = despesas.reduce((acc, d) => {
            acc[d.categoria] = (acc[d.categoria] || 0) + d.valor;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    }, [despesas]);

    const fluxoDeCaixa = useMemo(() => {
        const dataMap: Record<string, { receitas: number, despesas: number }> = {};
        [...despesas, ...receitas].forEach(item => {
            const dateValue = 'vencimento' in item ? item.vencimento : item.dataRecebimento;
            if (!dateValue || isNaN(new Date(dateValue).getTime())) {
                return;
            }
            const dateKey = format(new Date(dateValue), 'yyyy-MM');
            if (!dataMap[dateKey]) dataMap[dateKey] = { receitas: 0, despesas: 0 };
            if ('vencimento' in item) dataMap[dateKey].despesas += item.valor;
            else dataMap[dateKey].receitas += item.valor;
        });
        return Object.entries(dataMap)
            .map(([dateKey, values]) => ({ 
                name: format(parse(dateKey, 'yyyy-MM', new Date()), 'MMM/yy', { locale: ptBR }), 
                ...values 
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [despesas, receitas]);

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const renderActions = (despesa: Despesa) => (
        <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" title="Visualizar" onClick={() => handleOpenView(despesa)}><Eye className="h-4 w-4" /></Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenForm(despesa)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem>Marcar como Paga</DropdownMenuItem>
                    <AlertDialog>
                        <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600">Excluir</DropdownMenuItem></AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Deseja remover a despesa "{despesa.descricao}"?</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(despesa.id)}>Remover</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
                <p className="text-muted-foreground">Gerenciamento de despesas, receitas e controle financeiro da empresa.</p>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total de Despesas</CardTitle><TrendingDown className="h-4 w-4 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(metrics.totalDespesas)}</div><p className="text-xs text-muted-foreground">+12% vs. mês anterior</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Despesas Pendentes</CardTitle><Clock className="h-4 w-4 text-yellow-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(metrics.despesasPendentes)}</div><p className="text-xs text-muted-foreground">{metrics.atrasadasCount} atrasada(s)</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Despesas Pagas</CardTitle><CheckCircle className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(metrics.despesasPagas)}</div><p className="text-xs text-muted-foreground">+8% no mês atual</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Receitas</CardTitle><TrendingUp className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(metrics.totalReceitas)}</div><p className="text-xs text-muted-foreground">+5% vs. mês anterior</p></CardContent></Card>
            </div>

            <Tabs defaultValue="despesas">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="w-full md:w-auto">
                        <TabsList className="w-full grid grid-cols-2 md:inline-flex"><TabsTrigger value="despesas">Despesas</TabsTrigger><TabsTrigger value="receitas">Receitas</TabsTrigger></TabsList>
                    </div>
                    <div className="relative w-full md:flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar despesas..." className="pl-8 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                    <div className="flex w-full md:w-auto flex-col sm:flex-row gap-2">
                        <Button variant="outline" className="w-full sm:w-auto gap-2"><Filter className="h-4 w-4" />Filtros</Button>
                        <Button variant="outline" className="w-full sm:w-auto gap-2"><Download className="h-4 w-4" />Exportar</Button>
                        <Button className="w-full sm:w-auto gap-2" onClick={() => handleOpenForm(null)}><Plus className="h-4 w-4" />Nova Despesa</Button>
                    </div>
                </div>
                <TabsContent value="despesas" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Lista de Despesas</CardTitle></CardHeader>
                        <CardContent>
                            {/* Desktop View */}
                            <div className="hidden lg:block"><Table><TableHeader><TableRow><TableHead>Descrição</TableHead><TableHead>Categoria</TableHead><TableHead>Fornecedor</TableHead><TableHead>Vencimento</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader><TableBody>{filteredDespesas.map(d => (<TableRow key={d.id}><TableCell>{d.descricao}</TableCell><TableCell>{d.categoria}</TableCell><TableCell>{d.fornecedor}</TableCell><TableCell>{format(d.vencimento, 'dd/MM/yyyy')}</TableCell><TableCell>{formatCurrency(d.valor)}</TableCell><TableCell><Badge className={statusConfig[d.status].badgeClass}>{statusConfig[d.status].label}</Badge></TableCell><TableCell className="text-right">{renderActions(d)}</TableCell></TableRow>))}{filteredDespesas.length === 0 && <TableRow><TableCell colSpan={7} className="text-center h-24">Nenhuma despesa encontrada.</TableCell></TableRow>}</TableBody></Table></div>
                            {/* Mobile/Tablet View */}
                            <div className="grid gap-4 lg:hidden">{filteredDespesas.map(d => (<Card key={d.id}><CardHeader><div className="flex justify-between items-start"><div><CardTitle className="text-base break-words">{d.descricao}</CardTitle><CardDescription className="break-words">{d.fornecedor}</CardDescription></div><Badge className={statusConfig[d.status].badgeClass}>{statusConfig[d.status].label}</Badge></div></CardHeader><CardContent className="space-y-2 text-sm"><div><span className="font-medium text-muted-foreground">Valor:</span> {formatCurrency(d.valor)}</div><div><span className="font-medium text-muted-foreground">Vencimento:</span> {format(d.vencimento, 'dd/MM/yyyy')}</div></CardContent><CardFooter className="flex justify-end flex-wrap gap-1">{renderActions(d)}</CardFooter></Card>))}{filteredDespesas.length === 0 && <div className="text-center text-muted-foreground py-10">Nenhuma despesa encontrada.</div>}</div>
                        </CardContent>
                    </Card>
                    <div className="grid gap-6 mt-6 md:grid-cols-2">
                        <Card>
                            <CardHeader><CardTitle>Despesas por Categoria</CardTitle></CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={despesasPorCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#1E37B5">
                                            {despesasPorCategoria.map((_, index) => <Cell key={`cell-${index}`} fill={['#1E37B5', '#4A5CC9', '#7D8DE3', '#AAB3F0', '#D4D9F9'][index % 5]} />)}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Fluxo de Caixa (Últimos Meses)</CardTitle></CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={fluxoDeCaixa}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" fontSize={12} />
                                        <YAxis tickFormatter={(value) => formatCurrency(value as number)} fontSize={12} />
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend />
                                        <Bar dataKey="receitas" fill="#22C55E" name="Receitas" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="despesas" fill="#EF4444" name="Despesas" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="receitas" className="mt-4"><div className="text-center p-10 text-muted-foreground">A aba de Receitas será implementada na próxima fase.</div></TabsContent>
            </Tabs>
            <DespesaFormDialog 
                open={isFormOpen} 
                onOpenChange={setIsFormOpen} 
                despesaToEdit={despesaToEdit} 
                onFormSubmit={handleFormSubmit}
                viewOnly={isViewOnly}
            />
        </div>
    );
};
