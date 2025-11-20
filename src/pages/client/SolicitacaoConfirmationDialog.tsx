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

    const totalAPagar = (solicitacaoData.valorTotalTaxas || 0) + (solicitacaoData.valorTotalTaxasExtras || 0);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Revisar Solicitação</DialogTitle>
                    <DialogDescription>
                        Confirme os detalhes da sua solicitação antes de enviá-la.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto p-1 pr-4 space-y-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Ponto de Coleta</p>
                        <p>{solicitacaoData.pontoColeta}</p>
                    </div>
                    <Separator />
                    <div>
                        <h4 className="font-semibold mb-2">Rotas de Destino</h4>
                        <div className="space-y-3">
                            {solicitacaoData.rotas.map((rota, index) => {
                                const bairro = bairros.find(b => b.id === rota.bairroDestinoId);
                                const taxasExtrasDaRota = taxasExtras.filter(te => rota.taxasExtrasIds?.includes(te.id));
                                return (
                                    <div key={rota.id} className="p-3 border rounded-lg space-y-2">
                                        <p className="font-semibold">Rota #{index + 1}: {bairro?.nome}</p>
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
                                                <p className="text-sm"><span className="text-muted-foreground">Valor:</span> {formatCurrency(rota.valorAReceber)}</p>
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
                        <div className="flex justify-between"><span>Subtotal Taxas de Entrega:</span><span>{formatCurrency(solicitacaoData.valorTotalTaxas)}</span></div>
                        {solicitacaoData.valorTotalTaxasExtras > 0 && <div className="flex justify-between"><span>Subtotal Taxas Extras:</span><span>{formatCurrency(solicitacaoData.valorTotalTaxasExtras)}</span></div>}
                        {solicitacaoData.valorTotalRepasse > 0 && <div className="flex justify-between"><span>Valor Total dos Produtos (Repasse):</span><span>{formatCurrency(solicitacaoData.valorTotalRepasse)}</span></div>}
                        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total a Pagar:</span><span>{formatCurrency(totalAPagar)}</span></div>
                     </div>
                </div>
                <DialogFooter className="pt-4 grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>Voltar e Editar</Button>
                    <Button type="button" onClick={onConfirm}>Confirmar e Enviar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
