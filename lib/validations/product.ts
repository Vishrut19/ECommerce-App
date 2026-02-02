import { z } from 'zod';

// Unit type enum matching Prisma schema
export const unitTypeSchema = z.enum(['KG', 'TON', 'BAG', 'CRATE', 'DOZEN', 'PIECE', 'LITER']);

// Product form schema for AgroOrder
export const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name is too long'),
  slug: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  pricePerUnit: z.number().min(0.01, 'Price must be greater than 0'),
  unitType: unitTypeSchema,
  minOrderQty: z.number().int().min(1, 'Minimum order quantity must be at least 1'),
  stockQty: z.number().int().min(0, 'Stock cannot be negative'),
  supplierName: z.string().optional(),
  isOrganic: z.boolean(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  lowStockAlert: z.number().int().min(0),
  images: z.array(z.string()).optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

// Category form schema
export const categoryFormSchema = z.object({
  name: z.string().min(1, 'Slug name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  icon: z.string().optional(),
  description: z.string().optional(),
  isOrganic: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
