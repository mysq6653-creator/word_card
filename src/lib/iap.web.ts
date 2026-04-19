import { usePremiumStore } from '../store/usePremiumStore';

export const PRODUCT_IDS = {
  MONTHLY: 'wordcard_premium_monthly',
  YEARLY: 'wordcard_premium_yearly',
  LIFETIME: 'wordcard_premium_lifetime',
} as const;

export async function initIAP(): Promise<void> {}

export async function getProducts() {
  return [
    { productId: PRODUCT_IDS.YEARLY, localizedPrice: '₩9,900', title: '연간 구독' },
    { productId: PRODUCT_IDS.MONTHLY, localizedPrice: '₩1,900', title: '월간 구독' },
    { productId: PRODUCT_IDS.LIFETIME, localizedPrice: '₩19,900', title: '영구 구매' },
  ];
}

export async function purchaseProduct(_productId: string): Promise<boolean> {
  usePremiumStore.getState().setPremium(true);
  return true;
}

export async function restorePurchases(): Promise<boolean> {
  return false;
}

export function endIAP(): void {}
