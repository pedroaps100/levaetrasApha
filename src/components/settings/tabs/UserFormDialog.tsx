import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Cargo } from '@/types';
import { useSettingsData } from '@/hooks/useSettingsData';

const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  role: z.enum(['admin', 'entregador', 'cliente'], { required_error: "Selecione um perfil." }),
  cargoId: z.string().optional(),
});

type UserFormValues = z.infer<typeof formSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit: User | null;
  onFormSubmit: (data: UserFormValues) => void;
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({ open, onOpenChange, userToEdit, onFormSubmit }) => {
  const { cargos } = useSettingsData();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      role: 'entregador',
      cargoId: '',
    },
  });

  const role = form.watch('role');

  useEffect(() => {
    if (userToEdit) {
      form.reset({
        nome: userToEdit.nome,
        email: userToEdit.email,
        role: userToEdit.role,
        cargoId: userToEdit.cargoId || '',
      });
    } else {
      form.reset({
        nome: '',
        email: '',
        role: 'entregador',
        cargoId: '',
      });
    }
  }, [userToEdit, open, form]);

  const dialogTitle = userToEdit ? 'Editar Usuário' : 'Convidar Novo Usuário';
  const dialogDescription = userToEdit
    ? 'Altere os dados do usuário abaixo.'
    : 'Preencha os dados para enviar um convite.';

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
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Ex: joao.silva@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil de Acesso</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrativo</SelectItem>
                      <SelectItem value="entregador">Entregador</SelectItem>
                      <SelectItem value="cliente">Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {role === 'admin' && (
                 <FormField
                    control={form.control}
                    name="cargoId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cargo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um cargo" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {cargos.map(cargo => (
                                    <SelectItem key={cargo.id} value={cargo.id}>{cargo.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}
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
