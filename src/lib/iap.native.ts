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
  MONTHLY: 'wordcard_premium_monthly',
  YEARLY: 'wordcard_premium_yearly',
  LIFETIME: 'wordcard_premium_lifetime',
} as const;

const VALID_IDS: string[] = [PRODUCT_IDS.MONTHLY, PRODUCT_IDS.YEARLY, PRODUCT_IDS.LIFETIME];

let purchaseListener: EventSubscription | null = null;
let errorListener: EventSubscription | null = null;

function handlePurchaseSuccess(purchase: Purchase) {
  if (VALID_IDS.includes(purchase.productId)) {
    usePremiumStore.getState().setPremium(true);
  }
  finishTransaction({ purchase, isConsumable: false }).catch(() => {});
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
  const isSub = productId !== PRODUCT_IDS.LIFETIME;
  try {
    await requestPurchase({
      request: {
        apple: { sku: productId },
        google: { skus: [productId] },
      },
      type: isSub ? 'subs' : 'in-app',
    });
    return true;
  } catch {
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const purchases = await getAvailablePurchases();
    const hasPremium = purchases.some((p) => VALID_IDS.includes(p.productId));
    if (hasPremium) {
      usePremiumStore.getState().setPremium(true);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function endIAP(): void {
  purchaseListener?.remove();
  errorListener?.remove();
  purchaseListener = null;
  errorListener = null;
  endConnection();
}
