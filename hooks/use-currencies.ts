import { useQuery } from '@tanstack/react-query';
import { Currency } from '@/types';
import { apiClient } from '@/lib/api-client';

export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: () => apiClient<Currency[]>('/api/currencies'),
    staleTime: 10 * 60 * 1000, // 10 minutes - currencies rarely change
  });
}
