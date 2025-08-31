import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Region } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome da região deve ter pelo menos 2 caracteres." }),
});

type RegionFormValues = z.infer<typeof formSchema>;

interface RegionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regionToEdit: Region | null;
  onFormSubmit: (data: RegionFormValues) => void;
}

export const RegionFormDialog: React.FC<RegionFormDialogProps> = ({ open, onOpenChange, regionToEdit, onFormSubmit }) => {
  const form = useForm<RegionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (regionToEdit) {
      form.reset({ name: regionToEdit.name });
    } else {
      form.reset({ name: '' });
    }
  }, [regionToEdit, open, form]);

  const dialogTitle = regionToEdit ? 'Editar Região' : 'Adicionar Nova Região';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {regionToEdit ? 'Altere o nome da região.' : 'Cadastre uma nova região para agrupar bairros.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Região</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Zona Sul" {...field} />
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
