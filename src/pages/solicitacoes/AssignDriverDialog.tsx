import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Solicitacao, Entregador } from '@/types';
import { useEntregadoresData } from '@/hooks/useEntregadoresData';
import { useSolicitacoesData } from '@/hooks/useSolicitacoesData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface AssignDriverDialogProps {
    isOpen: boolean;
    onClose: () => void;
    solicitacao: Solicitacao | null;
    onConfirm: (entregador: Entregador) => void;
}

export const AssignDriverDialog: React.FC<AssignDriverDialogProps> = ({ isOpen, onClose, solicitacao, onConfirm }) => {
    const { entregadores } = useEntregadoresData();
    const { solicitacoes } = useSolicitacoesData();
    const [selectedEntregadorId, setSelectedEntregadorId] = useState<string>('');

    const entregadoresComCarga = useMemo(() => {
        const activeEntregadores = entregadores.filter(e => e.status === 'ativo');
        const inProgressCounts = solicitacoes.reduce((acc, s) => {
            if (s.status === 'em_andamento' && s.entregadorId) {
                acc[s.entregadorId] = (acc[s.entregadorId] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return activeEntregadores.map(e => ({
            ...e,
            cargaAtual: inProgressCounts[e.id] || 0,
        }));
    }, [entregadores, solicitacoes]);

    if (!solicitacao) return null;

    const handleConfirm = () => {
        const entregador = entregadores.find(e => e.id === selectedEntregadorId);
        if (entregador) {
            onConfirm(entregador);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Atribuir Entregador e Iniciar Corrida</DialogTitle>
                    <DialogDescription>
                        Selecione um entregador para a solicitação {solicitacao.codigo}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="entregador">Entregador</Label>
                    <Select value={selectedEntregadorId} onValueChange={setSelectedEntregadorId}>
                        <SelectTrigger id="entregador">
                            <SelectValue placeholder="Selecione um entregador" />
                        </SelectTrigger>
                        <SelectContent>
                            {entregadoresComCarga.map(e => (
                                <SelectItem key={e.id} value={e.id}>
                                    {e.nome} - ({e.cargaAtual} {e.cargaAtual === 1 ? 'corrida' : 'corridas'} em andamento)
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter className="pt-4 grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="button" onClick={handleConfirm} disabled={!selectedEntregadorId}>Iniciar Corrida</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
