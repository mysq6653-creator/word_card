import { Platform } from 'react-native';
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

// ──────────────────────────────────────────────────────────────
// 실제 광고 단위 ID — AdMob 콘솔에서 발급받은 보상형 광고 ID로 교체하세요.
// (형식: 'ca-app-pub-0000000000000000/0000000000')
// 개발 중(__DEV__)에는 항상 Google 테스트 광고가 사용됩니다.
// ──────────────────────────────────────────────────────────────
const REWARDED_AD_UNIT_ANDROID = 'ca-app-pub-5026993506594072/5465878426';
const REWARDED_AD_UNIT_IOS = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

const REWARDED_AD_UNIT = __DEV__
  ? TestIds.REWARDED
  : Platform.select({
      android: REWARDED_AD_UNIT_ANDROID,
      ios: REWARDED_AD_UNIT_IOS,
      default: TestIds.REWARDED,
    })!;

let rewardedAd: RewardedAd | null = null;
let adLoaded = false;

export function loadRewardedAd(): void {
  // 아동 대상 앱(COPPA/가족용 정책) 준수를 위해 비개인화 광고만 요청합니다.
  rewardedAd = RewardedAd.createForAdRequest(REWARDED_AD_UNIT, {
    requestNonPersonalizedAdsOnly: true,
  });

  rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
    adLoaded = true;
  });

  rewardedAd.load();
}

export function isRewardedAdReady(): boolean {
  return adLoaded;
}

export async function showRewardedAd(): Promise<boolean> {
  if (!rewardedAd || !adLoaded) {
    loadRewardedAd();
    return false;
  }

  return new Promise<boolean>((resolve) => {
    let rewarded = false;
    let settled = false;

    const cleanup = () => {
      if (settled) return;
      settled = true;
      unsubEarned();
      unsubClose();
      unsubError();
      adLoaded = false;
      loadRewardedAd();
    };

    const unsubEarned = rewardedAd!.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        rewarded = true;
      },
    );

    const unsubClose = rewardedAd!.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        cleanup();
        resolve(rewarded);
      },
    );

    const unsubError = rewardedAd!.addAdEventListener(
      AdEventType.ERROR,
      () => {
        cleanup();
        resolve(false);
      },
    );

    try {
      rewardedAd!.show();
    } catch {
      cleanup();
      resolve(false);
    }
  });
}
