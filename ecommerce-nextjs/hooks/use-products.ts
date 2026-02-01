import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product } from '@/types';
import { apiClient } from '@/lib/api-client';

// Fetch all products with optional filtering
export function useProducts(category?: string, inStock?: boolean) {
  return useQuery({
    queryKey: ['products', { category, inStock }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (inStock !== undefined) params.set('inStock', String(inStock));
      
      const query = params.toString();
      return apiClient<Product[]>(`/api/products${query ? `?${query}` : ''}`);
    },
  });
}

// Fetch single product by ID
export function useProduct(id: string | null) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required');
      return apiClient<Product>(`/api/products/${id}`);
    },
    enabled: !!id,
  });
}

// Create new product (admin)
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      return apiClient<Product>('/api/products', {
        method: 'POST',
        body: JSON.stringify(product),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Update product (admin)
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      return apiClient<Product>(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
    },
  });
}

// Delete product (admin)
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient<null>(`/api/products/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
