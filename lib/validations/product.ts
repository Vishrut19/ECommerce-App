import { z } from 'zod';

// Attribute item schema
const attributeItemSchema = z.object({
  id: z.string().min(1, 'Item ID is required'),
  displayValue: z.string().min(1, 'Display value is required'),
  value: z.string().min(1, 'Value is required'),
});

// Attribute set schema
const attributeSetSchema = z.object({
  id: z.string().min(1, 'Attribute ID is required'),
  name: z.string().min(1, 'Attribute name is required'),
  type: z.enum(['text', 'swatch'], {
    errorMap: () => ({ message: 'Type must be either text or swatch' }),
  }),
  items: z.array(attributeItemSchema).min(1, 'At least one attribute item is required'),
});

// Product form schema
export const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Name is too long'),
  brand: z.string().min(1, 'Brand is required').max(50, 'Brand name is too long'),
  category: z.enum(['tech', 'clothes'], {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  inStock: z.boolean(),
  priceUSD: z.number().min(0.01, 'Price must be greater than 0'),
  gallery: z.array(z.string().url('Must be a valid URL')).min(1, 'At least one image is required'),
  attributes: z.array(attributeSetSchema).optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
