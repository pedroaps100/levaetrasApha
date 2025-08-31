import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Fatura } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useSettingsData } from '@/hooks/useSettingsData';
import { toast } from 'sonner';

const formSchema = z.object({
  dataPagamento: z.date({ required_error: 'A data do pagamento é obrigatória.' }),
  metodoPagamentoId: z.string({ required_error: 'O método de pagamento é obrigatório.' }),
  valorPago: z.coerce.number().positive('O valor pago deve ser maior que zero.'),
  numeroComprovante: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RegistrarPagamentoTaxaModalProps {
  isOpen: boolean;
  onClose: () => void;
  fatura: Fatura | null;
  onSuccess: () => void;
}

export const RegistrarPagamentoTaxaModal: React.FC<RegistrarPagamentoTaxaModalProps> = ({ isOpen, onClose, fatura, onSuccess }) => {
  const { enabledPaymentMethods } = useSettingsData();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataPagamento: new Date(),
      metodoPagamentoId: '',
      valorPago: fatura?.valorTaxas || 0,
      numeroComprovante: '',
      observacoes: '',
    },
  });

  useEffect(() => {
    if (fatura) {
      form.reset({
        dataPagamento: new Date(),
        metodoPagamentoId: '',
        valorPago: fatura.valorTaxas,
        numeroComprovante: '',
        observacoes: '',
      });
    }
  }, [fatura, form, isOpen]);

  const watchedValues = form.watch();

  const onSubmit = (data: FormValues) => {
    console.log('Payment data:', data);
    toast.success(`Pagamento da fatura ${fatura?.numero} registrado com sucesso!`);
    onSuccess();
  };

  if (!fatura) return null;

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento de Taxa</DialogTitle>
          <DialogDescription>Registrar o pagamento da taxa da fatura {fatura.numero}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="max-h-[70vh] overflow-y-auto p-1 pr-4 space-y-6">
              <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                <h3 className="font-semibold">Informações da Fatura</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cliente</p>
                    <p className="font-medium">{fatura.clienteNome}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Número da Fatura</p>
                    <p className="font-medium">{fatura.numero}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor da Taxa</p>
                    <p className="font-medium text-primary">{formatCurrency(fatura.valorTaxas)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="dataPagamento" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Data do Pagamento *</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "dd/MM/yyyy") : <span>Selecione a data</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="metodoPagamentoId" render={({ field }) => (
                    <FormItem><FormLabel>Método de Pagamento *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o método" /></SelectTrigger></FormControl><SelectContent>{enabledPaymentMethods.map(pm => (<SelectItem key={pm.id} value={pm.id}>{pm.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="valorPago" render={({ field }) => (<FormItem><FormLabel>Valor Pago *</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="numeroComprovante" render={({ field }) => (<FormItem><FormLabel>Número do Comprovante</FormLabel><FormControl><Input placeholder="Ex: #PAG-2025-0001" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormItem>
                <FormLabel>Anexar Comprovante</FormLabel>
                <div className="flex items-center gap-4">
                    <Button type="button" variant="outline">Escolher ficheiro</Button>
                    <span className="text-sm text-muted-foreground">Nenhum ficheiro selecionado</span>
                </div>
                <p className="text-xs text-muted-foreground">Formatos aceitos: PDF, JPG, PNG (máx. 5MB)</p>
              </FormItem>
              <FormField control={form.control} name="observacoes" render={({ field }) => (<FormItem><FormLabel>Observações</FormLabel><FormControl><Textarea placeholder="Informações adicionais sobre o pagamento..." {...field} /></FormControl><FormMessage /></FormItem>)} />
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                <h3 className="font-semibold text-blue-800">Resumo do Pagamento</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div><p className="text-muted-foreground">Valor Original:</p><p className="font-medium">{formatCurrency(fatura.valorTaxas)}</p></div>
                    <div><p className="text-muted-foreground">Valor a Pagar:</p><p className="font-medium">{formatCurrency(watchedValues.valorPago || 0)}</p></div>
                    <div><p className="text-muted-foreground">Método:</p><p className="font-medium">{enabledPaymentMethods.find(pm => pm.id === watchedValues.metodoPagamentoId)?.name || 'Não selecionado'}</p></div>
                    <div><p className="text-muted-foreground">Data:</p><p className="font-medium">{watchedValues.dataPagamento ? format(watchedValues.dataPagamento, 'dd/MM/yyyy') : 'Não selecionada'}</p></div>
                </div>
              </div>
            </div>
            <DialogFooter className="pt-6">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white"><CheckSquare className="mr-2 h-4 w-4" />Confirmar Pagamento</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
