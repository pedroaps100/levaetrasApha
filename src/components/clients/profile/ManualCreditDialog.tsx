import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useTransaction } from '@/contexts/TransactionContext';
import { toast } from 'sonner';

const formSchema = z.object({
  value: z.coerce.number().positive({ message: "O valor deve ser maior que zero." }),
  description: z.string().min(3, { message: "A descrição é obrigatória." }),
});

type ManualCreditFormValues = z.infer<typeof formSchema>;

interface ManualCreditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManualCreditDialog: React.FC<ManualCreditDialogProps> = ({ open, onOpenChange }) => {
  const { addTransaction } = useTransaction();
  
  const form = useForm<ManualCreditFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { value: 0, description: '' },
  });

  const onSubmit = (data: ManualCreditFormValues) => {
    addTransaction({
        type: 'credit',
        origin: 'recharge_manual',
        description: data.description,
        value: data.value,
    });
    toast.success("Crédito manual adicionado com sucesso!");
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Crédito Manual</DialogTitle>
          <DialogDescription>
            Insira um crédito na carteira do cliente. Esta ação será registrada no extrato.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Crédito (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Ex: 50.00" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição / Motivo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Bônus de indicação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Adicionar Crédito</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
