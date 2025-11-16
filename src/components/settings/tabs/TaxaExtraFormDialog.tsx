import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TaxaExtra } from '@/types';

const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  valor: z.coerce.number().min(0, { message: "O valor deve ser positivo." }),
});

type FormValues = z.infer<typeof formSchema>;

interface TaxaExtraFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taxaToEdit: TaxaExtra | null;
  onFormSubmit: (data: FormValues) => void;
}

export const TaxaExtraFormDialog: React.FC<TaxaExtraFormDialogProps> = ({ open, onOpenChange, taxaToEdit, onFormSubmit }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nome: '', valor: 0 },
  });

  useEffect(() => {
    if (taxaToEdit) {
      form.reset(taxaToEdit);
    } else {
      form.reset({ nome: '', valor: 0 });
    }
  }, [taxaToEdit, open, form]);

  const dialogTitle = taxaToEdit ? 'Editar Taxa Extra' : 'Nova Taxa Extra';
  const dialogDescription = 'Crie ou edite as taxas extras que podem ser adicionadas às solicitações.';

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
                  <FormLabel>Nome da Taxa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Taxa de Espera" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Ex: 5.00" {...field} value={field.value ?? ''} />
                  </FormControl>
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
