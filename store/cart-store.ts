import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// AgroOrder Cart Store
// Simplified for B2B wholesale ordering

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  unitType: string;
  minOrderQty: number;
}

interface Currency {
  label: string;
  symbol: string;
}

interface CartStore {
  items: CartItem[];
  selectedCurrency: Currency;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  setCurrency: (currency: Currency) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      selectedCurrency: { label: 'INR', symbol: '₹' },

      addItem: (item) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId
          );

          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity = item.quantity;
            return { items: newItems };
          }

          return { items: [...state.items, item] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.productId !== productId),
            };
          }

          return {
            items: state.items.map((item) =>
              item.productId === productId ? { ...item, quantity } : item
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.pricePerUnit * item.quantity,
          0
        );
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      setCurrency: (currency) => set({ selectedCurrency: currency }),
    }),
    {
      name: 'agroorder-cart',
    }
  )
);
