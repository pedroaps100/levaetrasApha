import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Solicitacao, Entregador } from '@/types';
import { Separator } from '@/components/ui/separator';

interface AcceptSolicitacaoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    solicitacao: Solicitacao | null;
    onConfirm: (entregador: Entregador) => void;
}

export const AcceptSolicitacaoDialog: React.FC<AcceptSolicitacaoDialogProps> = ({ isOpen, onClose, solicitacao, onConfirm }) => {
    
    const formatCurrency = (value: number | undefined) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (!solicitacao) return null;

    const handleConfirm = () => {
        // This is a placeholder. The real assignment happens in AssignDriverDialog
        console.log("Accepting solicitation, will open assignment dialog.");
        onClose(); // Close this dialog to open the next one in the parent
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Revisar Solicitação</DialogTitle>
                    <DialogDescription>
                        Revise os detalhes da solicitação {solicitacao.codigo} antes de aceitar.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto p-1 pr-4 space-y-4">
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
                     <div className="space-y-2 pt-2">
                        <div className="flex justify-between font-semibold"><span>Total Taxas de Entrega:</span><span>{formatCurrency(solicitacao.valorTotalTaxas)}</span></div>
                        <div className="flex justify-between font-semibold"><span>Total a Repassar:</span><span>{formatCurrency(solicitacao.valorTotalRepasse)}</span></div>
                     </div>
                </div>
                <DialogFooter className="pt-4 grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="button" onClick={handleConfirm}>Aceitar Solicitação</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
