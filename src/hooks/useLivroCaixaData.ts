import { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { faker } from '@faker-js/faker';

const generateMockTransactions = (count: number): Transaction[] => {
    const transactions: Transaction[] = [];
    const origins: Transaction['origin'][] = ['recharge_pix', 'recharge_card', 'recharge_manual', 'delivery_fee', 'cancellation_fee'];

    for (let i = 0; i < count; i++) {
        const origin = faker.helpers.arrayElement(origins);
        const type = origin.startsWith('recharge') ? 'credit' : 'debit';
        const clientName = faker.company.name();
        
        let description = '';
        switch(origin) {
            case 'recharge_pix': description = 'Recarga via Pix'; break;
            case 'recharge_card': description = 'Recarga via Cartão'; break;
            case 'recharge_manual': description = 'Crédito Manual (Bônus)'; break;
            case 'delivery_fee': description = `Entrega #${faker.string.numeric(4)}`; break;
            case 'cancellation_fee': description = 'Taxa de Cancelamento'; break;
        }

        transactions.push({
            id: faker.string.uuid(),
            date: faker.date.recent({ days: 90 }),
            type,
            origin,
            description,
            value: faker.number.float({ min: 5, max: 250, multipleOf: 0.5 }),
            clientName,
            clientAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${clientName.replace(/\s/g, '+')}`,
        });
    }

    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const useLivroCaixaData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTransactions(generateMockTransactions(50));
      setLoading(false);
    };
    loadData();
  }, []);

  return { transactions, loading };
};
