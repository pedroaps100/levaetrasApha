import { useFaturas } from '@/contexts/FaturasContext';

// This hook now simply consumes the context, maintaining the interface for existing components
export const useFaturasData = () => {
    return useFaturas();
};
