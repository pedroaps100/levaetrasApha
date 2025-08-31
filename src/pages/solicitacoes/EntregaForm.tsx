import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientsData } from '@/hooks/useClientsData';
import { useSettingsData } from '@/hooks/useSettingsData';
import { Rota, Solicitacao } from '@/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { QuickClientFormDialog } from './QuickClientFormDialog';
import { SolicitacaoConfirmationDialog } from './SolicitacaoConfirmationDialog';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { ClientInfoDisplay } from './ClientInfoDisplay';
import { faker } from '@faker-js/faker';

const rotaSchema = z.object({
    id: z.string(),
    regionId: z.string().optional(),
    bairroDestinoId: z.string({ required_error: "Selecione o bairro de coleta." }),
    responsavel: z.string().min(3, "Nome do remetente é obrigatório."),
    telefone: z.string().min(10, "Telefone é obrigatório."),
    observacoes: z.string().optional(),
    taxaEntrega: z.number().default(0),
    valorExtra: z.coerce.number().optional(),
});

const formSchema = z.object({
    clienteId: z.string({ required_error: "Selecione um cliente." }),
    rotas: z.array(rotaSchema).min(1, "Adicione pelo menos um ponto de coleta."),
});

type EntregaFormValues = z.infer<typeof formSchema>;
type SolicitacaoFormData = Omit<Solicitacao, 'id' | 'codigo' | 'dataSolicitacao' | 'status' | 'entregadorId' | 'entregadorNome' | 'entregadorAvatar'>;

interface EntregaFormProps {
    onClose: () => void;
    onFormSubmit: (data: SolicitacaoFormData, id?: string) => void;
    operationLabel: string;
    solicitacaoToEdit: Solicitacao | null;
}

const createNewRota = (): z.infer<typeof rotaSchema> => ({
    id: faker.string.uuid(),
    bairroDestinoId: '',
    responsavel: '',
    telefone: '',
    observacoes: '',
    taxaEntrega: 0,
});

export const EntregaForm: React.FC<EntregaFormProps> = ({ onClose, onFormSubmit, operationLabel, solicitacaoToEdit }) => {
    const { clients, addClient, loading: clientsLoading } = useClientsData();
    const { regions, bairros, loading: settingsLoading } = useSettingsData();
    const [isQuickClientOpen, setIsQuickClientOpen] = useState(false);
    const [confirmationData, setConfirmationData] = useState<SolicitacaoFormData | null>(null);

    const form = useForm<EntregaFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            clienteId: '',
            rotas: [createNewRota()],
        },
    });

    useEffect(() => {
        if (solicitacaoToEdit) {
            form.reset({
                clienteId: solicitacaoToEdit.clienteId,
                rotas: solicitacaoToEdit.rotas.map(r => ({
                    ...r,
                    id: r.id || faker.string.uuid(),
                    regionId: bairros.find(b => b.id === r.bairroDestinoId)?.regionId || ''
                })),
            });
        } else {
            form.reset({
                clienteId: '',
                rotas: [createNewRota()],
            });
        }
    }, [solicitacaoToEdit, form, bairros]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "rotas",
    });

    const handleQuickClientSubmit = (data: Omit<Solicitacao['cliente'], 'id' | 'totalPedidos' | 'valorTotal'>) => {
        const newClient = addClient(data);
        if (newClient) {
            form.setValue('clienteId', newClient.id, { shouldValidate: true });
        }
        setIsQuickClientOpen(false);
    };
    
    const handleReview = (data: EntregaFormValues) => {
        const client = clients.find(c => c.id === data.clienteId);
        if (!client) return;
        
        const valorTotalTaxas = data.rotas.reduce((sum, rota) => sum + (rota.taxaEntrega || 0), 0);
        const rotasCompletas: Rota[] = data.rotas.map(r => ({ ...r, status: 'pendente', receberDoCliente: false, valorExtra: 0 }));

        setConfirmationData({
            clienteId: client.id,
            clienteNome: client.nome,
            clienteAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${client.nome.replace(/\s/g, '+')}`,
            tipoOperacao: 'entrega',
            operationDescription: operationLabel,
            pontoColeta: "Múltiplos pontos de coleta",
            rotas: rotasCompletas,
            valorTotalTaxas,
            valorTotalRepasse: 0,
        });
    };

    const handleFinalSubmit = () => {
        if (!confirmationData) return;
        onFormSubmit(confirmationData, solicitacaoToEdit?.id);
        const message = solicitacaoToEdit ? "Solicitação de entrega atualizada com sucesso!" : "Solicitação de entrega criada com sucesso!";
        toast.success(message);
        form.reset();
        setConfirmationData(null);
        onClose();
    };

    const selectedClient = React.useMemo(() => {
        const clientId = form.watch('clienteId');
        return clients.find(c => c.id === clientId);
    }, [clients, form.watch('clienteId')]);


    if (clientsLoading || settingsLoading) {
        return <div>Carregando dados...</div>;
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleReview)}>
                    <div className="max-h-[65vh] overflow-y-auto p-1 pr-4 space-y-6">
                        <FormField
                            control={form.control}
                            name="clienteId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cliente (Loja)</FormLabel>
                                    <div className="flex gap-2">
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {clients.map(client => (
                                                    <SelectItem key={client.id} value={client.id}>{client.nome}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button type="button" variant="outline" size="icon" onClick={() => setIsQuickClientOpen(true)}>
                                            <PlusCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {selectedClient && (
                            <div className="space-y-2">
                                <div className="p-3 bg-muted rounded-lg">
                                    <FormLabel>Ponto de Entrega Final</FormLabel>
                                    <p className="text-sm text-muted-foreground">{selectedClient.endereco}, {selectedClient.bairro}</p>
                                </div>
                                <ClientInfoDisplay client={selectedClient} />
                            </div>
                        )}

                        <div>
                            <h3 className="text-lg font-medium mb-2">Pontos de Coleta</h3>
                            <div className="space-y-4">
                                {fields.map((field, index) => {
                                    const selectedRegionId = form.watch(`rotas.${index}.regionId`);
                                    const filteredBairros = selectedRegionId ? bairros.filter(b => b.regionId === selectedRegionId) : [];
                                    const taxaEntrega = form.watch(`rotas.${index}.taxaEntrega`);
                                    
                                    return (
                                        <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-semibold">Coleta #{index + 1}</h4>
                                                {fields.length > 1 && (
                                                    <Button type="button" variant="ghost" size="icon" className="text-red-500 h-7 w-7" onClick={() => remove(index)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField control={form.control} name={`rotas.${index}.regionId`} render={({ field }) => (<FormItem><FormLabel>Região da Coleta</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione a região" /></SelectTrigger></FormControl><SelectContent>{regions.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name={`rotas.${index}.bairroDestinoId`} render={({ field }) => (<FormItem><FormLabel>Bairro da Coleta</FormLabel><div className="flex items-center gap-2"><Select onValueChange={(value) => {
                                                    field.onChange(value);
                                                    const bairro = bairros.find(b => b.id === value);
                                                    form.setValue(`rotas.${index}.taxaEntrega`, bairro?.taxa || 0, { shouldValidate: true });
                                                }} value={field.value} disabled={!selectedRegionId}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o bairro" /></SelectTrigger></FormControl><SelectContent>{filteredBairros.map(b => <SelectItem key={b.id} value={b.id}>{b.nome}</SelectItem>)}</SelectContent></Select>{taxaEntrega > 0 && (<div className="text-sm text-muted-foreground whitespace-nowrap">Taxa: {taxaEntrega.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>)}</div><FormMessage /></FormItem>)} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField control={form.control} name={`rotas.${index}.responsavel`} render={({ field }) => (<FormItem><FormLabel>Remetente</FormLabel><FormControl><Input placeholder="Nome de quem vai enviar" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name={`rotas.${index}.telefone`} render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(11) 99999-9999" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            </div>
                                             <FormField control={form.control} name={`rotas.${index}.observacoes`} render={({ field }) => (<FormItem><FormLabel>Observações</FormLabel><FormControl><Textarea placeholder="Ex: Procurar por João na recepção" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                    )
                                })}
                            </div>
                            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append(createNewRota())}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Ponto de Coleta
                            </Button>
                        </div>
                    </div>
                    <DialogFooter className="pt-6">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">{solicitacaoToEdit ? 'Revisar Alterações' : 'Revisar Solicitação'}</Button>
                    </DialogFooter>
                </form>
            </Form>
            <QuickClientFormDialog 
                open={isQuickClientOpen}
                onOpenChange={setIsQuickClientOpen}
                onFormSubmit={handleQuickClientSubmit}
            />
            <SolicitacaoConfirmationDialog
                isOpen={!!confirmationData}
                onClose={() => setConfirmationData(null)}
                solicitacaoData={confirmationData}
                onConfirm={handleFinalSubmit}
            />
        </>
    );
};
