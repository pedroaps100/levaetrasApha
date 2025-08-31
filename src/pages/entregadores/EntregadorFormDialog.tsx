import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Entregador } from '@/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  nome: z.string().min(3, "Nome é obrigatório."),
  documento: z.string().min(11, "Documento inválido."),
  email: z.string().email("Email inválido."),
  telefone: z.string().min(10, "Telefone inválido."),
  cidade: z.string().min(2, "Cidade é obrigatória."),
  bairro: z.string().min(2, "Bairro é obrigatório."),
  veiculo: z.string().min(3, "Veículo é obrigatório."),
  status: z.enum(['ativo', 'inativo']),
  tipoComissao: z.enum(['percentual', 'fixo']),
  valorComissao: z.coerce.number().min(0, "O valor deve ser positivo."),
}).superRefine((data, ctx) => {
    if (data.tipoComissao === 'percentual' && data.valorComissao > 100) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['valorComissao'],
            message: 'A comissão percentual não pode ser maior que 100.',
        });
    }
});

type EntregadorFormValues = z.infer<typeof formSchema>;

interface EntregadorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entregadorToEdit: Entregador | null;
  onFormSubmit: (data: Omit<Entregador, 'id' | 'avatar'>) => void;
}

export const EntregadorFormDialog: React.FC<EntregadorFormDialogProps> = ({ open, onOpenChange, entregadorToEdit, onFormSubmit }) => {
  const form = useForm<EntregadorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '', documento: '', email: '', telefone: '', cidade: '', bairro: '',
      veiculo: '', status: 'ativo', tipoComissao: 'percentual', valorComissao: 10,
    },
  });

  const tipoComissao = form.watch('tipoComissao');

  useEffect(() => {
    if (entregadorToEdit) {
      form.reset(entregadorToEdit);
    } else {
      form.reset({
        nome: '', documento: '', email: '', telefone: '', cidade: '', bairro: '',
        veiculo: '', status: 'ativo', tipoComissao: 'percentual', valorComissao: 10,
      });
    }
  }, [entregadorToEdit, open, form]);

  const dialogTitle = entregadorToEdit ? 'Editar Entregador' : 'Novo Entregador';
  const dialogDescription = entregadorToEdit ? 'Altere os dados do entregador abaixo.' : 'Preencha as informações para cadastrar um novo entregador.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)}>
            <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-1 pr-4">
              <FormField control={form.control} name="nome" render={({ field }) => (<FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="documento" render={({ field }) => (<FormItem><FormLabel>CPF/CNPJ</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="telefone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="cidade" render={({ field }) => (<FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="bairro" render={({ field }) => (<FormItem><FormLabel>Bairro Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="veiculo" render={({ field }) => (<FormItem><FormLabel>Veículo (Ex: Moto - Honda Biz)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              
              <div className="p-4 border rounded-lg space-y-4">
                <FormField
                    control={form.control}
                    name="tipoComissao"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Tipo de Comissão</FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center gap-4">
                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="percentual" /></FormControl><FormLabel className="font-normal">Percentual (%)</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="fixo" /></FormControl><FormLabel className="font-normal">Valor Fixo (R$)</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="valorComissao"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{tipoComissao === 'percentual' ? 'Comissão (%)' : 'Valor Fixo (R$)'}</FormLabel>
                            <FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              </div>

              <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="ativo">Ativo</SelectItem><SelectItem value="inativo">Inativo</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            </div>
            <DialogFooter className="pt-6">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">{entregadorToEdit ? 'Salvar Alterações' : 'Cadastrar Entregador'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
