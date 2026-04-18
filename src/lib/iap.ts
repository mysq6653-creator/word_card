import { Platform } from 'react-native';
import { usePremiumStore } from '../store/usePremiumStore';

export const PRODUCT_IDS = {
  MONTHLY: 'wordcard_premium_monthly',
  YEARLY: 'wordcard_premium_yearly',
  LIFETIME: 'wordcard_premium_lifetime',
} as const;

export const ALL_PRODUCT_IDS = [
  PRODUCT_IDS.MONTHLY,
  PRODUCT_IDS.YEARLY,
  PRODUCT_IDS.LIFETIME,
];

export async function initIAP(): Promise<void> {
  if (Platform.OS === 'web') return;
  // TODO: react-native-iap initConnection() 호출
  // import { initConnection } from 'react-native-iap';
  // await initConnection();
}

export async function getProducts() {
  if (Platform.OS === 'web') {
    return [
      { productId: PRODUCT_IDS.YEARLY, localizedPrice: '₩9,900', title: '연간 구독' },
      { productId: PRODUCT_IDS.MONTHLY, localizedPrice: '₩1,900', title: '월간 구독' },
      { productId: PRODUCT_IDS.LIFETIME, localizedPrice: '₩19,900', title: '영구 구매' },
    ];
  }
  // TODO: react-native-iap getSubscriptions / getProducts 호출
  return [];
}

export async function purchaseProduct(productId: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    usePremiumStore.getState().setPremium(true);
    return true;
  }
  // TODO: react-native-iap requestPurchase / requestSubscription 호출
  // 성공 시 usePremiumStore.getState().setPremium(true);
  return false;
}

export async function restorePurchases(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  // TODO: react-native-iap getAvailablePurchases 호출
  // 유효한 구매가 있으면 usePremiumStore.getState().setPremium(true);
  return false;
}

export function endIAP(): void {
  if (Platform.OS === 'web') return;
  // TODO: react-native-iap endConnection()
}
