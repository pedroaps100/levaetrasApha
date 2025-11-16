import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { EntregaIncluida, TaxaExtra } from '@/types';
import { useEntregadoresData } from '@/hooks/useEntregadoresData';
import { useSettingsData } from '@/hooks/useSettingsData';

const formSchema = z.object({
  data: z.date({ required_error: 'A data é obrigatória.' }),
  descricao: z.string().min(3, { message: 'A descrição é obrigatória.' }),
  entregadorId: z.string().optional(),
  taxaEntrega: z.coerce.number().min(0, 'A taxa deve ser um valor positivo.'),
  valorRepasse: z.coerce.number().min(0, 'O valor de repasse deve ser positivo.'),
  taxasExtrasIds: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;
export type EntregaManualFormData = Omit<EntregaIncluida, 'id'>;

interface AdicionarEntregaModalProps {
  isOpen: boolean;
  onClose: () => void;
  faturaId: string;
  entregaToEdit: EntregaIncluida | null;
  onFormSubmit: (faturaId: string, data: EntregaManualFormData, entregaId?: string) => void;
  viewOnly?: boolean;
}

export const AdicionarEntregaModal: React.FC<AdicionarEntregaModalProps> = ({ isOpen, onClose, faturaId, entregaToEdit, onFormSubmit, viewOnly = false }) => {
  const { entregadores } = useEntregadoresData();
  const { taxasExtras } = useSettingsData();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: new Date(),
      descricao: '',
      entregadorId: '',
      taxaEntrega: 0,
      valorRepasse: 0,
      taxasExtrasIds: [],
    },
  });

  useEffect(() => {
    if (entregaToEdit) {
      const taxaExtraIds = taxasExtras
        .filter(te => entregaToEdit.taxasExtras.some(eet => eet.nome === te.nome))
        .map(te => te.id);
      form.reset({
        ...entregaToEdit,
        taxasExtrasIds: taxaExtraIds,
      });
    } else {
      form.reset({
        data: new Date(),
        descricao: '',
        entregadorId: '',
        taxaEntrega: 0,
        valorRepasse: 0,
        taxasExtrasIds: [],
      });
    }
  }, [entregaToEdit, isOpen, form, taxasExtras]);

  const onSubmit = (data: FormValues) => {
    const entregador = entregadores.find(e => e.id === data.entregadorId);
    const selectedTaxasExtras = taxasExtras.filter(te => data.taxasExtrasIds?.includes(te.id));
    
    const finalData: EntregaManualFormData = {
      ...data,
      entregadorNome: entregador?.nome,
      taxasExtras: selectedTaxasExtras.map(te => ({ nome: te.nome, valor: te.valor })),
    };

    onFormSubmit(faturaId, finalData, entregaToEdit?.id);
    toast.success(entregaToEdit ? 'Entrega atualizada com sucesso!' : 'Entrega adicionada com sucesso!');
    onClose();
  };

  const dialogTitle = viewOnly ? 'Visualizar Entrega' : (entregaToEdit ? 'Editar Entrega Avulsa' : 'Adicionar Entrega Avulsa');
  const dialogDescription = viewOnly ? 'Detalhes da entrega manual.' : 'Preencha os dados da entrega para adicioná-la à fatura.';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="max-h-[70vh] overflow-y-auto p-1 pr-4 space-y-4">
              <FormField control={form.control} name="descricao" render={({ field }) => (<FormItem><FormLabel>Descrição</FormLabel><FormControl><Input placeholder="Ex: Entrega de bolo para Maria" {...field} disabled={viewOnly} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="data" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Data da Entrega</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled={viewOnly}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "dd/MM/yyyy") : <span>Selecione a data</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="entregadorId" render={({ field }) => (
                    <FormItem><FormLabel>Entregador</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={viewOnly}><FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl><SelectContent>{entregadores.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="taxaEntrega" render={({ field }) => (<FormItem><FormLabel>Taxa de Entrega (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} disabled={viewOnly} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="valorRepasse" render={({ field }) => (<FormItem><FormLabel>Valor do Produto (Repasse)</FormLabel><FormControl><Input type="number" step="0.01" {...field} disabled={viewOnly} /></FormControl><FormMessage /></FormItem>)} />
              </div>

              {taxasExtras.length > 0 && (
                <FormField control={form.control} name="taxasExtrasIds" render={() => (
                    <FormItem>
                        <FormLabel>Taxas Extras</FormLabel>
                        <div className="p-3 border rounded-md space-y-2">
                            {taxasExtras.map((item) => (
                                <FormField key={item.id} control={form.control} name="taxasExtrasIds" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                        <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => {
                                            if (viewOnly) return;
                                            return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id))
                                        }} disabled={viewOnly} /></FormControl>
                                        <FormLabel className="font-normal">{item.nome} (+{item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</FormLabel>
                                    </FormItem>
                                )} />
                            ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                )} />
              )}
            </div>
            <DialogFooter className="pt-6">
              <Button type="button" variant="ghost" onClick={onClose}>
                {viewOnly ? 'Fechar' : 'Cancelar'}
              </Button>
              {!viewOnly && (
                <Button type="submit">{entregaToEdit ? 'Salvar Alterações' : 'Adicionar Entrega'}</Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
