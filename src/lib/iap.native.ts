import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  type Purchase,
  type PurchaseError,
  type EventSubscription,
} from 'react-native-iap';
import { usePremiumStore } from '../store/usePremiumStore';

export const PRODUCT_IDS = {
  LIFETIME: 'wordcard_premium_lifetime',
  CREDITS_50: 'wordcard_credits_50',
  CREDITS_150: 'wordcard_credits_150',
  CREDITS_500: 'wordcard_credits_500',
} as const;

const PREMIUM_IDS: string[] = [PRODUCT_IDS.LIFETIME];
const CREDIT_IDS: Record<string, number> = {
  [PRODUCT_IDS.CREDITS_50]: 50,
  [PRODUCT_IDS.CREDITS_150]: 150,
  [PRODUCT_IDS.CREDITS_500]: 500,
};
const VALID_IDS: string[] = [...PREMIUM_IDS, ...Object.keys(CREDIT_IDS)];

let purchaseListener: EventSubscription | null = null;
let errorListener: EventSubscription | null = null;

function handlePurchaseSuccess(purchase: Purchase) {
  if (PREMIUM_IDS.includes(purchase.productId)) {
    usePremiumStore.getState().setPremium(true);
  }
  const creditAmount = CREDIT_IDS[purchase.productId];
  if (creditAmount) {
    usePremiumStore.getState().addAiCredits(creditAmount);
  }
  const isConsumable = !!creditAmount;
  finishTransaction({ purchase, isConsumable }).catch(() => {});
}

export async function initIAP(): Promise<void> {
  try {
    await initConnection();

    purchaseListener = purchaseUpdatedListener((purchase) => {
      handlePurchaseSuccess(purchase);
    });

    errorListener = purchaseErrorListener((_error: PurchaseError) => {});
  } catch {
    // IAP not available
  }
}

export async function getProducts() {
  try {
    const all = await fetchProducts({
      skus: VALID_IDS,
      type: 'all',
    });
    return (all ?? []).map((p) => ({
      productId: p.id,
      localizedPrice: p.displayPrice ?? '',
      title: p.title ?? '',
    }));
  } catch {
    return [];
  }
}

export async function purchaseProduct(productId: string): Promise<boolean> {
  try {
    await requestPurchase({
      request: {
        apple: { sku: productId },
        google: { skus: [productId] },
      },
      type: 'in-app',
    });
    return true;
  } catch {
    return false;
  }
}

export async function restorePurchases(): Promise<'restored' | 'none' | 'error'> {
  try {
    const purchases = await getAvailablePurchases();
    const hasPremium = purchases.some((p) => PREMIUM_IDS.includes(p.productId));
    if (hasPremium) {
      usePremiumStore.getState().setPremium(true);
      return 'restored';
    }
    return 'none';
  } catch {
    return 'error';
  }
}

export function endIAP(): void {
  purchaseListener?.remove();
  errorListener?.remove();
  purchaseListener = null;
  errorListener = null;
  endConnection();
}
