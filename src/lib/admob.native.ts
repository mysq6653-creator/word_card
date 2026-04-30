import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const REWARDED_AD_UNIT = TestIds.REWARDED;

let rewardedAd: RewardedAd | null = null;
let adLoaded = false;

export function loadRewardedAd(): void {
  rewardedAd = RewardedAd.createForAdRequest(REWARDED_AD_UNIT);

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
