import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface JustificationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    action: 'cancelada' | 'rejeitada' | undefined;
    onConfirm: (justificativa: string) => void;
}

export const JustificationDialog: React.FC<JustificationDialogProps> = ({ isOpen, onClose, action, onConfirm }) => {
    const [justificativa, setJustificativa] = useState('');

    const handleConfirm = () => {
        if (justificativa.trim()) {
            onConfirm(justificativa);
            setJustificativa('');
        }
    };

    const title = action === 'cancelada' ? 'Cancelar Solicitação' : 'Rejeitar Solicitação';
    const description = `Por favor, insira o motivo para ${action === 'cancelada' ? 'o cancelamento' : 'a rejeição'} da solicitação.`;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="justificativa">Motivo</Label>
                    <Textarea
                        id="justificativa"
                        value={justificativa}
                        onChange={(e) => setJustificativa(e.target.value)}
                        placeholder="Ex: Endereço do cliente não encontrado, cliente ausente..."
                    />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Voltar</Button>
                    <Button
                        variant={action === 'cancelada' ? 'destructive' : 'default'}
                        onClick={handleConfirm}
                        disabled={!justificativa.trim()}
                    >
                        Confirmar {action === 'cancelada' ? 'Cancelamento' : 'Rejeição'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
