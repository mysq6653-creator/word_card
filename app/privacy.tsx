import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, useThemeColors } from '../src/lib/theme';
import { useCardStore } from '../src/store/useCardStore';

const koText = `
낱말 카드 앱 개인정보 처리방침

최종 수정일: 2025년 4월

1. 수집하는 정보
본 앱은 사용자의 마이크를 통해 음성을 녹음할 수 있습니다. 녹음된 음성은 기기 내부에만 저장되며, 외부 서버로 전송되지 않습니다.
사진 앨범에서 선택한 이미지는 기기 내부에만 저장됩니다.

2. 정보의 사용 목적
녹음된 음성은 낱말 카드의 발음 재생에만 사용됩니다. 부모님이 직접 녹음한 목소리로 아이에게 단어를 들려줄 수 있습니다.

3. 정보의 저장
- 모바일: 기기 내부 저장소 (앱 삭제 시 함께 삭제)
- 웹: 브라우저 IndexedDB (브라우저 데이터 삭제 시 함께 삭제)
어떠한 개인 데이터도 외부 서버에 저장되거나 전송되지 않습니다.

4. 정보의 삭제
설정 > 데이터 관리에서 녹음, 사진, 커스텀 카드를 삭제할 수 있습니다. 개별 카드의 녹음은 각 카드에서 삭제할 수 있습니다.

5. 아동 개인정보 보호 (COPPA 준수)
본 앱은 영유아 교육을 목적으로 합니다. 아동의 개인정보를 수집하지 않으며, 계정 생성이나 로그인이 필요하지 않습니다. 아동의 정보가 외부로 유출되지 않습니다.

6. 광고
본 앱은 Google AdMob을 통해 보상형 광고를 표시할 수 있습니다. 광고는 아동 대상 설정(COPPA)에 따라 개인화되지 않은 광고만 표시됩니다. 광고 시청은 사용자가 직접 선택한 경우에만 표시됩니다.

7. 인앱 구매
프리미엄 구독 및 영구 구매가 제공됩니다. 결제는 Apple App Store 또는 Google Play Store를 통해 안전하게 처리되며, 결제 정보는 본 앱에서 수집하지 않습니다.

8. 제3자 SDK
- Google AdMob: 보상형 광고 표시 (비개인화 광고만)
- Apple StoreKit / Google Play Billing: 인앱 구매 처리

9. 변경 사항
본 방침이 변경될 경우 앱 업데이트를 통해 안내합니다.

10. 문의
개인정보 관련 문의사항이 있으시면 앱스토어 리뷰 또는 개발자 연락처로 문의해 주세요.
`.trim();

const enText = `
Word Card App Privacy Policy

Last updated: April 2025

1. Information We Collect
This app can record audio through your device's microphone. All recordings are stored locally on your device only and are never sent to any external server.
Images selected from your photo album are also stored locally only.

2. How We Use Information
Recorded audio is used solely for playing pronunciation on word cards. Parents can record their own voice to play for their child.

3. Data Storage
- Mobile: Device internal storage (deleted when app is uninstalled)
- Web: Browser IndexedDB (deleted when browser data is cleared)
No personal data is stored on or transmitted to external servers.

4. Data Deletion
You can delete recordings, photos, and custom cards through Settings > Data Manager. Individual card recordings can be deleted from each card.

5. Children's Privacy (COPPA Compliance)
This app is designed for early childhood education. We do not collect any personal information from children. No account creation or login is required. No child data is exposed externally.

6. Advertising
This app may display rewarded ads through Google AdMob. Ads are shown only when the user explicitly chooses to watch them. In compliance with COPPA, only non-personalized ads are served.

7. In-App Purchases
Premium subscriptions and a lifetime purchase option are available. Payments are processed securely through Apple App Store or Google Play Store. No payment information is collected by this app.

8. Third-Party SDKs
- Google AdMob: Rewarded ad display (non-personalized ads only)
- Apple StoreKit / Google Play Billing: In-app purchase processing

9. Changes
Any changes to this policy will be communicated through app updates.

10. Contact
For privacy-related inquiries, please reach out through the app store review or developer contact.
`.trim();

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const lang = useCardStore((s) => s.lang);

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
      ]}
    >
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.backBtn,
          { backgroundColor: colors.surface },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={[styles.backText, { color: colors.text }]}>
          ← {lang === 'ko' ? '돌아가기' : 'Back'}
        </Text>
      </Pressable>

      <Text style={[styles.title, { color: colors.text }]}>
        📋 {lang === 'ko' ? '개인정보 처리방침' : 'Privacy Policy'}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.body, { color: colors.text }]}>
          {lang === 'ko' ? koText : enText}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 16 },
  backBtn: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md },
  backText: { fontSize: 18, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '800' },
  card: { borderRadius: radius.md, padding: 20 },
  body: { fontSize: 15, lineHeight: 24 },
});
