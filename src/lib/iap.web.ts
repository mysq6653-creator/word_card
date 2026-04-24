import { usePremiumStore } from '../store/usePremiumStore';

export const PRODUCT_IDS = {
  LIFETIME: 'wordcard_premium_lifetime',
  CREDITS_50: 'wordcard_credits_50',
  CREDITS_150: 'wordcard_credits_150',
  CREDITS_500: 'wordcard_credits_500',
} as const;

const CREDIT_AMOUNTS: Record<string, number> = {
  [PRODUCT_IDS.CREDITS_50]: 50,
  [PRODUCT_IDS.CREDITS_150]: 150,
  [PRODUCT_IDS.CREDITS_500]: 500,
};

export async function initIAP(): Promise<void> {}

export async function getProducts() {
  return [
    { productId: PRODUCT_IDS.LIFETIME, localizedPrice: '$14.99', title: 'Lifetime Premium' },
    { productId: PRODUCT_IDS.CREDITS_50, localizedPrice: '$1.99', title: '50 AI Credits' },
    { productId: PRODUCT_IDS.CREDITS_150, localizedPrice: '$3.99', title: '150 AI Credits' },
    { productId: PRODUCT_IDS.CREDITS_500, localizedPrice: '$9.99', title: '500 AI Credits' },
  ];
}

export async function purchaseProduct(productId: string): Promise<boolean> {
  const creditAmount = CREDIT_AMOUNTS[productId];
  if (creditAmount) {
    usePremiumStore.getState().addAiCredits(creditAmount);
  } else {
    usePremiumStore.getState().setPremium(true);
  }
  return true;
}

export async function restorePurchases(): Promise<'restored' | 'none' | 'error'> {
  return 'none';
}

export function endIAP(): void {}
