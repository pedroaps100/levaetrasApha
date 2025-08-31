import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Cargo } from '@/types';
import { PERMISSION_GROUPS } from '@/lib/permissions';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome do cargo deve ter pelo menos 3 caracteres." }),
  description: z.string().min(5, { message: "A descrição é obrigatória." }),
  permissions: z.array(z.string()).refine(value => value.some(item => item), {
    message: "Você deve selecionar pelo menos uma permissão.",
  }),
});

type CargoFormValues = z.infer<typeof formSchema>;

interface CargoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cargoToEdit: Cargo | null;
  onFormSubmit: (data: CargoFormValues) => void;
}

export const CargoFormDialog: React.FC<CargoFormDialogProps> = ({ open, onOpenChange, cargoToEdit, onFormSubmit }) => {
  const form = useForm<CargoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  });

  useEffect(() => {
    if (cargoToEdit) {
      form.reset({
        name: cargoToEdit.name,
        description: cargoToEdit.description,
        permissions: cargoToEdit.permissions,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        permissions: [],
      });
    }
  }, [cargoToEdit, open, form]);

  const dialogTitle = cargoToEdit ? 'Editar Cargo' : 'Novo Cargo';
  const dialogDescription = cargoToEdit
    ? 'Altere o nome, descrição e permissões deste cargo.'
    : 'Crie um novo cargo e defina suas permissões de acesso no sistema.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
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
                  <FormLabel>Nome do Cargo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Gerente de Logística" {...field} />
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
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descreva a responsabilidade deste cargo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Permissões</FormLabel>
                    <FormDescription>
                      Selecione as permissões que este cargo terá.
                    </FormDescription>
                  </div>
                  <ScrollArea className="h-72 w-full rounded-md border p-4">
                    <div className="space-y-4">
                        {PERMISSION_GROUPS.map((group) => (
                            <div key={group.groupName}>
                                <h4 className="font-semibold mb-2">{group.groupName}</h4>
                                <div className="space-y-2 pl-2">
                                {group.permissions.map((item) => (
                                    <FormField
                                    key={item.id}
                                    control={form.control}
                                    name="permissions"
                                    render={({ field }) => {
                                        return (
                                        <FormItem
                                            key={item.id}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                            <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(item.id)}
                                                onCheckedChange={(checked) => {
                                                return checked
                                                    ? field.onChange([...field.value, item.id])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                        (value) => value !== item.id
                                                        )
                                                    )
                                                }}
                                            />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                            {item.label}
                                            </FormLabel>
                                        </FormItem>
                                        )
                                    }}
                                    />
                                ))}
                                </div>
                            </div>
                        ))}
                    </div>
                  </ScrollArea>
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
