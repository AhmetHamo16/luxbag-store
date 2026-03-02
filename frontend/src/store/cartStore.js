import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1, selectedColor = null) => {
        const currentItems = get().items;
        const productId = product._id || product.id;
        const existingItemIndex = currentItems.findIndex(
          item => (item._id === productId || item.id === productId) && item.selectedColor === selectedColor
        );
        
        if (existingItemIndex > -1) {
          const newItems = [...currentItems];
          newItems[existingItemIndex].quantity += quantity;
          set({ items: newItems });
        } else {
          set({ items: [...currentItems, { ...product, quantity, selectedColor }] });
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
              return { ...item, quantity };
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
    }
  )
);

export default useCartStore;
