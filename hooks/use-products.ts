import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, Category, ProductFilters, PaginatedResponse, ApiResponse } from '@/types';

// Helper to build query params
function buildQueryParams(filters: ProductFilters = {}): string {
  const params = new URLSearchParams();
  
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.category) params.set('category', filters.category);
  if (filters.isOrganic !== undefined) params.set('isOrganic', String(filters.isOrganic));
  if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive));
  if (filters.isFeatured !== undefined) params.set('isFeatured', String(filters.isFeatured));
  if (filters.inStock !== undefined) params.set('inStock', String(filters.inStock));
  if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  if (filters.search) params.set('search', filters.search);
  
  return params.toString();
}

// Fetch all products with optional filtering
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const query = buildQueryParams(filters);
      const res = await fetch(`/api/products${query ? `?${query}` : ''}`);
      const data: PaginatedResponse<Product> = await res.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch products');
      }
      
      return data.data || [];
    },
  });
}

// Fetch single product by ID or slug
export function useProduct(idOrSlug: string | null) {
  return useQuery({
    queryKey: ['products', idOrSlug],
    queryFn: async () => {
      if (!idOrSlug) throw new Error('Product ID is required');
      
      const res = await fetch(`/api/products/${idOrSlug}`);
      const data: ApiResponse<Product> = await res.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch product');
      }
      
      return data.data;
    },
    enabled: !!idOrSlug,
  });
}

// Create new product (admin)
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      
      const data: ApiResponse<Product> = await res.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to create product');
      }
      
      return data.data;
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
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      
      const data: ApiResponse<Product> = await res.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to update product');
      }
      
      return data.data;
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
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      
      const data: ApiResponse<null> = await res.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to delete product');
      }
      
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ============================================
// CATEGORIES
// ============================================

// Fetch all categories
export function useCategories(activeOnly = true) {
  return useQuery({
    queryKey: ['categories', { activeOnly }],
    queryFn: async () => {
      const res = await fetch(`/api/categories?activeOnly=${activeOnly}`);
      const data: ApiResponse<Category[]> = await res.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch categories');
      }
      
      return data.data || [];
    },
  });
}

// Fetch single category
export function useCategory(idOrSlug: string | null) {
  return useQuery({
    queryKey: ['categories', idOrSlug],
    queryFn: async () => {
      if (!idOrSlug) throw new Error('Category ID is required');
      
      const res = await fetch(`/api/categories/${idOrSlug}`);
      const data: ApiResponse<Category> = await res.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch category');
      }
      
      return data.data;
    },
    enabled: !!idOrSlug,
  });
}
