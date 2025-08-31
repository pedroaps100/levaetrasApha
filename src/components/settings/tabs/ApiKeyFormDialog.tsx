import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ApiKey } from '@/types';

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
});

type ApiKeyFormValues = z.infer<typeof formSchema>;

interface ApiKeyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyToEdit: ApiKey | null;
  onFormSubmit: (data: ApiKeyFormValues) => void;
}

export const ApiKeyFormDialog: React.FC<ApiKeyFormDialogProps> = ({ open, onOpenChange, keyToEdit, onFormSubmit }) => {
  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (keyToEdit) {
      form.reset({ name: keyToEdit.name });
    } else {
      form.reset({ name: '' });
    }
  }, [keyToEdit, open, form]);

  const dialogTitle = keyToEdit ? 'Editar Nome da Chave' : 'Gerar Nova Chave API';
  const dialogDescription = keyToEdit
    ? 'Altere o nome desta chave para facilitar a identificação.'
    : 'Dê um nome para sua nova chave API para identificar seu uso.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Chave</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: API iFood" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">{keyToEdit ? 'Salvar Alterações' : 'Gerar Chave'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
