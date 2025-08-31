import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormaPagamentoConciliacao } from '@/types';

const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  acaoFaturamento: z.enum(['GERAR_DEBITO_TAXA', 'GERAR_CREDITO_REPASSE', 'NENHUMA'], { required_error: "Selecione uma ação de faturamento." }),
});

type FormValues = z.infer<typeof formSchema>;

interface FormaPagamentoConciliacaoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formaToEdit: FormaPagamentoConciliacao | null;
  onFormSubmit: (data: FormValues) => void;
}

export const FormaPagamentoConciliacaoFormDialog: React.FC<FormaPagamentoConciliacaoFormDialogProps> = ({ open, onOpenChange, formaToEdit, onFormSubmit }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nome: '', acaoFaturamento: 'NENHUMA' },
  });

  useEffect(() => {
    if (formaToEdit) {
      form.reset(formaToEdit);
    } else {
      form.reset({ nome: '', acaoFaturamento: 'NENHUMA' });
    }
  }, [formaToEdit, open, form]);

  const dialogTitle = formaToEdit ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento';
  const dialogDescription = 'Crie ou edite as formas de pagamento e defina sua regra de faturamento.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: PIX Leva e Trás" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acaoFaturamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ação de Faturamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a regra..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NENHUMA">Nenhuma Ação (Resolvido na Hora)</SelectItem>
                      <SelectItem value="GERAR_DEBITO_TAXA">Gerar Débito na Fatura (Cobrar da Loja)</SelectItem>
                      <SelectItem value="GERAR_CREDITO_REPASSE">Gerar Crédito na Fatura (Repassar para Loja)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Defina o que acontece quando esta forma de pagamento é usada na conciliação.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
