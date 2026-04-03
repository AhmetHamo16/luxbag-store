import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAvailableStock } from '../utils/stock';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      addItem: (product, quantity = 1, selectedColor = null) => {
        const currentItems = get().items;
        const productId = product._id || product.id;
        const maxAvailable = getAvailableStock(product, product.selectedVariant || null) || Infinity;
        const existingItemIndex = currentItems.findIndex(
          item => (item._id === productId || item.id === productId) && item.selectedColor === selectedColor
        );
        
        if (existingItemIndex > -1) {
          const newItems = [...currentItems];
          newItems[existingItemIndex].quantity = Math.min(newItems[existingItemIndex].quantity + quantity, maxAvailable);
          set({ items: newItems });
        } else {
          set({ items: [...currentItems, { ...product, quantity: Math.min(quantity, maxAvailable), selectedColor }] });
        }
      },
      
      removeItem: (productId, selectedColor = null) => {
        set({
          items: get().items.filter(item => {
            const idMatch = (item._id === productId || item.id === productId);
            const colorMatch = item.selectedColor === selectedColor;
            return !(idMatch && colorMatch);
          })
        });
      },
      
      updateQuantity: (productId, quantity, selectedColor = null) => {
        set({
          items: get().items.map(item => {
            const idMatch = (item._id === productId || item.id === productId);
            const colorMatch = item.selectedColor === selectedColor;
            if (idMatch && colorMatch) {
              const maxAvailable = getAvailableStock(item, item.selectedVariant || null) || Infinity;
              return { ...item, quantity: Math.max(1, Math.min(quantity, maxAvailable)) };
            }
            return item;
          })
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'melora-cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore;
