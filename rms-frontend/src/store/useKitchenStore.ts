import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { KitchenOrder, KitchenStatus } from '../types';
import { api } from '../services/api';

// Ignore list responses that started before a kitchen mutation.
let kitchenMutationVersion = 0;

interface KitchenStore {
  orders: KitchenOrder[];
  isLoading: boolean;
  error: string;
  setStorageScope: (scope: string) => void;
  fetchKitchenOrders: () => Promise<void>;
  resetTenantData: () => void;
  addOrder: (order: KitchenOrder) => void;
  updateOrderStatus: (id: string, status: KitchenStatus) => Promise<void>;
  removeOrder: (id: string) => Promise<void>;
}

export const useKitchenStore = create<KitchenStore>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,
      error: '',
      setStorageScope: (scope) => {
        if (typeof window !== 'undefined') window.localStorage.setItem('kitchen-storage-scope', scope);
      },

      fetchKitchenOrders: async () => {
        // Don't clobber in-flight optimistic updates
        if (get().isLoading) return;
        const versionAtStart = kitchenMutationVersion;
        set({ isLoading: true, error: '' });
        try {
          const data = await api.getKitchenOrders();
          set((state) => ({
            orders: versionAtStart === kitchenMutationVersion ? data : state.orders,
            isLoading: false,
          }));
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Could not load kitchen orders.',
          });
        }
      },

      resetTenantData: () => set({ orders: [], error: '', isLoading: false }),

  addOrder: (order) =>
    set((state) => ({ orders: [order, ...state.orders] })),

  updateOrderStatus: async (id, status) => {
    const previousOrder = get().orders.find((order) => order.id === id);
    if (!previousOrder) return;
    kitchenMutationVersion += 1;
    set((state) => ({
      orders: state.orders.map((order) => order.id === id ? { ...order, status } : order),
    }));
    try {
      const savedOrder = await api.updateKitchenOrder(id, status);
      set((state) => ({
        orders: state.orders.map((order) => order.id === id ? savedOrder : order),
      }));
    } catch (error) {
      set((state) => ({
        orders: state.orders.map((order) => order.id === id ? previousOrder : order),
        error: error instanceof Error ? error.message : 'Could not update kitchen order.',
      }));
      throw error;
    }
  },

      removeOrder: async (id) => {
        const removedOrder = get().orders.find((order) => order.id === id);
        kitchenMutationVersion += 1;
        set((state) => ({ orders: state.orders.filter((order) => order.id !== id) }));
        try {
          await api.deleteKitchenOrder(id);
        } catch (error) {
          set((state) => ({
            orders: removedOrder ? [removedOrder, ...state.orders] : state.orders,
            error: error instanceof Error ? error.message : 'Could not remove kitchen order.',
          }));
          throw error;
        }
      },
    }),
    {
      name: typeof window !== 'undefined' && window.localStorage.getItem('kitchen-storage-scope')
        ? `kitchen-storage:${window.localStorage.getItem('kitchen-storage-scope')}`
        : 'kitchen-storage',
      partialize: (state) => ({ orders: state.orders }),
    }
  )
);

export default useKitchenStore;
