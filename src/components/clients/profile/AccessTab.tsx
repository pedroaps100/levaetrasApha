import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSettingsData } from '@/hooks/useSettingsData';
import { Cliente } from '@/types';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface AccessTabProps {
  client: Cliente;
}

const passwordSchema = z.object({
  password: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres."),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

export const AccessTab: React.FC<AccessTabProps> = ({ client }) => {
  const { users, updateUser } = useSettingsData();
  const clientUser = users.find(u => u.email === client.email && u.role === 'cliente');

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: z.infer<typeof passwordSchema>) => {
    if (!clientUser) {
      toast.error("Usuário de acesso para este cliente não encontrado.");
      return;
    }
    updateUser(clientUser.id, { password: data.password });
    toast.success("Senha de acesso do cliente atualizada com sucesso!");
    form.reset();
  };

  if (!clientUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Acesso</CardTitle>
          <CardDescription>
            Defina o e-mail e a senha para o cliente acessar o painel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            Não foi encontrado um usuário de acesso correspondente ao e-mail deste cliente ({client.email}). 
            Por favor, crie um usuário em Configurações &gt; Usuários com o perfil "Cliente" para habilitar o acesso.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Acesso</CardTitle>
        <CardDescription>
          Defina o e-mail e a senha para o cliente acessar o painel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="email">Email de Acesso</Label>
              <Input id="email" value={client.email} disabled />
              <p className="text-sm text-muted-foreground">
                O e-mail de acesso é o mesmo do cadastro do cliente.
              </p>
            </div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nova Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Salvar Nova Senha</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
