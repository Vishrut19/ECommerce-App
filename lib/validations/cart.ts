import { z } from 'zod';

// Schema for cart item attributes
export const cartItemAttributesSchema = z.record(z.string(), z.string());

// Schema for adding an item to cart
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive().default(1),
  selectedAttributes: cartItemAttributesSchema.optional().default({}),
});

// Schema for updating cart item quantity
export const updateCartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(0),
  selectedAttributes: cartItemAttributesSchema.optional().default({}),
});

// Schema for removing item from cart
export const removeFromCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  selectedAttributes: cartItemAttributesSchema.optional().default({}),
});

// Cart item response type
export interface CartItemResponse {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  currency: string;
  selectedAttributes: Record<string, string>;
  imageUrl?: string;
}

// Cart response type
export interface CartResponse {
  items: CartItemResponse[];
  total: number;
  currency: string;
  itemCount: number;
}

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;
