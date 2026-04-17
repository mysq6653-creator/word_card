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

2. 정보의 사용 목적
녹음된 음성은 낱말 카드의 발음 재생에만 사용됩니다. 부모님이 직접 녹음한 목소리로 아이에게 단어를 들려줄 수 있습니다.

3. 정보의 저장
- 모바일: 기기 내부 저장소 (앱 삭제 시 함께 삭제)
- 웹: 브라우저 IndexedDB (브라우저 데이터 삭제 시 함께 삭제)
어떠한 데이터도 외부 서버에 저장되거나 전송되지 않습니다.

4. 정보의 삭제
설정 화면에서 "모든 녹음 삭제" 버튼을 통해 언제든지 모든 녹음 데이터를 삭제할 수 있습니다. 개별 카드의 녹음은 각 카드에서 삭제할 수 있습니다.

5. 아동 개인정보 보호
본 앱은 영유아 교육을 목적으로 합니다. 아동의 개인정보를 수집하지 않으며, 계정 생성이나 로그인이 필요하지 않습니다. 네트워크 통신을 하지 않으므로 아동의 정보가 외부로 유출될 가능성이 없습니다.

6. 제3자 제공
수집된 정보를 제3자에게 제공하지 않습니다. 앱에 광고나 분석 도구가 포함되어 있지 않습니다.

7. 변경 사항
본 방침이 변경될 경우 앱 업데이트를 통해 안내합니다.

8. 문의
개인정보 관련 문의사항이 있으시면 앱스토어 리뷰 또는 개발자 연락처로 문의해 주세요.
`.trim();

const enText = `
Word Card App Privacy Policy

Last updated: April 2025

1. Information We Collect
This app can record audio through your device's microphone. All recordings are stored locally on your device only and are never sent to any external server.

2. How We Use Information
Recorded audio is used solely for playing pronunciation on word cards. Parents can record their own voice to play for their child.

3. Data Storage
- Mobile: Device internal storage (deleted when app is uninstalled)
- Web: Browser IndexedDB (deleted when browser data is cleared)
No data is stored on or transmitted to external servers.

4. Data Deletion
You can delete all recordings at any time through the "Delete All Recordings" button in Settings. Individual card recordings can be deleted from each card.

5. Children's Privacy
This app is designed for early childhood education. We do not collect any personal information from children. No account creation or login is required. The app does not make any network requests, ensuring no child data can be exposed externally.

6. Third-Party Sharing
We do not share any information with third parties. The app contains no advertisements or analytics tools.

7. Changes
Any changes to this policy will be communicated through app updates.

8. Contact
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
