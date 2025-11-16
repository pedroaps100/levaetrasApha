import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSettingsData } from '@/hooks/useSettingsData';
import { Entregador } from '@/types';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface AccessTabProps {
  entregador: Entregador;
}

const passwordSchema = z.object({
  password: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres."),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

export const AccessTab: React.FC<AccessTabProps> = ({ entregador }) => {
  const { users, updateUser } = useSettingsData();
  const entregadorUser = users.find(u => u.email === entregador.email && u.role === 'entregador');

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: z.infer<typeof passwordSchema>) => {
    if (!entregadorUser) {
      toast.error("Usuário de acesso para este entregador não encontrado.");
      return;
    }
    updateUser(entregadorUser.id, { password: data.password });
    toast.success("Senha de acesso do entregador atualizada com sucesso!");
    form.reset();
  };

  if (!entregadorUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Acesso</CardTitle>
          <CardDescription>
            Defina o e-mail e a senha para o entregador acessar o aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            Não foi encontrado um usuário de acesso correspondente ao e-mail deste entregador ({entregador.email}). 
            Por favor, crie um usuário em Configurações &gt; Usuários com o perfil "Entregador" para habilitar o acesso.
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
          Defina o e-mail e a senha para o entregador acessar o aplicativo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="email">Email de Acesso</Label>
              <Input id="email" value={entregador.email} disabled />
              <p className="text-sm text-muted-foreground">
                O e-mail de acesso é o mesmo do cadastro do entregador.
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
