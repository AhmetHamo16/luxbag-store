import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (product) => {
        const { items } = get();
        const productId = product._id || product.id;
        const exists = items.find(item => (item._id || item.id) === productId);
        if (exists) {
          set({ items: items.filter(item => (item._id || item.id) !== productId) });
        } else {
          set({ items: [...items, product] });
        }
      },
      isInWishlist: (productId) => {
        return get().items.some(item => (item._id || item.id) === productId);
      }
    }),
    {
      name: 'melora-wishlist',
    }
  )
);

export default useWishlistStore;
