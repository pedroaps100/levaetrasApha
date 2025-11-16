import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Solicitacao } from '@/types';
import { Separator } from '@/components/ui/separator';
import { useSettingsData } from '@/hooks/useSettingsData';
import { Badge } from '@/components/ui/badge';

type SolicitacaoFormData = Omit<Solicitacao, 'id' | 'codigo' | 'dataSolicitacao' | 'status' | 'entregadorId' | 'entregadorNome' | 'entregadorAvatar'>;

interface SolicitacaoConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    solicitacaoData: SolicitacaoFormData | null;
    onConfirm: () => void;
}

export const SolicitacaoConfirmationDialog: React.FC<SolicitacaoConfirmationDialogProps> = ({ isOpen, onClose, solicitacaoData, onConfirm }) => {
    const { bairros, paymentMethods, taxasExtras } = useSettingsData();

    const formatCurrency = (value: number | undefined) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (!solicitacaoData) return null;

    const totalAReceber = (solicitacaoData.valorTotalTaxas || 0) + (solicitacaoData.valorTotalRepasse || 0) + (solicitacaoData.valorTotalTaxasExtras || 0);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Revisar Solicitação</DialogTitle>
                    <DialogDescription>
                        Confirme os detalhes da solicitação antes de criá-la.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto p-1 pr-4 space-y-4">
                    <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground">Tipo de Operação</p>
                        <p className="font-semibold">{solicitacaoData.operationDescription}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                        <p>{solicitacaoData.clienteNome}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            {solicitacaoData.tipoOperacao === 'coleta' ? 'Ponto de Coleta' : 'Ponto de Entrega Final'}
                        </p>
                        <p>{solicitacaoData.pontoColeta}</p>
                    </div>
                    <Separator />
                    <div>
                        <h4 className="font-semibold mb-2">Rotas</h4>
                        <div className="space-y-3">
                            {solicitacaoData.rotas.map((rota) => {
                                const bairro = bairros.find(b => b.id === rota.bairroDestinoId);
                                const taxasExtrasDaRota = taxasExtras.filter(te => rota.taxasExtrasIds?.includes(te.id));
                                const valorTaxasExtrasDaRota = taxasExtrasDaRota.reduce((sum, te) => sum + te.valor, 0);
                                const subtotalRota = (rota.taxaEntrega || 0) + (rota.valorExtra || 0) + valorTaxasExtrasDaRota;

                                return (
                                    <div key={rota.id} className="p-3 border rounded-lg space-y-2">
                                        <p className="font-semibold">Rota: {bairro?.nome}</p>
                                        <p className="text-sm"><span className="text-muted-foreground">Responsável:</span> {rota.responsavel}</p>
                                        <p className="text-sm"><span className="text-muted-foreground">Telefone:</span> {rota.telefone}</p>
                                        {rota.observacoes && <p className="text-sm"><span className="text-muted-foreground">Observações:</span> {rota.observacoes}</p>}
                                        <p className="text-sm"><span className="text-muted-foreground">Taxa:</span> {formatCurrency(rota.taxaEntrega)}</p>
                                        
                                        {taxasExtrasDaRota.length > 0 && (
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">Taxas Extras:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {taxasExtrasDaRota.map(te => (
                                                        <Badge key={te.id} variant="outline">{te.nome} ({formatCurrency(te.valor)})</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

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
                        <div className="flex justify-between"><span>Total Taxas de Entrega:</span><span>{formatCurrency(solicitacaoData.valorTotalTaxas)}</span></div>
                        {solicitacaoData.valorTotalTaxasExtras > 0 && <div className="flex justify-between"><span>Total Taxas Extras:</span><span>{formatCurrency(solicitacaoData.valorTotalTaxasExtras)}</span></div>}
                        <div className="flex justify-between"><span>Total Produtos (Repasse):</span><span>{formatCurrency(solicitacaoData.valorTotalRepasse)}</span></div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total a Receber do Cliente Final:</span><span>{formatCurrency(totalAReceber)}</span></div>
                     </div>
                </div>
                <DialogFooter className="pt-4 grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>Voltar e Editar</Button>
                    <Button type="button" onClick={onConfirm}>Confirmar Solicitação</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
