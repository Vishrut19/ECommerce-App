import { useQuery } from '@tanstack/react-query';
import { Category } from '@/types';
import { apiClient } from '@/lib/api-client';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient<Category[]>('/api/categories'),
    staleTime: 5 * 60 * 1000, // 5 minutes - categories don't change often
  });
}
