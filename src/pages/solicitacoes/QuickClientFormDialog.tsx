import React, { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettingsData } from '@/hooks/useSettingsData';
import { Cliente } from '@/types';

const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  telefone: z.string().min(10, { message: "O telefone é obrigatório." }),
  cidade: z.string().min(2, { message: "A cidade é obrigatória." }),
  regionId: z.string().optional(),
  bairroId: z.string().min(1, { message: "O bairro é obrigatório." }),
  endereco: z.string().min(3, { message: "O endereço é obrigatório." }),
  uf: z.string().length(2, { message: "UF inválida." }),
});

type QuickClientFormValues = z.infer<typeof formSchema>;

interface QuickClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFormSubmit: (data: Omit<Cliente, 'id' | 'totalPedidos' | 'valorTotal' | 'bairro'>) => void;
}

export const QuickClientFormDialog: React.FC<QuickClientFormDialogProps> = ({ open, onOpenChange, onFormSubmit }) => {
  const { regions, bairros, loading: settingsLoading } = useSettingsData();
  
  const form = useForm<QuickClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      telefone: '',
      cidade: 'São Paulo',
      uf: 'SP',
      regionId: '',
      bairroId: '',
      endereco: '',
    },
  });

  const selectedRegionId = form.watch('regionId');

  const filteredBairros = useMemo(() => {
    if (!selectedRegionId) return [];
    return bairros.filter(b => b.regionId === selectedRegionId);
  }, [bairros, selectedRegionId]);
  
  useEffect(() => {
    form.reset();
  }, [open, form]);

  const handleFormSubmit = (data: QuickClientFormValues) => {
    const bairro = bairros.find(b => b.id === data.bairroId);
    if (bairro) {
      onFormSubmit({
        ...data,
        bairro: bairro.nome,
        email: `${data.nome.split(' ')[0].toLowerCase()}@empresa.com`, // Placeholder email
        tipo: 'pessoa_fisica',
        status: 'ativo',
        modalidade: 'pré-pago', // Default to pre-paid
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastro Rápido de Cliente</DialogTitle>
          <DialogDescription>Cadastre um novo cliente com as informações essenciais.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="nome" render={({ field }) => (<FormItem><FormLabel>Nome do Cliente</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="telefone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="cidade" render={({ field }) => (<FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="uf" render={({ field }) => (<FormItem><FormLabel>UF</FormLabel><FormControl><Input {...field} maxLength={2} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="regionId" render={({ field }) => (<FormItem><FormLabel>Região</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger></FormControl><SelectContent>{regions.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="bairroId" render={({ field }) => (<FormItem><FormLabel>Bairro</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedRegionId}><FormControl><SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger></FormControl><SelectContent>{filteredBairros.map(b => <SelectItem key={b.id} value={b.id}>{b.nome}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
            </div>

            <FormField control={form.control} name="endereco" render={({ field }) => (<FormItem><FormLabel>Endereço</FormLabel><FormControl><Input placeholder="Rua, número, complemento" {...field} /></FormControl><FormMessage /></FormItem>)} />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Salvar Cliente</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
