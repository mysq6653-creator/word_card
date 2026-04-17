import { useRouter } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { categories } from '../src/data/words';
import { dimCategoryColor, radius, useIsDark, useThemeColors } from '../src/lib/theme';
import { useCardStore } from '../src/store/useCardStore';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const lang = useCardStore((s) => s.lang);
  const toggleLang = useCardStore((s) => s.toggleLang);
  const colors = useThemeColors();
  const isDark = useIsDark();

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>낱말 카드</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {lang === 'ko' ? '카테고리를 골라보세요' : 'Pick a category'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => router.push('/settings')}
            style={({ pressed }) => [
              styles.iconBtn,
              { backgroundColor: colors.surface },
              pressed && { opacity: 0.7 },
            ]}
            accessibilityLabel="설정"
          >
            <Text style={{ fontSize: 22 }}>⚙️</Text>
          </Pressable>
          <Pressable
            onPress={toggleLang}
            style={({ pressed }) => [
              styles.langBtn,
              { backgroundColor: colors.surface, borderColor: colors.primary },
              pressed && { opacity: 0.7 },
            ]}
            accessibilityLabel="언어 전환"
          >
            <Text style={[styles.langBtnText, { color: colors.text }]}>
              {lang === 'ko' ? '🇰🇷 한' : '🇺🇸 EN'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Special tiles row */}
      <View style={styles.specialRow}>
        <Pressable
          onPress={() => router.push('/category/_all')}
          style={({ pressed }) => [
            styles.specialTile,
            { backgroundColor: isDark ? '#2A2A4A' : '#E0E7FF' },
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
          accessibilityLabel="전체 낱말카드 보기"
        >
          <Text style={styles.specialEmoji}>📚</Text>
          <Text style={[styles.specialLabel, { color: colors.text }]}>
            {lang === 'ko' ? '전체보기' : 'All Cards'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/quiz/_all')}
          style={({ pressed }) => [
            styles.specialTile,
            { backgroundColor: isDark ? '#3A2A3A' : '#FCE4EC' },
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
          accessibilityLabel="퀴즈 모드"
        >
          <Text style={styles.specialEmoji}>🧩</Text>
          <Text style={[styles.specialLabel, { color: colors.text }]}>
            {lang === 'ko' ? '퀴즈' : 'Quiz'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/listen/_all')}
          style={({ pressed }) => [
            styles.specialTile,
            { backgroundColor: isDark ? '#2A3A2A' : '#E8F5E9' },
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
          accessibilityLabel="듣기 퀴즈"
        >
          <Text style={styles.specialEmoji}>🔊</Text>
          <Text style={[styles.specialLabel, { color: colors.text }]}>
            {lang === 'ko' ? '듣기' : 'Listen'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => router.push(`/category/${cat.id}`)}
            style={({ pressed }) => [
              styles.tile,
              { backgroundColor: dimCategoryColor(cat.color, isDark) },
              pressed && { transform: [{ scale: 0.97 }] },
            ]}
            accessibilityLabel={`${cat.ko} 카테고리`}
          >
            <Text style={styles.tileEmoji}>{cat.emoji}</Text>
            <Text style={[styles.tileLabel, { color: colors.text }]}>
              {lang === 'ko' ? cat.ko : cat.en}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.footer, { color: colors.textMuted }]}>
        👶 9개월 아기를 위한 낱말 카드
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 2,
  },
  langBtnText: {
    fontSize: 18,
    fontWeight: '700',
  },
  specialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  specialTile: {
    flex: 1,
    height: 80,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    padding: 16,
  },
  specialEmoji: {
    fontSize: 30,
  },
  specialLabel: {
    fontSize: 20,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  tile: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  tileEmoji: {
    fontSize: 80,
  },
  tileLabel: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 8,
  },
  footer: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
});
