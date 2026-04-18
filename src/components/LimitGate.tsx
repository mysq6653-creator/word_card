import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../lib/theme';
import { useCardStore } from '../store/useCardStore';

type Props = {
  used: number;
  limit: number;
  featureLabel: string;
  onWatchAd: () => void;
  onUpgrade: () => void;
};

export function LimitBanner({ used, limit, featureLabel, onWatchAd, onUpgrade }: Props) {
  const colors = useThemeColors();
  const lang = useCardStore((s) => s.lang);

  return (
    <View style={[styles.banner, { backgroundColor: colors.surface }]}>
      <Text style={[styles.limitText, { color: colors.text }]}>
        {featureLabel} {used}/{limit}
      </Text>
      <Text style={[styles.desc, { color: colors.textMuted }]}>
        {lang === 'ko'
          ? '무료 한도에 도달했어요'
          : 'Free limit reached'}
      </Text>
      <View style={styles.actions}>
        <Pressable
          onPress={onWatchAd}
          style={({ pressed }) => [
            styles.adBtn,
            { backgroundColor: colors.accent },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.adBtnText}>
            📺 {lang === 'ko' ? '광고 보고 +1' : 'Watch Ad +1'}
          </Text>
        </Pressable>
        <Pressable
          onPress={onUpgrade}
          style={({ pressed }) => [
            styles.upgradeBtn,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.upgradeBtnText}>
            ⭐ {lang === 'ko' ? '프리미엄' : 'Premium'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function QuizLimitBlock({ onUpgrade }: { onUpgrade: () => void }) {
  const colors = useThemeColors();
  const lang = useCardStore((s) => s.lang);

  return (
    <View style={[styles.block, { backgroundColor: colors.bg }]}>
      <Text style={styles.blockEmoji}>🔒</Text>
      <Text style={[styles.blockTitle, { color: colors.text }]}>
        {lang === 'ko' ? '오늘의 퀴즈를 다 했어요!' : "Today's quiz is done!"}
      </Text>
      <Text style={[styles.blockDesc, { color: colors.textMuted }]}>
        {lang === 'ko'
          ? '무료 버전은 하루 1회 퀴즈를 할 수 있어요'
          : 'Free version allows 1 quiz per day'}
      </Text>
      <Pressable
        onPress={onUpgrade}
        style={({ pressed }) => [
          styles.upgradeBtn,
          { backgroundColor: colors.primary },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={styles.upgradeBtnText}>
          ⭐ {lang === 'ko' ? '프리미엄으로 무제한 퀴즈' : 'Unlimited with Premium'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 10,
    marginVertical: 12,
  },
  limitText: { fontSize: 18, fontWeight: '800' },
  desc: { fontSize: 14, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  adBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999 },
  adBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  upgradeBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999 },
  upgradeBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  block: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  blockEmoji: { fontSize: 64 },
  blockTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  blockDesc: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
