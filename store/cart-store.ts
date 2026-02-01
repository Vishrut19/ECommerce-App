import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, Currency } from '@/types';

interface CartStore {
  items: CartItem[];
  selectedCurrency: Currency;
  
  // Cart operations
  addItem: (product: Product, selectedAttributes: Record<string, string>) => void;
  removeItem: (productId: string, selectedAttributes: Record<string, string>) => void;
  updateQuantity: (productId: string, selectedAttributes: Record<string, string>, quantity: number) => void;
  clearCart: () => void;
  
  // Currency operations
  setSelectedCurrency: (currency: Currency) => void;
  
  // Computed values
  getTotal: () => number;
  getItemCount: () => number;
}

// Helper to create a unique key for cart items
const getItemKey = (productId: string, selectedAttributes: Record<string, string>) => {
  return `${productId}-${JSON.stringify(selectedAttributes)}`;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      selectedCurrency: { label: 'USD', symbol: '$' },
      
      addItem: (product, selectedAttributes) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              JSON.stringify(item.selectedAttributes) === JSON.stringify(selectedAttributes)
          );
          
          if (existingItemIndex > -1) {
            // Item exists, increase quantity
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += 1;
            return { items: newItems };
          } else {
            // New item
            return {
              items: [...state.items, { product, selectedAttributes, quantity: 1 }],
            };
          }
        });
      },
      
      removeItem: (productId, selectedAttributes) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.product.id === productId &&
                JSON.stringify(item.selectedAttributes) === JSON.stringify(selectedAttributes)
              )
          ),
        }));
      },
      
      updateQuantity: (productId, selectedAttributes, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            return {
              items: state.items.filter(
                (item) =>
                  !(
                    item.product.id === productId &&
                    JSON.stringify(item.selectedAttributes) === JSON.stringify(selectedAttributes)
                  )
              ),
            };
          }
          
          const newItems = state.items.map((item) =>
            item.product.id === productId &&
            JSON.stringify(item.selectedAttributes) === JSON.stringify(selectedAttributes)
              ? { ...item, quantity }
              : item
          );
          
          return { items: newItems };
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      setSelectedCurrency: (currency) => set({ selectedCurrency: currency }),
      
      getTotal: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          const price = item.product.prices.find(
            (p) => p.currency.label === state.selectedCurrency.label
          );
          return total + (price?.amount || 0) * item.quantity;
        }, 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
