import React, { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Cliente } from '@/types';
import { useSettingsData } from '@/hooks/useSettingsData';

const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  tipo: z.enum(['pessoa_fisica', 'pessoa_juridica'], { required_error: "Selecione o tipo." }),
  cidade: z.string().min(2, { message: "A cidade é obrigatória." }),
  regionId: z.string().optional(),
  bairroId: z.string().min(1, { message: "O bairro é obrigatório." }),
  endereco: z.string().min(3, { message: "O endereço é obrigatório." }),
  uf: z.string().length(2, { message: "UF inválida." }),
  telefone: z.string().min(10, { message: "O telefone é obrigatório." }),
  email: z.string().email({ message: "Email inválido." }),
  chavePix: z.string().optional(),
  status: z.enum(['ativo', 'inativo'], { required_error: "Selecione o status." }),
  modalidade: z.enum(['pré-pago', 'faturado'], { required_error: "Selecione uma modalidade." }),
  ativarFaturamentoAutomatico: z.boolean().optional(),
  frequenciaFaturamento: z.enum(['diario', 'semanal', 'mensal', 'por_entrega']).optional(),
  numeroDeEntregasParaFaturamento: z.coerce.number().optional(),
  diaDaSemanaFaturamento: z.enum(['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']).optional(),
  diaDoMesFaturamento: z.coerce.number().optional(),
}).superRefine((data, ctx) => {
    if (data.modalidade === 'faturado' && data.ativarFaturamentoAutomatico) {
        if (!data.frequenciaFaturamento) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['frequenciaFaturamento'], message: 'A frequência é obrigatória.' });
        }
        if (data.frequenciaFaturamento === 'por_entrega' && (!data.numeroDeEntregasParaFaturamento || data.numeroDeEntregasParaFaturamento <= 0)) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['numeroDeEntregasParaFaturamento'], message: 'O nº de entregas deve ser maior que zero.' });
        }
        if (data.frequenciaFaturamento === 'semanal' && !data.diaDaSemanaFaturamento) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['diaDaSemanaFaturamento'], message: 'O dia da semana é obrigatório.' });
        }
        if (data.frequenciaFaturamento === 'mensal' && (!data.diaDoMesFaturamento || data.diaDoMesFaturamento < 1 || data.diaDoMesFaturamento > 31)) {
             ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['diaDoMesFaturamento'], message: 'O dia do mês deve ser entre 1 e 31.' });
        }
    }
});

type ClientFormValues = z.infer<typeof formSchema>;

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientToEdit: Cliente | null;
  onFormSubmit: (data: Omit<Cliente, 'id' | 'totalPedidos' | 'valorTotal' | 'bairro'> & { bairroId: string }) => void;
}

const diasDaSemana = {
    domingo: 'Domingo',
    segunda: 'Segunda-feira',
    terca: 'Terça-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sábado',
};

export const ClientFormDialog: React.FC<ClientFormDialogProps> = ({ open, onOpenChange, clientToEdit, onFormSubmit }) => {
  const { regions, bairros, loading: settingsLoading } = useSettingsData();
  
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '', tipo: 'pessoa_fisica', endereco: '', bairroId: '', cidade: 'São Paulo', uf: 'SP',
      telefone: '', email: '', chavePix: '', status: 'ativo', modalidade: 'faturado',
      ativarFaturamentoAutomatico: true, frequenciaFaturamento: 'mensal',
      numeroDeEntregasParaFaturamento: 10, diaDoMesFaturamento: 28, diaDaSemanaFaturamento: 'segunda',
    },
  });

  const modalidade = form.watch('modalidade');
  const ativarFaturamento = form.watch('ativarFaturamentoAutomatico');
  const frequenciaFaturamento = form.watch('frequenciaFaturamento');
  const selectedRegionId = form.watch('regionId');

  const filteredBairros = useMemo(() => {
    if (!selectedRegionId) return [];
    return bairros.filter(b => b.regionId === selectedRegionId);
  }, [bairros, selectedRegionId]);

  useEffect(() => {
    if (clientToEdit) {
      const bairro = bairros.find(b => b.nome === clientToEdit.bairro);
      const regionId = bairro?.regionId;
      form.reset({
          ...clientToEdit,
          bairroId: bairro?.id || '',
          regionId: regionId
      });
    } else {
      form.reset({
        nome: '', tipo: 'pessoa_fisica', endereco: '', bairroId: '', cidade: 'São Paulo', uf: 'SP',
        telefone: '', email: '', chavePix: '', status: 'ativo', modalidade: 'faturado',
        ativarFaturamentoAutomatico: true, frequenciaFaturamento: 'mensal',
        numeroDeEntregasParaFaturamento: 10, diaDoMesFaturamento: 28, diaDaSemanaFaturamento: 'segunda',
      });
    }
  }, [clientToEdit, open, form, bairros]);
  
  const handleFormSubmit = (data: ClientFormValues) => {
    const {bairroId, ...rest} = data;
    const bairro = bairros.find(b => b.id === bairroId);
    if(bairro) {
        onFormSubmit({...rest, bairro: bairro.nome, bairroId});
    }
  }

  const dialogTitle = clientToEdit ? 'Editar Cliente' : 'Cadastrar Novo Cliente';
  const dialogDescription = 'Preencha as informações abaixo para cadastrar um novo cliente no sistema.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <div className="grid max-h-[70vh] gap-6 overflow-y-auto p-1 pr-4">
              
              <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium">Configuração de Faturamento</h4>
                  <FormField control={form.control} name="modalidade" render={({ field }) => (<FormItem><FormLabel>Modalidade de Pagamento</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="pré-pago">Pré-pago</SelectItem><SelectItem value="faturado">Faturado (Pós-pago)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  {modalidade === 'faturado' && (
                    <>
                      <FormField control={form.control} name="ativarFaturamentoAutomatico" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md py-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Ativar fechamento automático de fatura</FormLabel></div></FormItem>)} />
                      {ativarFaturamento && (
                        <div className="space-y-4 rounded-md border p-4">
                            <FormField control={form.control} name="frequenciaFaturamento" render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>Frequência de fechamento:</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="diario" /></FormControl><FormLabel className="font-normal">Diário</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="semanal" /></FormControl><FormLabel className="font-normal">Semanal</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="mensal" /></FormControl><FormLabel className="font-normal">Mensal</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="por_entrega" /></FormControl><FormLabel className="font-normal">Por Nº de Entregas</FormLabel></FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />

                            {frequenciaFaturamento === 'semanal' && (
                                <FormField control={form.control} name="diaDaSemanaFaturamento" render={({ field }) => (
                                    <FormItem><FormLabel>Dia da Semana para Fechamento</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o dia" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {Object.entries(diasDaSemana).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select><FormMessage />
                                </FormItem>
                                )} />
                            )}

                            {frequenciaFaturamento === 'mensal' && (
                                <FormField control={form.control} name="diaDoMesFaturamento" render={({ field }) => (
                                    <FormItem><FormLabel>Dia do Mês para Fechamento</FormLabel>
                                    <FormControl><Input type="number" min="1" max="31" placeholder="Ex: 28" {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )} />
                            )}
                            
                            {frequenciaFaturamento === 'por_entrega' && (
                                <FormField control={form.control} name="numeroDeEntregasParaFaturamento" render={({ field }) => (
                                    <FormItem><FormLabel>Nº de Entregas para Fechamento</FormLabel>
                                    <FormControl><Input type="number" placeholder="Ex: 15" {...field} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )} />
                            )}
                        </div>
                      )}
                    </>
                  )}
              </div>

              <div className="space-y-4">
                  <FormField control={form.control} name="nome" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Nome do cliente ou empresa" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="tipo" render={({ field }) => (<FormItem><FormLabel>Tipo</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl><SelectContent><SelectItem value="pessoa_fisica">Pessoa Física</SelectItem><SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="cidade" render={({ field }) => (<FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="uf" render={({ field }) => (<FormItem><FormLabel>UF</FormLabel><FormControl><Input {...field} maxLength={2} /></FormControl><FormMessage /></FormItem>)} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="regionId" render={({ field }) => (<FormItem><FormLabel>Região</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione a região"/></SelectTrigger></FormControl><SelectContent>{regions.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="bairroId" render={({ field }) => (<FormItem><FormLabel>Bairro</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedRegionId}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o bairro"/></SelectTrigger></FormControl><SelectContent>{filteredBairros.map(b => <SelectItem key={b.id} value={b.id}>{b.nome}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                  </div>

                  <FormField control={form.control} name="endereco" render={({ field }) => (<FormItem><FormLabel>Endereço</FormLabel><FormControl><Input placeholder="Rua, número, complemento" {...field} /></FormControl><FormMessage /></FormItem>)} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="telefone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(11) 99999-9999" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>E-mail</FormLabel><FormControl><Input type="email" placeholder="contato@exemplo.com.br" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={form.control} name="chavePix" render={({ field }) => (<FormItem><FormLabel>Chave Pix</FormLabel><FormControl><Input placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="ativo">Ativo</SelectItem><SelectItem value="inativo">Inativo</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              </div>
            </div>
            <DialogFooter className="pt-6">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">{clientToEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
