import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useSettingsData } from '@/hooks/useSettingsData';
import { Rota, Solicitacao } from '@/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SolicitacaoConfirmationDialog } from './SolicitacaoConfirmationDialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const rotaSchema = z.object({
    regionId: z.string().optional(),
    bairroDestinoId: z.string({ required_error: "Selecione o bairro." }),
    responsavel: z.string().min(3, "Nome do responsável é obrigatório."),
    telefone: z.string().min(10, "Telefone é obrigatório."),
    observacoes: z.string().optional(),
    receberDoCliente: z.boolean().default(false),
    valorAReceber: z.coerce.number().optional(),
    meiosPagamentoAceitos: z.array(z.string()).optional(),
    taxaEntrega: z.number().default(0),
    taxasExtrasIds: z.array(z.string()).optional(),
});

const formSchema = z.object({
    rotas: z.array(rotaSchema).min(1, "Adicione pelo menos uma rota."),
});

type SolicitacaoFormValues = z.infer<typeof formSchema>;
type SolicitacaoFormData = Omit<Solicitacao, 'id' | 'codigo' | 'dataSolicitacao' | 'status' | 'entregadorId' | 'entregadorNome' | 'entregadorAvatar'>;

interface SolicitacaoFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onFormSubmit: (data: SolicitacaoFormData) => void;
}

export const SolicitacaoFormDialog: React.FC<SolicitacaoFormDialogProps> = ({ isOpen, onClose, onFormSubmit }) => {
    const { clientData } = useAuth();
    const { regions, bairros, enabledPaymentMethods, taxasExtras, loading: settingsLoading } = useSettingsData();
    const [confirmationData, setConfirmationData] = useState<SolicitacaoFormData | null>(null);

    const form = useForm<SolicitacaoFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            rotas: [{ bairroDestinoId: '', responsavel: '', telefone: '', observacoes: '', receberDoCliente: false, taxaEntrega: 0, taxasExtrasIds: [] }],
        },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({
                rotas: [{ bairroDestinoId: '', responsavel: '', telefone: '', observacoes: '', receberDoCliente: false, taxaEntrega: 0, taxasExtrasIds: [] }],
            });
        }
    }, [isOpen, form]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "rotas",
    });

    const watchedRotas = form.watch('rotas');

    // Direct calculation on each render, triggered by form.watch()
    const valorTotalTaxas = watchedRotas.reduce((sum, rota) => sum + (rota.taxaEntrega || 0), 0);
    const valorTotalTaxasExtras = watchedRotas.reduce((sum, rota) => {
        const taxasSelecionadas = taxasExtras.filter(te => rota.taxasExtrasIds?.includes(te.id));
        const valorDasTaxas = taxasSelecionadas.reduce((subSum, te) => subSum + te.valor, 0);
        return sum + valorDasTaxas;
    }, 0);
    const valorTotalRepasse = watchedRotas.reduce((sum, rota) => sum + (Number(rota.valorAReceber) || 0), 0);

    const handleReview = (data: SolicitacaoFormValues) => {
        if (!clientData) return;

        if (clientData.modalidade === 'pré-pago') {
            const saldoAtual = 532.50; // Mocked balance
            const custoTotal = valorTotalTaxas + valorTotalTaxasExtras;
            if (saldoAtual < custoTotal) {
                toast.error("Saldo insuficiente para realizar esta solicitação.", {
                    description: `Seu saldo é de ${saldoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} e o custo da entrega é de ${custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`,
                });
                return;
            }
        }

        const rotasCompletas: Rota[] = data.rotas.map(r => ({ ...r, id: '', status: 'pendente' }));

        setConfirmationData({
            clienteId: clientData.id,
            clienteNome: clientData.nome,
            clienteAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${clientData.nome.replace(/\s/g, '+')}`,
            tipoOperacao: 'coleta',
            operationDescription: 'Coleta na loja X Entregar ao Cliente',
            pontoColeta: `${clientData.endereco}, ${clientData.bairro}`,
            rotas: rotasCompletas,
            valorTotalTaxas,
            valorTotalTaxasExtras,
            valorTotalRepasse,
        });
    };

    const handleFinalSubmit = () => {
        if (!confirmationData) return;
        onFormSubmit(confirmationData);
        form.reset();
        setConfirmationData(null);
        onClose();
    };

    if (settingsLoading) {
        return <div>Carregando...</div>;
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Solicitar Nova Entrega</DialogTitle>
                        <DialogDescription>Preencha os dados da sua solicitação. O ponto de coleta será o seu endereço cadastrado.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleReview)}>
                            <div className="max-h-[65vh] overflow-y-auto p-1 pr-4 space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Rotas de Destino</h3>
                                    <div className="space-y-4">
                                        {fields.map((field, index) => {
                                            const selectedRegionId = form.watch(`rotas.${index}.regionId`);
                                            const filteredBairros = selectedRegionId ? bairros.filter(b => b.regionId === selectedRegionId) : [];
                                            
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
                                                        <FormField control={form.control} name={`rotas.${index}.bairroDestinoId`} render={({ field }) => (<FormItem><FormLabel>Bairro</FormLabel><Select onValueChange={(value) => {
                                                            field.onChange(value);
                                                            const bairro = bairros.find(b => b.id === value);
                                                            form.setValue(`rotas.${index}.taxaEntrega`, bairro?.taxa || 0);
                                                        }} value={field.value} disabled={!selectedRegionId}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o bairro" /></SelectTrigger></FormControl><SelectContent>{filteredBairros.map(b => <SelectItem key={b.id} value={b.id}>{b.nome}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <FormField control={form.control} name={`rotas.${index}.responsavel`} render={({ field }) => (<FormItem><FormLabel>Responsável</FormLabel><FormControl><Input placeholder="Nome de quem vai receber" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name={`rotas.${index}.telefone`} render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(11) 99999-9999" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    </div>
                                                    <FormField control={form.control} name={`rotas.${index}.observacoes`} render={({ field }) => (<FormItem><FormLabel>Observações</FormLabel><FormControl><Textarea placeholder="Ex: Deixar na portaria, produto frágil..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    
                                                    <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                                                        <FormField control={form.control} name={`rotas.${index}.taxasExtrasIds`} render={() => ( <FormItem> <div className="mb-2"><FormLabel>Taxas Extras (Opcional)</FormLabel></div> <div className="flex flex-wrap gap-x-4 gap-y-2"> {taxasExtras.map((item) => ( <FormField key={item.id} control={form.control} name={`rotas.${index}.taxasExtrasIds`} render={({ field }) => ( <FormItem key={item.id} className="flex flex-row items-center space-x-2 space-y-0"> <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id)) }} /></FormControl> <FormLabel className="font-normal">{item.nome} (+{item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</FormLabel> </FormItem> )} /> ))} </div> <FormMessage /> </FormItem> )} />
                                                    </div>

                                                    <FormField control={form.control} name={`rotas.${index}.receberDoCliente`} render={({ field }) => (
                                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md py-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Receber do cliente final?</FormLabel></div></FormItem>
                                                    )} />
                                                    {form.watch(`rotas.${index}.receberDoCliente`) && (
                                                        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                                                            <FormField control={form.control} name={`rotas.${index}.valorAReceber`} render={({ field }) => (<FormItem><FormLabel>Valor a Receber (R$)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="50.00" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
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
                                    <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ bairroDestinoId: '', responsavel: '', telefone: '', observacoes: '', receberDoCliente: false, taxaEntrega: 0, taxasExtrasIds: [] })}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Rota
                                    </Button>
                                </div>

                                <div className="mt-6 p-4 border-t space-y-2">
                                    <div className="flex justify-between font-medium"><span>Subtotal Taxas de Entrega:</span><span>{valorTotalTaxas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                                    {valorTotalTaxasExtras > 0 && <div className="flex justify-between font-medium"><span>Subtotal Taxas Extras:</span><span>{valorTotalTaxasExtras.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>}
                                    {valorTotalRepasse > 0 && <div className="flex justify-between font-medium"><span>Valor Total dos Produtos (Repasse):</span><span>{valorTotalRepasse.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>}
                                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total a Pagar:</span><span>{(valorTotalTaxas + valorTotalTaxasExtras).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                                </div>
                            </div>
                            <DialogFooter className="pt-6">
                                <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                                <Button type="submit">Revisar Solicitação</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <SolicitacaoConfirmationDialog
                isOpen={!!confirmationData}
                onClose={() => setConfirmationData(null)}
                solicitacaoData={confirmationData}
                onConfirm={handleFinalSubmit}
            />
        </>
    );
};
