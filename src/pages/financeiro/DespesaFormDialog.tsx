import React, { useEffect } from 'react';
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
import { Despesa } from '@/types';
import { useSettingsData } from '@/hooks/useSettingsData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

const formSchema = z.object({
  descricao: z.string().min(3, "Descrição é obrigatória."),
  valor: z.coerce.number().positive("O valor deve ser maior que zero."),
  vencimento: z.date({ required_error: "Data de vencimento é obrigatória." }),
  fornecedor: z.string().min(2, "Fornecedor é obrigatório."),
  categoria: z.string({ required_error: "Selecione uma categoria." }),
  status: z.enum(['Pendente', 'Atrasado', 'Pago']),
});

type FormValues = z.infer<typeof formSchema>;

interface DespesaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  despesaToEdit: Despesa | null;
  onFormSubmit: (data: Omit<Despesa, 'id'>) => void;
  viewOnly?: boolean;
}

export const DespesaFormDialog: React.FC<DespesaFormDialogProps> = ({ open, onOpenChange, despesaToEdit, onFormSubmit, viewOnly = false }) => {
  const { categories } = useSettingsData();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descricao: '', valor: 0, vencimento: new Date(), fornecedor: '', categoria: '', status: 'Pendente',
    },
  });

  useEffect(() => {
    if (despesaToEdit) {
      form.reset({
        ...despesaToEdit,
        vencimento: new Date(despesaToEdit.vencimento),
      });
    } else {
      form.reset({
        descricao: '', valor: 0, vencimento: new Date(), fornecedor: '', categoria: '', status: 'Pendente',
      });
    }
  }, [despesaToEdit, open, form]);

  const dialogTitle = viewOnly ? 'Visualizar Despesa' : (despesaToEdit ? 'Editar Despesa' : 'Nova Despesa');
  const dialogDescription = viewOnly ? 'Detalhes da despesa selecionada.' : (despesaToEdit ? 'Altere os dados da despesa abaixo.' : 'Preencha as informações para adicionar uma nova despesa.');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)}>
            <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-1 pr-4">
              <FormField control={form.control} name="descricao" render={({ field }) => (<FormItem><FormLabel>Descrição</FormLabel><FormControl><Input {...field} disabled={viewOnly} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="valor" render={({ field }) => (<FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} disabled={viewOnly} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="vencimento" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Data de Vencimento</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled={viewOnly}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "dd/MM/yyyy") : <span>Selecione a data</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="fornecedor" render={({ field }) => (<FormItem><FormLabel>Fornecedor</FormLabel><FormControl><Input {...field} disabled={viewOnly} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="categoria" render={({ field }) => (<FormItem><FormLabel>Categoria</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={viewOnly}><FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl><SelectContent>{categories.despesas.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={viewOnly}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Pendente">Pendente</SelectItem><SelectItem value="Atrasado">Atrasado</SelectItem><SelectItem value="Pago">Pago</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              </div>
            </div>
            <DialogFooter className="pt-6">
              {viewOnly ? (
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
              ) : (
                <>
                  <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                  <Button type="submit">{despesaToEdit ? 'Salvar Alterações' : 'Adicionar Despesa'}</Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
