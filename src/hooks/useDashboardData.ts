import { useState, useEffect } from 'react';
import { DashboardMetrics, Conta, Fatura } from '@/types';
import { faker } from '@faker-js/faker';
import { subDays, addDays } from 'date-fns';

const generateMockContas = (): Conta[] => [
    {
      id: faker.string.uuid(),
      fornecedor: 'Oficina do João',
      descricao: 'Manutenção da Moto #M001',
      valor: 450.00,
      vencimento: subDays(new Date(), 2),
      status: 'atrasado',
      categoria: 'Manutenção',
      novo: true,
    },
    {
      id: faker.string.uuid(),
      fornecedor: 'Posto Central',
      descricao: 'Combustível - Maio',
      valor: 1250.00,
      vencimento: addDays(new Date(), 3),
      status: 'pendente',
      categoria: 'Combustível',
      novo: true,
    },
    {
      id: faker.string.uuid(),
      fornecedor: 'Seguros SA',
      descricao: 'Apólice #APL-003',
      valor: 850.75,
      vencimento: addDays(new Date(), 15),
      status: 'pendente',
      categoria: 'Seguro',
      novo: false,
    },
    {
        id: faker.string.uuid(),
        fornecedor: 'Web Hosting Inc.',
        descricao: 'Servidor Dedicado',
        valor: 320.00,
        vencimento: addDays(new Date(), 25),
        status: 'pendente',
        categoria: 'Tecnologia',
        novo: false,
    }
];

const generateMockFaturas = (): Fatura[] => [
    {
        id: faker.string.uuid(),
        cliente: 'Padaria Pão Quente',
        valor: 350.80,
        vencimento: subDays(new Date(), 5),
        status: 'vencida',
        descricao: 'Fatura de Julho/2025',
    },
    {
        id: faker.string.uuid(),
        cliente: 'Restaurante Sabor Divino',
        valor: 820.00,
        vencimento: subDays(new Date(), 1),
        status: 'vencida',
        descricao: 'Fatura de Julho/2025',
    },
     {
        id: faker.string.uuid(),
        cliente: 'Floricultura Flores Belas',
        valor: 210.40,
        vencimento: addDays(new Date(), 10),
        status: 'aguardando',
        descricao: 'Fatura de Agosto/2025',
    },
];

export const useDashboardData = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [contas, setContas] = useState<Conta[]>([]);
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMetrics: DashboardMetrics = {
        contasAPagar: {
          total: 1,
          atrasadas: 1,
          valor: 2870.00
        },
        faturas: {
          vencidas: 2,
          valor: 1170.80,
          pendentes: 1
        },
        entregas: {
          hoje: 5,
          media: 37,
          emAndamento: 2
        },
        taxas: {
          recebidas: 2,
          valorLiquido: 30.50
        },
        solicitacoes: {
          pendentes: 2,
          emAnalise: 0
        }
      };

      setMetrics(mockMetrics);
      setContas(generateMockContas());
      setFaturas(generateMockFaturas());
      setLoading(false);
    };

    loadData();
  }, []);

  return { metrics, contas, faturas, loading };
};
