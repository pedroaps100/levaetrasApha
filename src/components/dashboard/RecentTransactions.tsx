import React, { useMemo, useState } from 'react';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSolicitacoesData } from '@/hooks/useSolicitacoesData';
import { Search, Download, DollarSign, FileText, Truck, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Solicitacao, SolicitacaoStatus, Fatura, Despesa } from '@/types';
import { useFaturasData } from '@/hooks/useFaturasData';
import { useFinanceiroData } from '@/hooks/useFinanceiroData';
import { ViewSolicitacaoDialog } from '@/pages/solicitacoes/ViewSolicitacaoDialog';

const statusConfig: Record<SolicitacaoStatus, { label: string; badgeClass: string; icon: React.ElementType }> = {
    pendente: { label: 'Pendente', badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800', icon: Clock },
    aceita: { label: 'Aceita', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800', icon: CheckCircle },
    em_andamento: { label: 'Em Andamento', badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800', icon: Truck },
    concluida: { label: 'Concluída', badgeClass: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800', icon: CheckCircle },
    cancelada: { label: 'Cancelada', badgeClass: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600', icon: XCircle },
    rejeitada: { label: 'Rejeitada', badgeClass: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800', icon: XCircle },
};

export function RecentTransactions() {
  const { despesas } = useFinanceiroData();
  const { faturas } = useFaturasData();
  const { solicitacoes } = useSolicitacoesData();
  const [activeTab, setActiveTab] = useState('contas');
  const [solicitacaoToView, setSolicitacaoToView] = useState<Solicitacao | null>(null);

  const contasAtrasadas = useMemo(() => despesas.filter(c => c.status === 'Atrasado'), [despesas]);
  const faturasVencidas = useMemo(() => faturas.filter(f => f.statusGeral === 'Vencida'), [faturas]);
  const entregasRecentes = useMemo(() => solicitacoes.slice(0, 5), [solicitacoes]);

  const getStatusBadgeContas = (status: Despesa['status']) => {
    switch (status) {
      case 'Atrasado': return <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800">Atrasado</Badge>;
      case 'Pendente': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800">Pendente</Badge>;
      case 'Pago': return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800">Pago</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusBadgeFaturas = (status: Fatura['statusGeral']) => {
    switch (status) {
        case 'Vencida': return <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800">Vencida</Badge>;
        case 'Aberta': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800">Aberta</Badge>;
        case 'Paga': return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800">Paga</Badge>;
        default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getVencimentoInfo = (vencimento: Date, status: string) => {
    const formattedDate = format(vencimento, 'dd/MM/yyyy');
    if (status === 'Atrasado' || status === 'Vencida') {
      const distance = formatDistanceToNowStrict(vencimento, { locale: ptBR, unit: 'day' });
      return <><p>{formattedDate}</p><p className="text-xs text-red-600">{distance} em atraso</p></>;
    }
    if (status === 'Pendente' || status === 'Aberta') {
      const distance = formatDistanceToNowStrict(vencimento, { locale: ptBR, addSuffix: true });
      return <><p>{formattedDate}</p><p className="text-xs text-muted-foreground">Vence {distance}</p></>;
    }
    return <p>{formattedDate}</p>;
  };

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="contas">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="grid w-full grid-cols-1 sm:w-auto sm:inline-flex sm:grid-cols-3">
            <TabsTrigger value="contas" className="gap-2">
                <DollarSign className="h-4 w-4"/>
                Contas a Pagar
                {contasAtrasadas.length > 0 && (
                    <Badge variant="secondary" className="h-5 px-2 rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                        {contasAtrasadas.length}
                    </Badge>
                )}
            </TabsTrigger>
            <TabsTrigger value="faturas" className="gap-2">
                <FileText className="h-4 w-4"/>
                Faturas Vencidas
                {faturasVencidas.length > 0 && (
                    <Badge variant="secondary" className="h-5 px-2 rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                        {faturasVencidas.length}
                    </Badge>
                )}
            </TabsTrigger>
            <TabsTrigger value="entregas" className="gap-2">
                <Truck className="h-4 w-4"/>
                Entregas Recentes
                {entregasRecentes.length > 0 && (
                    <Badge variant="secondary" className="h-5 px-2 rounded-full">
                        {entregasRecentes.length}
                    </Badge>
                )}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="contas">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full md:flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." className="pl-8 w-full" /></div>
                <Button variant="outline" className="w-full md:w-auto gap-2"><Download className="h-4 w-4" />Exportar</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="hidden lg:block"><Table><TableHeader><TableRow><TableHead>Fornecedor</TableHead><TableHead>Categoria</TableHead><TableHead>Vencimento</TableHead><TableHead className="text-right">Valor</TableHead><TableHead className="text-center">Status</TableHead></TableRow></TableHeader><TableBody>{contasAtrasadas.map((conta) => (<TableRow key={conta.id}><TableCell><div className="font-medium">{conta.fornecedor}</div><div className="text-sm text-muted-foreground">{conta.descricao}</div></TableCell><TableCell>{conta.categoria}</TableCell><TableCell>{getVencimentoInfo(conta.vencimento, conta.status)}</TableCell><TableCell className="text-right">{formatCurrency(conta.valor)}</TableCell><TableCell className="text-center">{getStatusBadgeContas(conta.status)}</TableCell></TableRow>))}</TableBody></Table></div>
              <div className="grid gap-4 lg:hidden p-4">{contasAtrasadas.map(conta => (<Card key={conta.id}><CardHeader><div className="flex justify-between items-start"><div><CardTitle className="text-base">{conta.fornecedor}</CardTitle><CardDescription>{conta.descricao}</CardDescription></div><div className="text-right"><p className="font-bold text-lg">{formatCurrency(conta.valor)}</p>{getStatusBadgeContas(conta.status)}</div></div></CardHeader><CardContent className="text-sm space-y-1"><div><span className="font-medium text-muted-foreground">Categoria:</span> {conta.categoria}</div><div><span className="font-medium text-muted-foreground">Vencimento:</span> {format(conta.vencimento, 'dd/MM/yyyy')}</div></CardContent></Card>))}</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faturas">
           <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full md:flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar por cliente..." className="pl-8 w-full" /></div>
                <Button variant="outline" className="w-full md:w-auto gap-2"><Download className="h-4 w-4" />Exportar</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="hidden lg:block"><Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Vencimento</TableHead><TableHead className="text-right">Valor</TableHead><TableHead className="text-center">Status</TableHead></TableRow></TableHeader><TableBody>{faturasVencidas.map((fatura) => (<TableRow key={fatura.id}><TableCell><div className="font-medium">{fatura.clienteNome}</div><div className="text-sm text-muted-foreground">{fatura.numero}</div></TableCell><TableCell>{getVencimentoInfo(fatura.dataVencimento, fatura.statusGeral)}</TableCell><TableCell className="text-right">{formatCurrency(fatura.valorTaxas)}</TableCell><TableCell className="text-center">{getStatusBadgeFaturas(fatura.statusGeral)}</TableCell></TableRow>))}</TableBody></Table></div>
              <div className="grid gap-4 lg:hidden p-4">{faturasVencidas.map(fatura => (<Card key={fatura.id}><CardHeader><div className="flex justify-between items-start"><div><CardTitle className="text-base">{fatura.clienteNome}</CardTitle><CardDescription>{fatura.numero}</CardDescription></div><div className="text-right"><p className="font-bold text-lg">{formatCurrency(fatura.valorTaxas)}</p>{getStatusBadgeFaturas(fatura.statusGeral)}</div></div></CardHeader><CardContent className="text-sm space-y-1"><div><span className="font-medium text-muted-foreground">Vencimento:</span> {format(fatura.dataVencimento, 'dd/MM/yyyy')}</div></CardContent></Card>))}</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entregas">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full md:flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar por código ou cliente..." className="pl-8 w-full" /></div>
                <Button variant="outline" className="w-full md:w-auto gap-2"><Download className="h-4 w-4" />Exportar</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Solicitação</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Entregador</TableHead>
                      <TableHead className="text-right">Taxa Entrega</TableHead>
                      <TableHead className="text-right">Taxas Extras</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entregasRecentes.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="font-medium">{s.codigo}</div>
                          <div className="text-sm text-muted-foreground">{s.clienteNome}</div>
                        </TableCell>
                        <TableCell>{format(s.dataSolicitacao, 'dd/MM/yyyy HH:mm')}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={statusConfig[s.status].badgeClass}>{statusConfig[s.status].label}</Badge>
                        </TableCell>
                        <TableCell>
                          {s.entregadorNome ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={s.entregadorAvatar} />
                                <AvatarFallback>{s.entregadorNome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <span className="truncate">{s.entregadorNome}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Não atribuído</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(s.valorTotalTaxas)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(s.valorTotalTaxasExtras || 0)}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency((s.valorTotalTaxas || 0) + (s.valorTotalTaxasExtras || 0))}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => setSolicitacaoToView(s)}><Eye className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="grid gap-4 lg:hidden p-4">
                {entregasRecentes.map(s => (
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
                        <CardContent className="text-sm space-y-3">
                            <p><span className="font-medium text-muted-foreground">Data:</span> {format(s.dataSolicitacao, 'dd/MM/yy HH:mm')}</p>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <ViewSolicitacaoDialog
        isOpen={!!solicitacaoToView}
        onClose={() => setSolicitacaoToView(null)}
        solicitacao={solicitacaoToView}
      />
    </>
  );
}
