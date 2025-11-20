import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSolicitacoesData } from '@/hooks/useSolicitacoesData';
import { Solicitacao, SolicitacaoStatus } from '@/types';
import { PlusCircle, Wallet, FileText, Clock, CheckCircle, Truck, XCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { SolicitacaoFormDialog } from './SolicitacaoFormDialog';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ViewSolicitacaoDialog } from '@/pages/solicitacoes/ViewSolicitacaoDialog';

const statusConfig: Record<SolicitacaoStatus, { label: string; badgeClass: string; icon: React.ElementType }> = {
    pendente: { label: 'Pendente', badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    aceita: { label: 'Aceita', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
    em_andamento: { label: 'Em Andamento', badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Truck },
    concluida: { label: 'Concluída', badgeClass: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    cancelada: { label: 'Cancelada', badgeClass: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
    rejeitada: { label: 'Rejeitada', badgeClass: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

export const ClientDashboardPage: React.FC = () => {
    const { clientData } = useAuth();
    const { solicitacoes, addSolicitacao } = useSolicitacoesData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [solicitacaoToView, setSolicitacaoToView] = useState<Solicitacao | null>(null);

    const clientSolicitacoes = useMemo(() => {
        return solicitacoes.filter(s => s.clienteId === clientData?.id).slice(0, 5);
    }, [solicitacoes, clientData]);
    
    const handleFormSubmit = (data: Omit<Solicitacao, 'id' | 'codigo' | 'dataSolicitacao' | 'status'>) => {
        addSolicitacao(data, false); // false indicates it's not by an admin
        toast.success("Solicitação enviada com sucesso! Aguarde a confirmação.");
        setIsModalOpen(false);
    };

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <>
            <div className="grid flex-1 items-start gap-4 md:gap-8">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                    <Card className="sm:col-span-2 lg:col-span-1">
                        <CardHeader className="pb-3">
                            <CardTitle>Bem-vindo, {clientData?.nome}!</CardTitle>
                            <CardDescription className="max-w-lg text-balance leading-relaxed">
                                Pronto para sua próxima entrega? Solicite agora mesmo de forma rápida e fácil.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => setIsModalOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Solicitar Nova Entrega
                            </Button>
                        </CardContent>
                    </Card>
                    {clientData?.modalidade === 'pré-pago' ? (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
                                <Wallet className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{formatCurrency(532.50)}</div>
                                <p className="text-xs text-muted-foreground">Saldo disponível para novas corridas</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Fatura em Aberto</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{formatCurrency(875.90)}</div>
                                <p className="text-xs text-muted-foreground">Vencimento em 10/08/2025</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Entregas Recentes</CardTitle>
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
                                            <TableCell>{format(s.dataSolicitacao, 'dd/MM/yyyy HH:mm')}</TableCell>
                                            <TableCell><Badge className={statusConfig[s.status].badgeClass}>{statusConfig[s.status].label}</Badge></TableCell>
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
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => setSolicitacaoToView(s)}><Eye className="h-4 w-4"/></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {clientSolicitacoes.length === 0 && (
                                        <TableRow><TableCell colSpan={8} className="h-24 text-center">Nenhuma entrega recente.</TableCell></TableRow>
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
                                                <CardDescription>{format(s.dataSolicitacao, 'dd/MM/yy HH:mm')}</CardDescription>
                                            </div>
                                            <Badge className={statusConfig[s.status].badgeClass}>{statusConfig[s.status].label}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="text-sm space-y-3">
                                        <p><span className="font-medium text-muted-foreground">Entregador:</span> {s.entregadorNome || 'Não atribuído'}</p>
                                        <div className="border-t pt-2 mt-2 space-y-1">
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
                                        <Button variant="ghost" size="icon" onClick={() => setSolicitacaoToView(s)}><Eye className="h-4 w-4" /></Button>
                                    </CardFooter>
                                </Card>
                            ))}
                            {clientSolicitacoes.length === 0 && (
                                <div className="text-center text-muted-foreground py-10">Nenhuma entrega recente.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <SolicitacaoFormDialog 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onFormSubmit={handleFormSubmit}
                />
            </div>
            <ViewSolicitacaoDialog 
                isOpen={!!solicitacaoToView}
                onClose={() => setSolicitacaoToView(null)}
                solicitacao={solicitacaoToView}
            />
        </>
    );
};
