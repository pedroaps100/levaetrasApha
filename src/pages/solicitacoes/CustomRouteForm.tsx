import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Label } from '@/components/ui/label';

const rotaSchema = z.object({
    id: z.string(),
    regionId: z.string().optional(),
    bairroDestinoId: z.string({ required_error: "Selecione o bairro." }),
    responsavel: z.string().min(3, "Nome do responsável é obrigatório."),
    telefone: z.string().min(10, "Telefone é obrigatório."),
    observacoes: z.string().optional(),
    receberDoCliente: z.boolean().default(false),
    valorExtra: z.coerce.number().optional(),
    meiosPagamentoAceitos: z.array(z.string()).optional(),
    taxaEntrega: z.number().default(0),
    taxasExtrasIds: z.array(z.string()).optional(),
});

const formSchema = z.object({
    clienteId: z.string({ required_error: "Selecione um cliente." }),
    pontoColeta: z.object({
        regionId: z.string({ required_error: "Selecione a região." }),
        bairroId: z.string({ required_error: "Selecione o bairro." }),
        endereco: z.string().min(5, "Endereço é obrigatório."),
    }),
    rotas: z.array(rotaSchema).min(1, "Adicione pelo menos uma rota."),
});

type CustomRouteFormValues = z.infer<typeof formSchema>;
type SolicitacaoFormData = Omit<Solicitacao, 'id' | 'codigo' | 'dataSolicitacao' | 'status' | 'entregadorId' | 'entregadorNome' | 'entregadorAvatar'>;

interface CustomRouteFormProps {
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
    receberDoCliente: false,
    taxaEntrega: 0,
    valorExtra: 0,
    meiosPagamentoAceitos: [],
    taxasExtrasIds: [],
});

export const CustomRouteForm: React.FC<CustomRouteFormProps> = ({ onClose, onFormSubmit, operationLabel, solicitacaoToEdit }) => {
    const { clients, addClient, loading: clientsLoading } = useClientsData();
    const { regions, bairros, enabledPaymentMethods, taxasExtras, loading: settingsLoading } = useSettingsData();
    const [isQuickClientOpen, setIsQuickClientOpen] = useState(false);
    const [confirmationData, setConfirmationData] = useState<SolicitacaoFormData | null>(null);
    const [showExtraFees, setShowExtraFees] = useState<Record<number, boolean>>({});

    const form = useForm<CustomRouteFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            clienteId: '',
            pontoColeta: { regionId: '', bairroId: '', endereco: '' },
            rotas: [createNewRota()],
        },
    });

    useEffect(() => {
        if (solicitacaoToEdit) {
            const pontoColetaEnderecoParts = solicitacaoToEdit.pontoColeta.split(', ');
            const pontoColetaEndereco = pontoColetaEnderecoParts.slice(0, -1).join(', ');
            const pontoColetaBairroNome = pontoColetaEnderecoParts.slice(-1)[0];
            const pontoColetaBairro = bairros.find(b => b.nome === pontoColetaBairroNome);

            form.reset({
                clienteId: solicitacaoToEdit.clienteId,
                pontoColeta: {
                    endereco: pontoColetaEndereco,
                    bairroId: pontoColetaBairro?.id || '',
                    regionId: pontoColetaBairro?.regionId || ''
                },
                rotas: solicitacaoToEdit.rotas.map(r => ({
                    ...r,
                    id: r.id || faker.string.uuid(),
                    regionId: bairros.find(b => b.id === r.bairroDestinoId)?.regionId || ''
                })),
            });
        } else {
            form.reset({
                clienteId: '',
                pontoColeta: { regionId: '', bairroId: '', endereco: '' },
                rotas: [createNewRota()],
            });
        }
    }, [solicitacaoToEdit, form, bairros]);
    
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "rotas",
    });

    const pontoColetaRegionId = form.watch('pontoColeta.regionId');
    const filteredBairrosColeta = pontoColetaRegionId ? bairros.filter(b => b.regionId === pontoColetaRegionId) : [];

    const handleQuickClientSubmit = (data: Omit<Solicitacao['cliente'], 'id' | 'totalPedidos' | 'valorTotal'>) => {
        const newClient = addClient(data);
        if (newClient) {
            form.setValue('clienteId', newClient.id, { shouldValidate: true });
        }
        setIsQuickClientOpen(false);
    };
    
    const handleReview = (data: CustomRouteFormValues) => {
        const client = clients.find(c => c.id === data.clienteId);
        const bairroColeta = bairros.find(b => b.id === data.pontoColeta.bairroId);
        if (!client || !bairroColeta) return;

        const valorTotalTaxas = data.rotas.reduce((sum, rota) => sum + (rota.taxaEntrega || 0), 0);
        const valorTotalTaxasExtras = data.rotas.reduce((sum, rota) => {
            const taxasSelecionadas = taxasExtras.filter(te => rota.taxasExtrasIds?.includes(te.id));
            const valorDasTaxas = taxasSelecionadas.reduce((subSum, te) => subSum + te.valor, 0);
            return sum + valorDasTaxas;
        }, 0);
        const valorTotalRepasse = data.rotas.reduce((sum, rota) => sum + (Number(rota.valorExtra) || 0), 0);
        const rotasCompletas: Rota[] = data.rotas.map(r => ({ ...r, status: 'pendente' }));

        setConfirmationData({
            clienteId: client.id,
            clienteNome: client.nome,
            clienteAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${client.nome.replace(/\s/g, '+')}`,
            tipoOperacao: 'custom',
            operationDescription: operationLabel,
            pontoColeta: `${data.pontoColeta.endereco}, ${bairroColeta.nome}`,
            rotas: rotasCompletas,
            valorTotalTaxas,
            valorTotalTaxasExtras,
            valorTotalRepasse,
        });
    };

    const handleFinalSubmit = () => {
        if (!confirmationData) return;
        onFormSubmit(confirmationData, solicitacaoToEdit?.id);
        const message = solicitacaoToEdit ? "Solicitação de rota específica atualizada com sucesso!" : "Solicitação de rota específica criada com sucesso!";
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
                                    <FormLabel>Cliente (Pagador)</FormLabel>
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

                        {selectedClient && <ClientInfoDisplay client={selectedClient} />}
                        
                        <div className="p-4 border rounded-lg space-y-4">
                            <h4 className="font-semibold">Ponto de Coleta Específico</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="pontoColeta.regionId" render={({ field }) => (<FormItem><FormLabel>Região</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione a região" /></SelectTrigger></FormControl><SelectContent>{regions.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="pontoColeta.bairroId" render={({ field }) => (<FormItem><FormLabel>Bairro</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!pontoColetaRegionId}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o bairro" /></SelectTrigger></FormControl><SelectContent>{filteredBairrosColeta.map(b => <SelectItem key={b.id} value={b.id}>{b.nome}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                            </div>
                            <FormField control={form.control} name="pontoColeta.endereco" render={({ field }) => (<FormItem><FormLabel>Endereço de Coleta</FormLabel><FormControl><Input placeholder="Rua, número, etc." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>


                        <div>
                            <h3 className="text-lg font-medium mb-2">Rotas de Destino</h3>
                            <div className="space-y-4">
                                {fields.map((field, index) => {
                                    const selectedRegionId = form.watch(`rotas.${index}.regionId`);
                                    const filteredBairros = selectedRegionId ? bairros.filter(b => b.regionId === selectedRegionId) : [];
                                    const taxaEntrega = form.watch(`rotas.${index}.taxaEntrega`);
                                    
                                    return (
                                        <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-semibold">Rota #{index + 1}</h4>
                                                {fields.length > 1 && (
                                                    <Button type="button" variant="ghost" size="icon" className="text-red-500 h-7 w-7" onClick={() => remove(index)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField control={form.control} name={`rotas.${index}.regionId`} render={({ field }) => (<FormItem><FormLabel>Região</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione a região" /></SelectTrigger></FormControl><SelectContent>{regions.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name={`rotas.${index}.bairroDestinoId`} render={({ field }) => (<FormItem><FormLabel>Bairro</FormLabel><div className="flex items-center gap-2"><Select onValueChange={(value) => {
                                                    field.onChange(value);
                                                    const bairro = bairros.find(b => b.id === value);
                                                    form.setValue(`rotas.${index}.taxaEntrega`, bairro?.taxa || 0, { shouldValidate: true });
                                                }} value={field.value} disabled={!selectedRegionId}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o bairro" /></SelectTrigger></FormControl><SelectContent>{filteredBairros.map(b => <SelectItem key={b.id} value={b.id}>{b.nome}</SelectItem>)}</SelectContent></Select>{taxaEntrega > 0 && (<div className="text-sm text-muted-foreground whitespace-nowrap">Taxa: {taxaEntrega.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>)}</div><FormMessage /></FormItem>)} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField control={form.control} name={`rotas.${index}.responsavel`} render={({ field }) => (<FormItem><FormLabel>Responsável</FormLabel><FormControl><Input placeholder="Nome de quem vai receber" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name={`rotas.${index}.telefone`} render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(11) 99999-9999" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            </div>
                                            <FormField control={form.control} name={`rotas.${index}.observacoes`} render={({ field }) => (<FormItem><FormLabel>Observações</FormLabel><FormControl><Textarea placeholder="Ex: Deixar na portaria, produto frágil..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            
                                            <div className="flex flex-row items-center space-x-3 space-y-0 rounded-md py-2">
                                                <Checkbox checked={showExtraFees[index]} onCheckedChange={(checked) => { setShowExtraFees(prev => ({ ...prev, [index]: !!checked })); if (!checked) { form.setValue(`rotas.${index}.taxasExtrasIds`, []); } }} id={`custom-mostrar-taxas-${index}`} />
                                                <Label htmlFor={`custom-mostrar-taxas-${index}`} className="font-normal">Adicionar Taxas Extras?</Label>
                                            </div>

                                            {showExtraFees[index] && (
                                                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                                                    <FormField control={form.control} name={`rotas.${index}.taxasExtrasIds`} render={() => ( <FormItem> <div className="mb-2"><FormLabel>Taxas Disponíveis</FormLabel></div> <div className="flex flex-wrap gap-x-4 gap-y-2"> {taxasExtras.map((item) => ( <FormField key={item.id} control={form.control} name={`rotas.${index}.taxasExtrasIds`} render={({ field }) => ( <FormItem key={item.id} className="flex flex-row items-center space-x-2 space-y-0"> <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id)) }} /></FormControl> <FormLabel className="font-normal">{item.nome} (+{item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</FormLabel> </FormItem> )} /> ))} </div> <FormMessage /> </FormItem> )} />
                                                </div>
                                            )}

                                            <FormField control={form.control} name={`rotas.${index}.receberDoCliente`} render={({ field }) => (
                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md py-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Receber do cliente final?</FormLabel></div></FormItem>
                                            )} />
                                            {form.watch(`rotas.${index}.receberDoCliente`) && (
                                                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                                                    <FormField control={form.control} name={`rotas.${index}.valorExtra`} render={({ field }) => (<FormItem><FormLabel>Valor Extra (p/ Loja) (R$)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="50.00" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                                    <FormField control={form.control} name={`rotas.${index}.meiosPagamentoAceitos`} render={() => (
                                                        <FormItem>
                                                            <FormLabel>Meios de Pagamento Aceitos</FormLabel>
                                                            <div className="flex flex-wrap gap-4">
                                                                {enabledPaymentMethods.map((item) => (
                                                                    <FormField key={item.id} control={form.control} name={`rotas.${index}.meiosPagamentoAceitos`} render={({ field }) => (
                                                                        <FormItem key={item.id} className="flex flex-row items-center space-x-2 space-y-0">
                                                                            <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => {
                                                                                return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id))
                                                                            }} /></FormControl>
                                                                            <FormLabel className="font-normal">{item.name}</FormLabel>
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                ))}
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append(createNewRota())}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Rota
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
