import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bairro, Region } from '@/types';

const formSchema = z.object({
  nome: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  taxa: z.coerce.number().min(0, { message: "A taxa deve ser um valor positivo." }),
  regionId: z.string({ required_error: "Selecione uma região." }).min(1, "Selecione uma região."),
});

type BairroFormValues = z.infer<typeof formSchema>;

interface BairroFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bairroToEdit: Bairro | null;
  regions: Region[];
  onFormSubmit: (data: BairroFormValues) => void;
}

export const BairroFormDialog: React.FC<BairroFormDialogProps> = ({ open, onOpenChange, bairroToEdit, regions, onFormSubmit }) => {
  const form = useForm<BairroFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { nome: '', taxa: 0, regionId: '' },
  });

  useEffect(() => {
    if (bairroToEdit) {
      form.reset(bairroToEdit);
    } else {
      form.reset({ nome: '', taxa: 0, regionId: '' });
    }
  }, [bairroToEdit, open, form]);

  const dialogTitle = bairroToEdit ? 'Editar Bairro' : 'Adicionar Novo Bairro';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {bairroToEdit ? 'Altere os dados do bairro.' : 'Cadastre um novo bairro e sua respectiva taxa de entrega.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="regionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Região</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma região" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {regions.map(region => (
                        <SelectItem key={region.id} value={region.id}>{region.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Bairro</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Centro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taxa de Entrega (R$)</FormLabel>
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
