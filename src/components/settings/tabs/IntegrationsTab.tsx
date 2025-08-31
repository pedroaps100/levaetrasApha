import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";

const stripeSchema = z.object({
  publishableKey: z.string().startsWith('pk_').min(10, "Chave inválida.").or(z.literal('')),
  secretKey: z.string().startsWith('sk_').min(10, "Chave inválida.").or(z.literal('')),
});

const googleMapsSchema = z.object({
  apiKey: z.string().min(20, "Chave de API inválida.").or(z.literal('')),
});

const whatsappSchema = z.object({
  token: z.string().min(20, "Token inválido.").or(z.literal('')),
  phoneNumberId: z.string().min(10, "ID inválido.").or(z.literal('')),
});

export const IntegrationsTab = () => {
  const stripeForm = useForm<z.infer<typeof stripeSchema>>({
    resolver: zodResolver(stripeSchema),
    defaultValues: { publishableKey: '', secretKey: '' },
  });

  const googleMapsForm = useForm<z.infer<typeof googleMapsSchema>>({
    resolver: zodResolver(googleMapsSchema),
    defaultValues: { apiKey: '' },
  });
  
  const whatsappForm = useForm<z.infer<typeof whatsappSchema>>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: { token: '', phoneNumberId: '' },
  });

  const onSave = (service: string) => {
    toast.success(`Configurações da integração ${service} salvas com sucesso!`);
  };

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Gateways de Pagamento</CardTitle>
          <CardDescription>Conecte com Stripe ou Mercado Pago para processar pagamentos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...stripeForm}>
            <form onSubmit={stripeForm.handleSubmit(() => onSave('Stripe'))} className="space-y-4">
              <h3 className="font-semibold">Stripe</h3>
              <FormField
                control={stripeForm.control}
                name="publishableKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave Publicável (Publishable Key)</FormLabel>
                    <FormControl><Input placeholder="pk_live_..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={stripeForm.control}
                name="secretKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave Secreta (Secret Key)</FormLabel>
                    <FormControl><Input type="password" placeholder="sk_live_..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="self-start">Salvar Configuração do Stripe</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Geolocalização</CardTitle>
          <CardDescription>Integre com o Google Maps para otimização de rotas e rastreamento.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...googleMapsForm}>
            <form onSubmit={googleMapsForm.handleSubmit(() => onSave('Google Maps'))} className="space-y-4">
              <FormField
                control={googleMapsForm.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave de API do Google Maps</FormLabel>
                    <FormControl><Input type="password" placeholder="AIzaSy..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="self-start">Salvar Chave do Google Maps</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Notificações via WhatsApp</CardTitle>
          <CardDescription>Configure a API do WhatsApp para enviar notificações automáticas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...whatsappForm}>
            <form onSubmit={whatsappForm.handleSubmit(() => onSave('WhatsApp'))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={whatsappForm.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token de Acesso</FormLabel>
                      <FormControl><Input type="password" placeholder="EAA..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={whatsappForm.control}
                  name="phoneNumberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID do Número de Telefone (Phone Number ID)</FormLabel>
                      <FormControl><Input placeholder="100..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="self-start">Salvar Configuração do WhatsApp</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
