import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';

interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find(item => item.id === product.id);
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },
      
      removeItem: (productId) => {
        set({
          items: get().items.filter(item => item.id !== productId)
        });
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.id === productId
              ? { ...item, quantity }
              : item
          )
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      get total() {
        return get().items.reduce(
          (total, item) => total + (item.price * (1 - (item.discount || 0) / 100)) * item.quantity,
          0
        );
      }
    }),
    {
      name: 'shopping-cart',
      skipHydration: true,
    }
  )
);
