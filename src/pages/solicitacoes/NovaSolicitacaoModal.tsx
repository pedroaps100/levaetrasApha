import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientsData } from '@/hooks/useClientsData';
import { Solicitacao } from '@/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const rotaSchema = z.object({
    enderecoColeta: z.string().min(5, "Endereço de coleta é obrigatório."),
    enderecoEntrega: z.string().min(5, "Endereço de entrega é obrigatório."),
    taxaEntrega: z.coerce.number().min(0, "Taxa inválida."),
    valorARepassar: z.coerce.number().optional(),
});

const formSchema = z.object({
    clienteId: z.string({ required_error: "Selecione um cliente." }),
    rotas: z.array(rotaSchema).min(1, "Adicione pelo menos uma rota."),
});

type SolicitacaoFormValues = z.infer<typeof formSchema>;

interface NovaSolicitacaoModalProps {
    isOpen: boolean;
    onClose: () => void;
    addSolicitacao: (data: Omit<Solicitacao, 'id' | 'codigo' | 'dataSolicitacao' | 'status'>) => void;
}

export const NovaSolicitacaoModal: React.FC<NovaSolicitacaoModalProps> = ({ isOpen, onClose, addSolicitacao }) => {
    const { clients } = useClientsData();
    const form = useForm<SolicitacaoFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            clienteId: '',
            rotas: [{ enderecoColeta: '', enderecoEntrega: '', taxaEntrega: 0, valorARepassar: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "rotas",
    });

    const onSubmit = (data: SolicitacaoFormValues) => {
        const selectedClient = clients.find(c => c.id === data.clienteId);
        if (!selectedClient) {
            toast.error("Cliente inválido selecionado.");
            return;
        }

        const valorTotalTaxas = data.rotas.reduce((sum, r) => sum + r.taxaEntrega, 0);
        const valorTotalRepasse = data.rotas.reduce((sum, r) => sum + (r.valorARepassar || 0), 0);

        addSolicitacao({
            clienteId: selectedClient.id,
            clienteNome: selectedClient.nome,
            clienteAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${selectedClient.nome.replace(/\s/g, '+')}`,
            rotas: data.rotas.map(r => ({ ...r, id: '', status: 'pendente' })), // IDs and status will be set by the hook
            valorTotalTaxas,
            valorTotalRepasse,
        });

        toast.success("Nova solicitação criada com sucesso!");
        form.reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Lançar Nova Solicitação</DialogTitle>
                    <DialogDescription>Preencha os dados abaixo para criar uma nova solicitação de entrega.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="max-h-[70vh] overflow-y-auto p-1 pr-4 space-y-6">
                            <FormField
                                control={form.control}
                                name="clienteId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cliente</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {clients.map(client => (
                                                    <SelectItem key={client.id} value={client.id}>{client.nome}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div>
                                <h3 className="text-lg font-medium mb-2">Rotas da Solicitação</h3>
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                                            <h4 className="font-semibold">Rota #{index + 1}</h4>
                                            {fields.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 h-7 w-7" onClick={() => remove(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <FormField control={form.control} name={`rotas.${index}.enderecoColeta`} render={({ field }) => (<FormItem><FormLabel>Endereço de Coleta</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name={`rotas.${index}.enderecoEntrega`} render={({ field }) => (<FormItem><FormLabel>Endereço de Entrega</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField control={form.control} name={`rotas.${index}.taxaEntrega`} render={({ field }) => (<FormItem><FormLabel>Taxa (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name={`rotas.${index}.valorARepassar`} render={({ field }) => (<FormItem><FormLabel>Valor a Repassar (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ enderecoColeta: '', enderecoEntrega: '', taxaEntrega: 0, valorARepassar: 0 })}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Rota
                                </Button>
                            </div>
                        </div>
                        <DialogFooter className="pt-6">
                            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                            <Button type="submit">Criar Solicitação</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
