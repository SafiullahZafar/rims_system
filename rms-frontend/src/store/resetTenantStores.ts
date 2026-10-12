import { useCustomerStore } from './useCustomerStore';
import { useKitchenStore } from './useKitchenStore';
import { useOrderStore } from './useOrderStore';
import { useTableStore } from './useTableStore';

export const resetTenantStores = () => {
  useTableStore.getState().resetTenantData();
  useOrderStore.getState().resetTenantData();
  useKitchenStore.getState().resetTenantData();
  useCustomerStore.getState().resetTenantData();
};
