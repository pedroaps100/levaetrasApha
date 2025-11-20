import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Fatura, FaturaStatusGeral, FaturaStatusPagamento, FaturaStatusRepasse, EntregaIncluida } from '@/types';
import { format } from 'date-fns';
import { ArrowUp, ArrowDown, Printer, Mail, PlusCircle, CheckCircle, Eye, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RegistrarPagamentoTaxaModal } from './RegistrarPagamentoTaxaModal';
import { RegistrarPagamentoRepasseModal } from './RegistrarPagamentoRepasseModal';
import { HistoricoAcoesTab } from './HistoricoAcoesTab';
import { AdicionarEntregaModal, EntregaManualFormData } from './AdicionarEntregaModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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


const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="font-medium">{children}</div>
    </div>
);

interface FaturaDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    fatura: Fatura | null;
    onRegisterTaxPayment: (faturaId: string, detalhes: string) => void;
    onRegisterRepassePayment: (faturaId: string, detalhes: string) => void;
    onAddEntrega: (faturaId: string, data: EntregaManualFormData) => void;
    onUpdateEntrega: (faturaId: string, entregaId: string, data: Partial<EntregaManualFormData>) => void;
    onDeleteEntrega: (faturaId: string, entregaId: string) => void;
    viewOnly?: boolean;
}

export const FaturaDetailsModal: React.FC<FaturaDetailsModalProps> = ({ isOpen, onClose, fatura, onRegisterTaxPayment, onRegisterRepassePayment, onAddEntrega, onUpdateEntrega, onDeleteEntrega, viewOnly = false }) => {
  const [isTaxPaymentModalOpen, setIsTaxPaymentModalOpen] = useState(false);
  const [isRepassePaymentModalOpen, setIsRepassePaymentModalOpen] = useState(false);
  const [isEntregaModalOpen, setIsEntregaModalOpen] = useState(false);
  const [entregaToEdit, setEntregaToEdit] = useState<EntregaIncluida | null>(null);
  const [isEntregaViewOnly, setIsEntregaViewOnly] = useState(false);

  const faturaMemo = useMemo(() => fatura, [isOpen, fatura]);

  const { valorFinal, eRepasse, isQuitado } = useMemo(() => {
    if (!faturaMemo) return { valorFinal: 0, eRepasse: false, isQuitado: false };

    const repassePendente = faturaMemo.statusRepasse === 'Pendente' ? faturaMemo.valorRepasse : 0;
    const taxasPendentes = ['Pendente', 'Vencida'].includes(faturaMemo.statusTaxas) ? faturaMemo.valorTaxas : 0;
    
    const finalValue = repassePendente - taxasPendentes;
    
    const quitado = Math.abs(finalValue) < 0.01 && (faturaMemo.statusGeral === 'Finalizada' || (faturaMemo.statusTaxas === 'Paga' && faturaMemo.statusRepasse === 'Repassado'));

    return {
        valorFinal: finalValue,
        eRepasse: finalValue > 0,
        isQuitado: quitado
    };
  }, [faturaMemo]);

  if (!faturaMemo) return null;

  const formatCurrency = (value: number | undefined) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleTaxPaymentSuccess = (detalhes: string) => {
    onRegisterTaxPayment(faturaMemo.id, detalhes);
    setIsTaxPaymentModalOpen(false);
  };
  
  const handleRepassePaymentSuccess = (detalhes: string) => {
    onRegisterRepassePayment(faturaMemo.id, detalhes);
    setIsRepassePaymentModalOpen(false);
  };

  const handleOpenEntregaModal = (entrega: EntregaIncluida | null, viewOnlyModal: boolean) => {
    setEntregaToEdit(entrega);
    setIsEntregaViewOnly(viewOnly || viewOnlyModal);
    setIsEntregaModalOpen(true);
  };

  const handleEntregaSubmit = (faturaId: string, data: EntregaManualFormData, entregaId?: string) => {
    if (entregaId) {
        onUpdateEntrega(faturaId, entregaId, data);
    } else {
        onAddEntrega(faturaId, data);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-auto flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Detalhes da Fatura</DialogTitle>
            <DialogDescription>Fatura {faturaMemo.numero} - {faturaMemo.clienteNome}</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 px-6 py-4">
              <div className="lg:col-span-3 bg-muted/50 p-6 rounded-lg">
                <h3 className="font-semibold mb-4 text-base">Informações da Fatura</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 text-sm">
                  <DetailItem label="Número">{faturaMemo.numero}</DetailItem>
                  <DetailItem label="Cliente">{faturaMemo.clienteNome}</DetailItem>
                  <DetailItem label="Data de Emissão">{format(faturaMemo.dataEmissao, 'dd/MM/yyyy')}</DetailItem>
                  <DetailItem label="Data de Vencimento">{format(faturaMemo.dataVencimento, 'dd/MM/yyyy')}</DetailItem>
                  <DetailItem label="Tipo de Fechamento">{faturaMemo.tipoFaturamento}</DetailItem>
                  <DetailItem label="Status">
                    <Badge className={statusGeralConfig[faturaMemo.statusGeral].badgeClass}>{statusGeralConfig[faturaMemo.statusGeral].label}</Badge>
                  </DetailItem>
                  <div className="col-span-1 sm:col-span-2">
                    <DetailItem label="Observações">{faturaMemo.observacoes || 'Nenhuma observação.'}</DetailItem>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-muted/50 p-6 rounded-lg">
                <h3 className="font-semibold mb-4 text-base">Resumo Financeiro</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Taxas de Entrega</p>
                      <p className="font-semibold text-lg">{formatCurrency(faturaMemo.valorTaxas)}</p>
                    </div>
                    <Badge className={statusPagamentoConfig[faturaMemo.statusTaxas].badgeClass}>{statusPagamentoConfig[faturaMemo.statusTaxas].label}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Valores a Repassar</p>
                      <p className="font-semibold text-lg">{formatCurrency(faturaMemo.valorRepasse)}</p>
                    </div>
                    <Badge className={statusRepasseConfig[faturaMemo.statusRepasse].badgeClass}>{statusRepasseConfig[faturaMemo.statusRepasse].label}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Entregas</p>
                      <p className="font-semibold">{faturaMemo.totalEntregas}</p>
                    </div>
                    <div className="text-right">
                        {isQuitado ? (
                            <>
                                <p className="text-sm text-muted-foreground">Saldo Final</p>
                                <p className="font-bold text-xl flex items-center gap-1 justify-end text-green-600">
                                    <CheckCircle className="h-5 w-5" />
                                    {formatCurrency(0)}
                                </p>
                                <p className="text-xs text-muted-foreground">Fatura quitada</p>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground">{eRepasse ? 'A Repassar ao Cliente' : 'A Receber do Cliente'}</p>
                                <p className={`font-bold text-xl flex items-center gap-1 justify-end ${eRepasse ? 'text-green-600' : 'text-red-600'}`}>
                                    {eRepasse ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                                    {formatCurrency(Math.abs(valorFinal))}
                                </p>
                                <p className="text-xs text-muted-foreground">{eRepasse ? 'Você deve repassar' : 'Você deve receber'}</p>
                            </>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 flex-1 flex flex-col overflow-hidden">
                <Tabs defaultValue="entregas" className="flex-1 flex flex-col overflow-hidden">
                    <div className="w-full overflow-x-auto pb-2">
                        <TabsList className="bg-transparent p-0 justify-start border-b rounded-none w-full sm:w-auto inline-flex">
                            <TabsTrigger value="entregas" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent text-muted-foreground data-[state=active]:text-primary px-4">Entregas</TabsTrigger>
                            <TabsTrigger value="pagamentos" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent text-muted-foreground data-[state=active]:text-primary px-4">Pagamentos</TabsTrigger>
                            <TabsTrigger value="historico" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent text-muted-foreground data-[state=active]:text-primary px-4">Histórico</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="entregas" className="flex-1 overflow-y-auto mt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-base">Entregas Incluídas</h3>
                            {!viewOnly && <Button size="sm" onClick={() => handleOpenEntregaModal(null, false)}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Entrega Avulsa</Button>}
                        </div>
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader><TableRow><TableHead>Descrição</TableHead><TableHead>Data</TableHead><TableHead>Entregador</TableHead><TableHead>Taxa</TableHead><TableHead>Extras</TableHead><TableHead>Repasse</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {faturaMemo.entregas.map(e => (
                                        <TableRow key={e.id}>
                                            <TableCell>{e.descricao}</TableCell>
                                            <TableCell>{format(e.data, 'dd/MM/yyyy')}</TableCell>
                                            <TableCell>{e.entregadorNome || 'N/A'}</TableCell>
                                            <TableCell>{formatCurrency(e.taxaEntrega)}</TableCell>
                                            <TableCell>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span>{formatCurrency((e.taxasExtras || []).reduce((s, t) => s + t.valor, 0))}</span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {(e.taxasExtras || []).length > 0 ? (e.taxasExtras || []).map(te => <p key={te.nome}>{te.nome}: {formatCurrency(te.valor)}</p>) : <p>Sem taxas extras</p>}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                            <TableCell>{formatCurrency(e.valorRepasse)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenEntregaModal(e, true)}><Eye className="h-4 w-4" /></Button>
                                                {!viewOnly && (
                                                    <>
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenEntregaModal(e, false)}><Pencil className="h-4 w-4" /></Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Deseja remover a entrega "{e.descricao}" da fatura?</AlertDialogDescription></AlertDialogHeader>
                                                                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => onDeleteEntrega(faturaMemo.id, e.id)}>Remover</AlertDialogAction></AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                    <TabsContent value="pagamentos" className="flex-1 overflow-y-auto mt-4">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pagamento de Taxas</CardTitle>
                                    <CardDescription>Status do pagamento das taxas de entrega desta fatura.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Badge className={statusPagamentoConfig[faturaMemo.statusTaxas].badgeClass}>{statusPagamentoConfig[faturaMemo.statusTaxas].label}</Badge>
                                    <p className="text-sm text-muted-foreground mt-2">Valor: {formatCurrency(faturaMemo.valorTaxas)}</p>
                                </CardContent>
                                {!viewOnly && (
                                    <CardFooter>
                                        <Button disabled={faturaMemo.statusTaxas === 'Paga'} onClick={() => setIsTaxPaymentModalOpen(true)}>
                                            <PlusCircle className="mr-2 h-4 w-4" /> Lançar Pagamento de Taxas
                                        </Button>
                                    </CardFooter>
                                )}
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pagamento de Repasses</CardTitle>
                                    <CardDescription>Status do repasse dos valores coletados para o cliente.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Badge className={statusRepasseConfig[faturaMemo.statusRepasse].badgeClass}>{statusRepasseConfig[faturaMemo.statusRepasse].label}</Badge>
                                    <p className="text-sm text-muted-foreground mt-2">Valor: {formatCurrency(faturaMemo.valorRepasse)}</p>
                                </CardContent>
                                {!viewOnly && (
                                    <CardFooter>
                                        <Button disabled={faturaMemo.statusRepasse === 'Repassado' || faturaMemo.valorRepasse === 0} onClick={() => setIsRepassePaymentModalOpen(true)}>
                                            <PlusCircle className="mr-2 h-4 w-4" /> Lançar Pagamento de Repasse
                                        </Button>
                                    </CardFooter>
                                )}
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="historico" className="flex-1 overflow-y-auto mt-4">
                      <HistoricoAcoesTab historico={faturaMemo.historico} />
                    </TabsContent>
                </Tabs>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 p-6 bg-muted/50 border-t mt-4">
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 w-full">
                  <Button variant="ghost" onClick={onClose}>Fechar</Button>
                  <Button variant="outline" onClick={() => toast.info("Funcionalidade de impressão será implementada.")}><Printer className="mr-2 h-4 w-4" />Imprimir</Button>
                  {!viewOnly && (
                    <>
                        <Button variant="outline" onClick={() => toast.info("Funcionalidade de envio por e-mail será implementada.")}><Mail className="mr-2 h-4 w-4" />Enviar por E-mail</Button>
                        <Button onClick={() => toast.info("Funcionalidade de fechar fatura será implementada.")}>Fechar Fatura</Button>
                    </>
                  )}
              </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <RegistrarPagamentoTaxaModal
        isOpen={isTaxPaymentModalOpen}
        onClose={() => setIsTaxPaymentModalOpen(false)}
        fatura={faturaMemo}
        onSuccess={handleTaxPaymentSuccess}
      />
      <RegistrarPagamentoRepasseModal
        isOpen={isRepassePaymentModalOpen}
        onClose={() => setIsRepassePaymentModalOpen(false)}
        fatura={faturaMemo}
        onSuccess={handleRepassePaymentSuccess}
      />
      <AdicionarEntregaModal
        isOpen={isEntregaModalOpen}
        onClose={() => setIsEntregaModalOpen(false)}
        faturaId={faturaMemo.id}
        entregaToEdit={entregaToEdit}
        onFormSubmit={handleEntregaSubmit}
        viewOnly={isEntregaViewOnly}
      />
    </>
  );
};
