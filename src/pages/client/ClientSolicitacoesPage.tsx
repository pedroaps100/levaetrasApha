import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Search, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSolicitacoesData } from '@/hooks/useSolicitacoesData';
import { Solicitacao, SolicitacaoStatus } from '@/types';
import { format } from 'date-fns';
import { ViewSolicitacaoDialog } from '@/pages/solicitacoes/ViewSolicitacaoDialog';

const statusConfig: Record<SolicitacaoStatus, { label: string; badgeClass: string; icon: React.ElementType }> = {
    pendente: { label: 'Pendente', badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800', icon: Clock },
    aceita: { label: 'Aceita', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800', icon: CheckCircle },
    em_andamento: { label: 'Em Andamento', badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800', icon: Truck },
    concluida: { label: 'Concluída', badgeClass: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800', icon: CheckCircle },
    cancelada: { label: 'Cancelada', badgeClass: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600', icon: XCircle },
    rejeitada: { label: 'Rejeitada', badgeClass: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800', icon: XCircle },
};

const ClientSolicitacoesPage: React.FC = () => {
    const { clientData } = useAuth();
    const { solicitacoes, loading } = useSolicitacoesData();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<SolicitacaoStatus | 'todas'>('todas');
    const [solicitacaoToView, setSolicitacaoToView] = useState<Solicitacao | null>(null);

    const clientSolicitacoes = useMemo(() => {
        if (!clientData) return [];
        return solicitacoes
            .filter(s => s.clienteId === clientData.id)
            .filter(s => {
                const matchesStatus = statusFilter === 'todas' || s.status === statusFilter;
                const searchTermLower = searchTerm.toLowerCase();
                const matchesSearch = s.codigo.toLowerCase().includes(searchTermLower) || 
                                      s.entregadorNome?.toLowerCase().includes(searchTermLower) || false;
                return matchesStatus && matchesSearch;
            });
    }, [solicitacoes, clientData, searchTerm, statusFilter]);

    if (loading) {
        return <div>Carregando solicitações...</div>;
    }

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const renderActions = (solicitacao: Solicitacao) => (
        <Button variant="ghost" size="icon" title="Visualizar" onClick={() => setSolicitacaoToView(solicitacao)}>
            <Eye className="h-4 w-4" />
        </Button>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Minhas Solicitações</h1>
                <p className="text-muted-foreground">Acompanhe o histórico e o status de todas as suas solicitações.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative w-full md:flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar por código ou entregador..." 
                                className="pl-8 w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Filtrar por status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todas">Todos os Status</SelectItem>
                                {Object.entries(statusConfig).map(([key, { label }]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Desktop View */}
                    <div className="hidden md:block border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Solicitação</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Entregador</TableHead>
                                    <TableHead className="text-right">Taxa Entrega</TableHead>
                                    <TableHead className="text-right">Taxas Extras</TableHead>
                                    <TableHead className="text-right">Valor Total</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clientSolicitacoes.map(s => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-medium">{s.codigo}</TableCell>
                                        <TableCell>{format(new Date(s.dataSolicitacao), 'dd/MM/yyyy HH:mm')}</TableCell>
                                        <TableCell>
                                            <Badge className={statusConfig[s.status]?.badgeClass}>{statusConfig[s.status]?.label}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {s.entregadorNome ? (
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={s.entregadorAvatar} />
                                                        <AvatarFallback>{s.entregadorNome.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    {s.entregadorNome}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">Não atribuído</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrency(s.valorTotalTaxas)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(s.valorTotalTaxasExtras || 0)}</TableCell>
                                        <TableCell className="text-right font-bold">{formatCurrency((s.valorTotalTaxas || 0) + (s.valorTotalTaxasExtras || 0))}</TableCell>
                                        <TableCell className="text-right">{renderActions(s)}</TableCell>
                                    </TableRow>
                                ))}
                                {clientSolicitacoes.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center h-24">Nenhuma solicitação encontrada.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View */}
                    <div className="grid gap-4 md:hidden">
                        {clientSolicitacoes.map(s => (
                            <Card key={s.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base">{s.codigo}</CardTitle>
                                            <CardDescription>{format(new Date(s.dataSolicitacao), 'dd/MM/yyyy HH:mm')}</CardDescription>
                                        </div>
                                        <Badge className={statusConfig[s.status]?.badgeClass}>{statusConfig[s.status]?.label}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm">
                                        <span className="font-medium text-muted-foreground">Entregador: </span>
                                        {s.entregadorNome || 'Não atribuído'}
                                    </p>
                                    <div className="border-t pt-2 mt-2 space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Taxa de Entrega:</span>
                                            <span>{formatCurrency(s.valorTotalTaxas)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Taxas Extras:</span>
                                            <span>{formatCurrency(s.valorTotalTaxasExtras || 0)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold">
                                            <span>Valor Total:</span>
                                            <span>{formatCurrency((s.valorTotalTaxas || 0) + (s.valorTotalTaxasExtras || 0))}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end">
                                    {renderActions(s)}
                                </CardFooter>
                            </Card>
                        ))}
                        {clientSolicitacoes.length === 0 && (
                            <div className="text-center text-muted-foreground py-10">Nenhuma solicitação encontrada.</div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <ViewSolicitacaoDialog
                isOpen={!!solicitacaoToView}
                onClose={() => setSolicitacaoToView(null)}
                solicitacao={solicitacaoToView}
            />
        </div>
    );
};

export default ClientSolicitacoesPage;
