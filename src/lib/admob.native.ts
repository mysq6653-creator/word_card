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

    const unsubEarned = rewardedAd!.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        rewarded = true;
      },
    );

    const unsubClose = rewardedAd!.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        unsubEarned();
        unsubClose();
        adLoaded = false;
        loadRewardedAd();
        resolve(rewarded);
      },
    );

    rewardedAd!.show();
  });
}
