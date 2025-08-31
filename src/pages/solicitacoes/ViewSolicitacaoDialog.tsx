import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Solicitacao } from '@/types';
import { Separator } from '@/components/ui/separator';
import { useSettingsData } from '@/hooks/useSettingsData';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface ViewSolicitacaoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    solicitacao: Solicitacao | null;
}

export const ViewSolicitacaoDialog: React.FC<ViewSolicitacaoDialogProps> = ({ isOpen, onClose, solicitacao }) => {
    const { bairros, paymentMethods } = useSettingsData();

    const formatCurrency = (value: number | undefined) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (!solicitacao) return null;

    const totalAReceber = solicitacao.valorTotalTaxas + solicitacao.valorTotalRepasse;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Detalhes da Solicitação {solicitacao.codigo}</DialogTitle>
                    <DialogDescription>
                        Visualização completa dos dados da solicitação.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto p-1 pr-4 space-y-4">
                    {solicitacao.justificativa && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-semibold text-yellow-800">
                                        Motivo do Cancelamento/Rejeição:
                                    </p>
                                    <p className="mt-1 text-sm text-yellow-700">
                                        {solicitacao.justificativa}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground">Tipo de Operação</p>
                        <p className="font-semibold">{solicitacao.operationDescription}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                        <p>{solicitacao.clienteNome}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            {solicitacao.tipoOperacao === 'coleta' ? 'Ponto de Coleta' : 'Ponto de Entrega Final'}
                        </p>
                        <p>{solicitacao.pontoColeta}</p>
                    </div>
                    <Separator />
                    <div>
                        <h4 className="font-semibold mb-2">Rotas</h4>
                        <div className="space-y-3">
                            {solicitacao.rotas.map((rota, index) => {
                                const bairro = bairros.find(b => b.id === rota.bairroDestinoId);
                                const subtotalRota = (rota.taxaEntrega || 0) + (rota.valorExtra || 0);
                                return (
                                    <div key={index} className="p-3 border rounded-lg space-y-2">
                                        <p className="font-semibold">Rota #{index + 1}: {bairro?.nome}</p>
                                        <p className="text-sm"><span className="text-muted-foreground">Responsável:</span> {rota.responsavel}</p>
                                        <p className="text-sm"><span className="text-muted-foreground">Telefone:</span> {rota.telefone}</p>
                                        {rota.observacoes && <p className="text-sm"><span className="text-muted-foreground">Observações:</span> {rota.observacoes}</p>}
                                        <p className="text-sm"><span className="text-muted-foreground">Taxa:</span> {formatCurrency(rota.taxaEntrega)}</p>
                                        {rota.receberDoCliente && (
                                            <div className="pt-2 border-t mt-2">
                                                <p className="text-sm font-semibold text-primary">Receber do Cliente Final</p>
                                                <p className="text-sm"><span className="text-muted-foreground">Valor Extra (p/ Loja):</span> {formatCurrency(rota.valorExtra)}</p>
                                                <p className="text-sm font-semibold"><span className="text-muted-foreground">Subtotal Rota:</span> {formatCurrency(subtotalRota)}</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    <span className="text-sm text-muted-foreground">Meios:</span>
                                                    {rota.meiosPagamentoAceitos?.map(id => {
                                                        const pm = paymentMethods.find(p => p.id === id);
                                                        return pm ? <Badge key={id} variant="secondary">{pm.name}</Badge> : null;
                                                    }) || <span className="text-sm">Nenhum</span>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                     <Separator />
                     <div className="space-y-2 pt-2">
                        <div className="flex justify-between"><span>Total Taxas de Entrega:</span><span>{formatCurrency(solicitacao.valorTotalTaxas)}</span></div>
                        <div className="flex justify-between"><span>Total Produtos (Repasse):</span><span>{formatCurrency(solicitacao.valorTotalRepasse)}</span></div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total a Receber do Cliente Final:</span><span>{formatCurrency(totalAReceber)}</span></div>
                     </div>
                </div>
                <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
