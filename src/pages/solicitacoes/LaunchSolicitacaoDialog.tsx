import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Solicitacao } from '@/types';
import { Truck, Package, Route, CheckCircle } from 'lucide-react';
import { ColetaForm } from './ColetaForm';
import { EntregaForm } from './EntregaForm';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CustomRouteForm } from './CustomRouteForm';
import { cn } from '@/lib/utils';

type OperationType = 'coleta' | 'entrega' | 'custom';
type SolicitacaoFormData = Omit<Solicitacao, 'id' | 'codigo' | 'dataSolicitacao' | 'status' | 'entregadorId' | 'entregadorNome' | 'entregadorAvatar'>;

const operationConfig = {
    coleta: {
        title: 'Lançar Nova Coleta',
        description: 'Preencha os dados da coleta na loja do cliente e das rotas de destino.',
        label: 'Coletar na loja X Entregar ao Cliente'
    },
    entrega: {
        title: 'Lançar Nova Entrega',
        description: 'Preencha os dados da coleta no cliente final para entrega na loja.',
        label: 'Coletar no Cliente X Levar Para loja'
    },
    custom: {
        title: 'Lançar Rota Específica',
        description: 'Preencha os dados de um ponto de coleta e entrega específicos.',
        label: 'Coletar em lugar específico X Entregar em lugar específico'
    },
    choice: {
        title: 'Lançar Nova Solicitação',
        description: 'Qual tipo de operação você deseja lançar?',
        label: ''
    }
};

interface LaunchSolicitacaoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    addSolicitacao: (data: SolicitacaoFormData) => Solicitacao;
    updateSolicitacao: (id: string, data: Partial<Omit<Solicitacao, 'id'>>) => void;
    solicitacaoToEdit: Solicitacao | null;
}

export const LaunchSolicitacaoDialog: React.FC<LaunchSolicitacaoDialogProps> = ({ isOpen, onClose, addSolicitacao, updateSolicitacao, solicitacaoToEdit }) => {
    const [step, setStep] = useState<'choice' | OperationType>('choice');
    const [selectedType, setSelectedType] = useState<OperationType | null>(null);

    useEffect(() => {
        if (solicitacaoToEdit) {
            setStep(solicitacaoToEdit.tipoOperacao);
        } else {
            setStep('choice');
            setSelectedType(null);
        }
    }, [solicitacaoToEdit, isOpen]);

    const handleClose = () => {
        setStep('choice');
        setSelectedType(null);
        onClose();
    };

    const handleFormSubmit = (data: SolicitacaoFormData) => {
        if (solicitacaoToEdit) {
            updateSolicitacao(solicitacaoToEdit.id, data);
        } else {
            addSolicitacao(data);
        }
    };

    const renderContent = () => {
        const formProps = {
            onFormSubmit: handleFormSubmit,
            onClose: handleClose,
            solicitacaoToEdit: solicitacaoToEdit
        };

        switch (step) {
            case 'coleta':
                return <ColetaForm {...formProps} operationLabel={operationConfig.coleta.label} />;
            case 'entrega':
                return <EntregaForm {...formProps} operationLabel={operationConfig.entrega.label} />;
            case 'custom':
                 return <CustomRouteForm {...formProps} operationLabel={operationConfig.custom.label} />;
            case 'choice':
            default:
                return (
                    <div className="py-8 space-y-6">
                        <RadioGroup value={selectedType || ''} onValueChange={(value: OperationType) => setSelectedType(value)} className="flex flex-col gap-4">
                            <Label htmlFor="op-coleta" className={cn("flex items-center gap-4 border rounded-lg p-4 cursor-pointer hover:bg-primary/10 transition-colors", "has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary")}>
                                <RadioGroupItem value="coleta" id="op-coleta" className="sr-only" />
                                <Truck className="h-8 w-8 text-primary" />
                                <div className="flex-1">
                                    <p className="font-semibold">{operationConfig.coleta.label}</p>
                                    <p className="text-xs text-muted-foreground">Buscar na loja e levar ao cliente final.</p>
                                </div>
                                <CheckCircle className={cn("h-6 w-6 text-primary transition-opacity", selectedType === 'coleta' ? 'opacity-100' : 'opacity-0')} />
                            </Label>
                             <Label htmlFor="op-entrega" className={cn("flex items-center gap-4 border rounded-lg p-4 cursor-pointer hover:bg-primary/10 transition-colors", "has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary")}>
                                <RadioGroupItem value="entrega" id="op-entrega" className="sr-only" />
                                <Package className="h-8 w-8 text-primary" />
                                <div className="flex-1">
                                    <p className="font-semibold">{operationConfig.entrega.label}</p>
                                    <p className="text-xs text-muted-foreground">Buscar no cliente final e levar para a loja.</p>
                                </div>
                                <CheckCircle className={cn("h-6 w-6 text-primary transition-opacity", selectedType === 'entrega' ? 'opacity-100' : 'opacity-0')} />
                            </Label>
                             <Label htmlFor="op-custom" className={cn("flex items-center gap-4 border rounded-lg p-4 cursor-pointer hover:bg-primary/10 transition-colors", "has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary")}>
                                <RadioGroupItem value="custom" id="op-custom" className="sr-only" />
                                <Route className="h-8 w-8 text-primary" />
                                <div className="flex-1">
                                    <p className="font-semibold">{operationConfig.custom.label}</p>
                                    <p className="text-xs text-muted-foreground">Uma rota com ponto de coleta e entrega personalizados.</p>
                                </div>
                                <CheckCircle className={cn("h-6 w-6 text-primary transition-opacity", selectedType === 'custom' ? 'opacity-100' : 'opacity-0')} />
                            </Label>
                        </RadioGroup>
                        <div className="flex justify-end">
                            <Button onClick={() => setStep(selectedType!)} disabled={!selectedType}>
                                Continuar
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    const getDialogConfig = () => {
        if (solicitacaoToEdit) {
            return {
                title: `Editar Solicitação ${solicitacaoToEdit.codigo}`,
                description: `Modifique os detalhes da operação "${solicitacaoToEdit.operationDescription}".`
            }
        }
        return operationConfig[step];
    }

    const config = getDialogConfig();

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{config.title}</DialogTitle>
                    <DialogDescription>{config.description}</DialogDescription>
                </DialogHeader>
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
};
