import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Clock, CheckCircle, XCircle, Truck, Eye, HandCoins } from 'lucide-react';
import { useSolicitacoesData } from '@/hooks/useSolicitacoesData';
import { Solicitacao, SolicitacaoStatus, ConciliacaoData } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ViewSolicitacaoDialog } from '@/pages/solicitacoes/ViewSolicitacaoDialog';
import { ConciliacaoDialog } from '@/pages/solicitacoes/ConciliacaoDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useClientsData } from '@/hooks/useClientsData';
import { useSettingsData } from '@/hooks/useSettingsData';

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
    pendente: { label: 'Pendente', badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    aceita: { label: 'Aceita', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
    em_andamento: { label: 'Em Andamento', badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Truck },
    concluida: { label: 'Concluída', badgeClass: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    cancelada: { label: 'Cancelada', badgeClass: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
    rejeitada: { label: 'Rejeitada', badgeClass: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

const tabs: { value: SolicitacaoStatus | 'todas', label: string }[] = [
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluida', label: 'Concluídas' },
    { value: 'todas', label: 'Todas' },
];

export const DriverDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { solicitacoes, loading, updateStatusSolicitacao, updateConciliacao } = useSolicitacoesData();
    const { clients } = useClientsData();
    const { formasPagamentoConciliacao, taxasExtras } = useSettingsData();

    const [activeTab, setActiveTab] = useState<SolicitacaoStatus | 'todas'>('em_andamento');
    const [searchTerm, setSearchTerm] = useState('');
    const [solicitacaoToView, setSolicitacaoToView] = useState<Solicitacao | null>(null);
    const [solicitacaoToConciliate, setSolicitacaoToConciliate] = useState<Solicitacao | null>(null);

    const minhasSolicitacoes = useMemo(() => {
        if (!user) return [];
        return solicitacoes.filter(s => s.entregadorId === user.id);
    }, [solicitacoes, user]);

    const metrics = useMemo(() => {
        const statusCounts = minhasSolicitacoes.reduce((acc, s) => {
            acc[s.status] = (acc[s.status] || 0) + 1;
            return acc;
        }, {} as Record<SolicitacaoStatus, number>);
    
        return {
            emAndamento: statusCounts.em_andamento || 0,
            concluidasHoje: minhasSolicitacoes.filter(s => s.status === 'concluida' && format(s.dataSolicitacao, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length,
        };
    }, [minhasSolicitacoes]);

    const filteredSolicitacoes = useMemo(() => {
        return minhasSolicitacoes.filter(s => {
            const matchesTab = activeTab === 'todas' || s.status === activeTab;
            const matchesSearch = s.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) || s.codigo.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [minhasSolicitacoes, activeTab, searchTerm]);

    const handleConfirmConciliacao = (conciliacaoData: ConciliacaoData) => {
        if (solicitacaoToConciliate) {
            const cliente = clients.find(c => c.id === solicitacaoToConciliate.clienteId);
            
            if (!cliente) {
                toast.error("Erro ao finalizar: Dados do cliente não encontrados.");
                return;
            }

            if (solicitacaoToConciliate.status === 'em_andamento') {
                updateStatusSolicitacao(solicitacaoToConciliate.id, 'concluida', { cliente, conciliacao: conciliacaoData, formasPagamento: formasPagamentoConciliacao, taxasExtras });
                toast.success(`Entrega ${solicitacaoToConciliate.codigo} finalizada com sucesso!`);
            } else {
                updateConciliacao(solicitacaoToConciliate.id, conciliacaoData);
                toast.success(`Conciliação da entrega ${solicitacaoToConciliate.codigo} atualizada!`);
            }
            setSolicitacaoToConciliate(null);
        }
    };

    const renderActions = (solicitacao: Solicitacao) => {
        const actions: React.ReactNode[] = [];
        
        actions.push(<Button key="view" variant="ghost" size="icon" title="Visualizar" onClick={() => setSolicitacaoToView(solicitacao)}><Eye className="h-4 w-4" /></Button>);

        if (solicitacao.status === 'em_andamento') {
             actions.push(<Button key="complete" variant="ghost" size="icon" className="text-green-600" title="Finalizar Entrega" onClick={() => setSolicitacaoToConciliate(solicitacao)}><HandCoins className="h-4 w-4" /></Button>);
        }
        
        if (solicitacao.status === 'concluida') {
            actions.push(<Button key="conciliate" variant="ghost" size="icon" className="text-purple-600" title="Ver/Editar Conciliação" onClick={() => setSolicitacaoToConciliate(solicitacao)}><HandCoins className="h-4 w-4" /></Button>);
        }

        return <div className="flex items-center justify-end gap-1 flex-wrap">{actions}</div>;
    };

    if (loading) {
        return <div>Carregando entregas...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Minhas Entregas</h1>
                    <p className="text-muted-foreground">Gerencie suas entregas em andamento e concluídas.</p>
                </div>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <MetricCard title="Em Andamento" value={metrics.emAndamento} icon={Truck} colorClass="text-indigo-500" />
                <MetricCard title="Concluídas Hoje" value={metrics.concluidasHoje} icon={CheckCircle} colorClass="text-green-500" />
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="w-full md:w-auto">
                         <TabsList className="w-full grid grid-cols-3 md:inline-flex">
                            {tabs.map(tab => {
                                let count = 0;
                                if (tab.value === 'todas') {
                                    count = minhasSolicitacoes.length;
                                } else {
                                    count = minhasSolicitacoes.filter(s => s.status === tab.value).length;
                                }
                                
                                return (
                                    <TabsTrigger key={tab.value} value={tab.value} className="flex-shrink-0 flex items-center justify-center gap-2">
                                        {tab.label}
                                        {count > 0 && (
                                            <Badge variant="secondary" className="h-5 px-2 rounded-full">
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
                                                <TableCell className="text-center">{s.rotas.length}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className={statusConfig[s.status]?.badgeClass}>{statusConfig[s.status]?.label}</Badge>
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
                                                <Badge className={statusConfig[s.status]?.badgeClass}>{statusConfig[s.status]?.label}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-2">
                                            <p><span className="font-medium text-muted-foreground">Data:</span> {format(s.dataSolicitacao, 'dd/MM/yy HH:mm')}</p>
                                            <p><span className="font-medium text-muted-foreground">Rotas:</span> {s.rotas.length}</p>
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
            <ViewSolicitacaoDialog
                isOpen={!!solicitacaoToView}
                onClose={() => setSolicitacaoToView(null)}
                solicitacao={solicitacaoToView}
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
