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
import { theme } from '../src/lib/theme';
import { useCardStore } from '../src/store/useCardStore';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const lang = useCardStore((s) => s.lang);
  const toggleLang = useCardStore((s) => s.toggleLang);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>낱말 카드</Text>
          <Text style={styles.subtitle}>
            {lang === 'ko' ? '카테고리를 골라보세요' : 'Pick a category'}
          </Text>
        </View>
        <Pressable
          onPress={toggleLang}
          style={({ pressed }) => [
            styles.langBtn,
            pressed && { opacity: 0.7 },
          ]}
          accessibilityLabel="언어 전환"
        >
          <Text style={styles.langBtnText}>
            {lang === 'ko' ? '🇰🇷 한' : '🇺🇸 EN'}
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.push('/category/_all')}
        style={({ pressed }) => [
          styles.specialTile,
          { backgroundColor: '#E0E7FF' },
          pressed && { transform: [{ scale: 0.97 }] },
        ]}
        accessibilityLabel="전체 낱말카드 보기"
      >
        <Text style={styles.specialEmoji}>📚</Text>
        <Text style={styles.specialLabel}>
          {lang === 'ko' ? '전체보기' : 'All Cards'}
        </Text>
      </Pressable>

      <View style={styles.grid}>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => router.push(`/category/${cat.id}`)}
            style={({ pressed }) => [
              styles.tile,
              { backgroundColor: cat.color },
              pressed && { transform: [{ scale: 0.97 }] },
            ]}
            accessibilityLabel={`${cat.ko} 카테고리`}
          >
            <Text style={styles.tileEmoji}>{cat.emoji}</Text>
            <Text style={styles.tileLabel}>
              {lang === 'ko' ? cat.ko : cat.en}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.footer}>👶 9개월 아기를 위한 낱말 카드</Text>
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
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  langBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  langBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  specialTile: {
    height: 100,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    marginBottom: 16,
  },
  specialEmoji: {
    fontSize: 36,
  },
  specialLabel: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
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
    borderRadius: theme.radius.lg,
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
    color: theme.colors.text,
    marginTop: 8,
  },
  footer: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    color: theme.colors.textMuted,
  },
});
