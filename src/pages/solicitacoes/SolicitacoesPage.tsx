import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Search, Clock, CheckCircle, XCircle, Truck, Timer, Eye, Check, X, Pencil, Play, Download, MoreHorizontal, HandCoins } from 'lucide-react';
import { useSolicitacoesData } from '@/hooks/useSolicitacoesData';
import { Solicitacao, SolicitacaoStatus, Entregador, Cliente, ConciliacaoData, FormaPagamentoConciliacao } from '@/types';
import { format, isWithinInterval } from 'date-fns';
import { toast } from 'sonner';
import { LaunchSolicitacaoDialog } from './LaunchSolicitacaoDialog';
import { useNotification } from '@/contexts/NotificationContext';
import { ViewSolicitacaoDialog } from './ViewSolicitacaoDialog';
import { JustificationDialog } from './JustificationDialog';
import { AssignDriverDialog } from './AssignDriverDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { exportToPDF, exportToExcel } from '@/lib/exportUtils';
import { useClientsData } from '@/hooks/useClientsData';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { ConciliacaoDialog } from './ConciliacaoDialog';
import { useSettingsData } from '@/hooks/useSettingsData';
import { cn } from '@/lib/utils';


const MetricCard: React.FC<{ title: string; value: number | string; icon: React.ElementType; colorClass: string }> = ({ title, value, icon: Icon, colorClass }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-5 w-5 text-muted-foreground ${colorClass}`} />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const statusConfig: Record<SolicitacaoStatus, { label: string; badgeClass: string; icon: React.ElementType }> = {
    pendente: { label: 'Pendente', badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800', icon: Clock },
    aceita: { label: 'Aceita', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800', icon: CheckCircle },
    em_andamento: { label: 'Em Andamento', badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800', icon: Truck },
    concluida: { label: 'Concluída', badgeClass: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800', icon: CheckCircle },
    cancelada: { label: 'Cancelada', badgeClass: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600', icon: XCircle },
    rejeitada: { label: 'Rejeitada', badgeClass: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800', icon: XCircle },
};

const tabs: { value: SolicitacaoStatus | 'todas', label: string }[] = [
    { value: 'todas', label: 'Todas' },
    { value: 'pendente', label: 'Pendentes' },
    { value: 'aceita', label: 'Aceitas' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluida', label: 'Concluídas' },
];

export const SolicitacoesPage: React.FC = () => {
    const { solicitacoes, loading, addSolicitacao, updateSolicitacao, updateStatusSolicitacao, deleteSolicitacao, updateConciliacao } = useSolicitacoesData();
    const { clients } = useClientsData();
    const { formasPagamentoConciliacao, taxasExtras } = useSettingsData();
    const { clearSolicitacoesNotifications } = useNotification();
    const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<SolicitacaoStatus | 'todas'>('aceita');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [solicitacaoToView, setSolicitacaoToView] = useState<Solicitacao | null>(null);
    const [solicitacaoToEdit, setSolicitacaoToEdit] = useState<Solicitacao | null>(null);
    const [solicitacaoToAssign, setSolicitacaoToAssign] = useState<Solicitacao | null>(null);
    const [solicitacaoToConciliate, setSolicitacaoToConciliate] = useState<Solicitacao | null>(null);
    const [justificationInfo, setJustificationInfo] = useState<{ solicitacao: Solicitacao; action: 'cancelada' | 'rejeitada' } | null>(null);

    useEffect(() => {
        clearSolicitacoesNotifications();
    }, [clearSolicitacoesNotifications]);

    const metrics = useMemo(() => {
        const statusCounts = solicitacoes.reduce((acc, s) => {
            acc[s.status] = (acc[s.status] || 0) + 1;
            return acc;
        }, {} as Record<SolicitacaoStatus, number>);
    
        return {
            pendentes: statusCounts.pendente || 0,
            aceitas: statusCounts.aceita || 0,
            emAndamento: statusCounts.em_andamento || 0,
            concluidas: statusCounts.concluida || 0,
            tempoMedio: '15m', // Static value for now
        };
    }, [solicitacoes]);

    const filteredSolicitacoes = useMemo(() => {
        return solicitacoes.filter(s => {
            const matchesTab = activeTab === 'todas' || s.status === activeTab;
            const matchesSearch = s.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) || s.codigo.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDate = !dateRange || (dateRange.from && dateRange.to && isWithinInterval(s.dataSolicitacao, { start: dateRange.from, end: dateRange.to }));
            return matchesTab && matchesSearch && matchesDate;
        });
    }, [solicitacoes, activeTab, searchTerm, dateRange]);

    const handleUpdateStatus = (id: string, newStatus: SolicitacaoStatus, message: string, details?: { justificativa?: string; entregador?: Entregador; }) => {
        const solicitacao = solicitacoes.find(s => s.id === id);
        if (solicitacao) {
            updateStatusSolicitacao(id, newStatus, { ...details });
            toast.success(message);
        }
    };
    
    const handleAssignAndStart = (entregador: Entregador) => {
        if (solicitacaoToAssign) {
            handleUpdateStatus(solicitacaoToAssign.id, 'em_andamento', 'Corrida iniciada e atribuída!', { entregador });
            setSolicitacaoToAssign(null);
        }
    };

    const handleConfirmConciliacao = (conciliacaoData: ConciliacaoData) => {
        if (solicitacaoToConciliate) {
            const cliente = clients.find(c => c.id === solicitacaoToConciliate.clienteId);
            
            if (!cliente) {
                toast.error("Erro ao finalizar: Dados do cliente não encontrados.");
                return;
            }

            if (solicitacaoToConciliate.status === 'em_andamento') {
                updateStatusSolicitacao(solicitacaoToConciliate.id, 'concluida', { cliente, conciliacao: conciliacaoData, formasPagamento: formasPagamentoConciliacao, taxasExtras });
                toast.success(`Solicitação ${solicitacaoToConciliate.codigo} conciliada e finalizada!`);
            } else {
                updateConciliacao(solicitacaoToConciliate.id, conciliacaoData);
                toast.success(`Conciliação da solicitação ${solicitacaoToConciliate.codigo} atualizada!`);
            }
            setSolicitacaoToConciliate(null);
        }
    };

    const handleOpenEdit = (solicitacao: Solicitacao) => {
        setSolicitacaoToEdit(solicitacao);
        setIsLaunchModalOpen(true);
    }
    
    const handleCloseLaunchModal = () => {
        setIsLaunchModalOpen(false);
        setSolicitacaoToEdit(null);
    }

    const handleExportPDF = () => {
        const columns = [
            { header: 'Código', dataKey: 'codigo' },
            { header: 'Cliente', dataKey: 'clienteNome' },
            { header: 'Entregador', dataKey: 'entregadorNome' },
            { header: 'Status', dataKey: 'status' },
            { header: 'Data', dataKey: 'dataSolicitacao' },
        ];
        exportToPDF(columns, filteredSolicitacoes, 'Relatório de Solicitações', 'solicitacoes');
    };

    const handleExportExcel = () => {
        const dataToExport = filteredSolicitacoes.map(s => ({
            Código: s.codigo,
            Cliente: s.clienteNome,
            Entregador: s.entregadorNome || 'N/A',
            Status: statusConfig[s.status].label,
            Data: format(s.dataSolicitacao, 'dd/MM/yyyy HH:mm'),
            'Nº de Rotas': s.rotas.length,
            'Valor Taxas': s.valorTotalTaxas,
            'Valor Repasse': s.valorTotalRepasse,
        }));
        exportToExcel(dataToExport, 'solicitacoes');
    };

    const renderActions = (solicitacao: Solicitacao) => {
        const actions: React.ReactNode[] = [];
        
        actions.push(<Button key="view" variant="ghost" size="icon" title="Visualizar" onClick={() => setSolicitacaoToView(solicitacao)}><Eye className="h-4 w-4" /></Button>);

        switch (solicitacao.status) {
            case 'pendente':
                actions.push(<Button key="accept" variant="ghost" size="icon" className="text-green-600" title="Aceitar" onClick={() => setSolicitacaoToAssign(solicitacao)}><Check className="h-4 w-4" /></Button>);
                actions.push(<Button key="reject" variant="ghost" size="icon" className="text-red-600" title="Rejeitar" onClick={() => setJustificationInfo({ solicitacao, action: 'rejeitada' })}><X className="h-4 w-4" /></Button>);
                break;
            case 'aceita':
                actions.push(<Button key="start" variant="ghost" size="icon" className="text-blue-600" title="Iniciar Corrida" onClick={() => setSolicitacaoToAssign(solicitacao)}><Play className="h-4 w-4" /></Button>);
                actions.push(<Button key="edit" variant="ghost" size="icon" title="Editar" onClick={() => handleOpenEdit(solicitacao)}><Pencil className="h-4 w-4" /></Button>);
                break;
            case 'em_andamento':
                 actions.push(<Button key="complete" variant="ghost" size="icon" className="text-green-600" title="Finalizar" onClick={() => setSolicitacaoToConciliate(solicitacao)}><CheckCircle className="h-4 w-4" /></Button>);
                break;
            case 'concluida':
                actions.push(<Button key="conciliate" variant="ghost" size="icon" className="text-purple-600" title="Ver/Editar Conciliação" onClick={() => setSolicitacaoToConciliate(solicitacao)}><HandCoins className="h-4 w-4" /></Button>);
                break;
        }

        if (['pendente', 'aceita', 'em_andamento'].includes(solicitacao.status)) {
            actions.push(
                <AlertDialog key="cancel-dialog">
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-600" title="Cancelar"><XCircle className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Confirmar Cancelamento</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja cancelar a solicitação {solicitacao.codigo}?</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Voltar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => setJustificationInfo({ solicitacao, action: 'cancelada' })}>Sim, Cancelar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            );
        }

        return <div className="flex items-center justify-end gap-1 flex-wrap">{actions}</div>;
    };

    if (loading) {
        return <div>Carregando solicitações...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Central de Solicitações</h1>
                    <p className="text-muted-foreground">Visualize e gerencie todas as solicitações de entrega.</p>
                </div>
                <Button onClick={() => setIsLaunchModalOpen(true)} className="w-full sm:w-auto flex-shrink-0"><PlusCircle className="mr-2 h-4 w-4" /> Nova Solicitação</Button>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <MetricCard title="Pendentes" value={metrics.pendentes} icon={Clock} colorClass="text-yellow-500" />
                <MetricCard title="Aceitas" value={metrics.aceitas} icon={CheckCircle} colorClass="text-blue-500" />
                <MetricCard title="Em Andamento" value={metrics.emAndamento} icon={Truck} colorClass="text-indigo-500" />
                <MetricCard title="Concluídas" value={metrics.concluidas} icon={CheckCircle} colorClass="text-green-500" />
                <MetricCard title="Tempo Médio" value={metrics.tempoMedio} icon={Timer} colorClass="text-gray-500" />
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="w-full md:w-auto">
                        <div className="md:hidden">
                            <Select value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tabs.map(tab => (
                                        <SelectItem key={tab.value} value={tab.value}>{tab.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <TabsList className="hidden md:inline-flex">
                            {tabs.map(tab => {
                                let count = 0;
                                switch (tab.value) {
                                    case 'todas': count = solicitacoes.length; break;
                                    case 'pendente': count = metrics.pendentes; break;
                                    case 'aceita': count = metrics.aceitas; break;
                                    case 'em_andamento': count = metrics.emAndamento; break;
                                    case 'concluida': count = metrics.concluidas; break;
                                }
                                
                                return (
                                    <TabsTrigger key={tab.value} value={tab.value} className="flex-shrink-0 flex items-center justify-center gap-2">
                                        {tab.label}
                                        {count > 0 && (
                                            <Badge className={cn(
                                                "h-5 px-2 rounded-full border-transparent",
                                                tab.value === 'pendente' && count > 0
                                                    ? "bg-orange-100 text-orange-800 hover:bg-orange-100/80 dark:bg-orange-900/50 dark:text-orange-300"
                                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                            )}>
                                                {count}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </div>
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por cliente ou código..." className="pl-8 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                     <DatePickerWithRange onDateChange={setDateRange} />
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full md:w-auto gap-2"><Download className="h-4 w-4" />Exportar</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={handleExportPDF}>Exportar para PDF</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportExcel}>Exportar para Excel</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <TabsContent value={activeTab} className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            {/* Desktop View */}
                            <div className="hidden lg:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Solicitação</TableHead>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Entregador</TableHead>
                                            <TableHead className="text-center">Nº de Rotas</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSolicitacoes.map(s => (
                                            <TableRow key={s.id}>
                                                <TableCell>
                                                    <div className="font-medium">{s.codigo}</div>
                                                    <div className="text-sm text-muted-foreground">{format(s.dataSolicitacao, 'dd/MM/yyyy HH:mm')}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8"><AvatarImage src={s.clienteAvatar} /><AvatarFallback>{s.clienteNome.charAt(0)}</AvatarFallback></Avatar>
                                                        {s.clienteNome}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{s.entregadorNome || <span className="text-muted-foreground">Não atribuído</span>}</TableCell>
                                                <TableCell className="text-center">{s.rotas.length}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className={statusConfig[s.status].badgeClass}>{statusConfig[s.status].label}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">{renderActions(s)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Mobile/Tablet View */}
                            <div className="grid gap-4 lg:hidden p-4">
                                {filteredSolicitacoes.map(s => (
                                    <Card key={s.id}>
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-base">{s.codigo}</CardTitle>
                                                    <CardDescription className="break-words">{s.clienteNome}</CardDescription>
                                                </div>
                                                <Badge className={statusConfig[s.status].badgeClass}>{statusConfig[s.status].label}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-2">
                                            <p><span className="font-medium text-muted-foreground">Data:</span> {format(s.dataSolicitacao, 'dd/MM/yy HH:mm')}</p>
                                            <p><span className="font-medium text-muted-foreground">Rotas:</span> {s.rotas.length}</p>
                                            <p><span className="font-medium text-muted-foreground">Entregador:</span> {s.entregadorNome || 'Não atribuído'}</p>
                                        </CardContent>
                                        <CardFooter className="flex justify-end flex-wrap gap-1">
                                            {renderActions(s)}
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                            {filteredSolicitacoes.length === 0 && <div className="text-center p-10 text-muted-foreground">Nenhuma solicitação encontrada.</div>}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <LaunchSolicitacaoDialog 
                isOpen={isLaunchModalOpen} 
                onClose={handleCloseLaunchModal} 
                addSolicitacao={addSolicitacao}
                updateSolicitacao={updateSolicitacao}
                solicitacaoToEdit={solicitacaoToEdit}
            />
            <AssignDriverDialog
                isOpen={!!solicitacaoToAssign}
                onClose={() => setSolicitacaoToAssign(null)}
                solicitacao={solicitacaoToAssign}
                onConfirm={handleAssignAndStart}
            />
            <ViewSolicitacaoDialog
                isOpen={!!solicitacaoToView}
                onClose={() => setSolicitacaoToView(null)}
                solicitacao={solicitacaoToView}
            />
            <JustificationDialog
                isOpen={!!justificationInfo}
                onClose={() => setJustificationInfo(null)}
                action={justificationInfo?.action}
                onConfirm={(justificativa) => {
                    if (justificationInfo) {
                        const { solicitacao, action } = justificationInfo;
                        const message = action === 'cancelada' ? 'Solicitação cancelada.' : 'Solicitação rejeitada.';
                        handleUpdateStatus(solicitacao.id, action, message, { justificativa });
                        setJustificationInfo(null);
                    }
                }}
            />
            <ConciliacaoDialog
                isOpen={!!solicitacaoToConciliate}
                onClose={() => setSolicitacaoToConciliate(null)}
                solicitacao={solicitacaoToConciliate}
                onConfirm={handleConfirmConciliacao}
            />
        </div>
    );
};
