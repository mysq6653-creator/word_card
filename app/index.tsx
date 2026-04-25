import { useRouter } from 'expo-router';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { categories, catText } from '../src/data/words';
import { ui, uiFmt } from '../src/data/ui';
import { dimCategoryColor, radius, useIsDark, useThemeColors } from '../src/lib/theme';
import { useCardStore } from '../src/store/useCardStore';
import { useCustomCardStore } from '../src/store/useCustomCardStore';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const lang = useCardStore((s) => s.lang);
  const colors = useThemeColors();
  const isDark = useIsDark();

  const customCategories = useCustomCardStore((s) => s.customCategories);
  const removeCategory = useCustomCardStore((s) => s.removeCategory);
  const bump = useCustomCardStore((s) => s.bump);

  const handleDeleteCategory = (catId: string, catName: string) => {
    const doDelete = () => {
      removeCategory(catId);
      bump();
    };
    const msg = uiFmt('deleteCatConfirm', lang, { name: catName });
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) doDelete();
    } else {
      Alert.alert(
        ui('deleteCategory', lang),
        msg,
        [
          { text: ui('cancel', lang), style: 'cancel' },
          { text: ui('delete', lang), style: 'destructive', onPress: doDelete },
        ],
      );
    }
  };

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
          <Text style={[styles.title, { color: colors.text }]}>{ui('wordCard', lang)}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {ui('pickCategory', lang)}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/settings')}
          style={({ pressed }) => [
            styles.iconBtn,
            { backgroundColor: colors.surface },
            pressed && { opacity: 0.7 },
          ]}
          accessibilityLabel={ui('settings', lang)}
        >
          <Text style={{ fontSize: 22 }}>{'⚙️'}</Text>
        </Pressable>
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
          accessibilityLabel={ui('allCards', lang)}
        >
          <Text style={styles.specialEmoji}>{'📚'}</Text>
          <Text style={[styles.specialLabel, { color: colors.text }]}>
            {ui('allCards', lang)}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/quiz/_all')}
          style={({ pressed }) => [
            styles.specialTile,
            { backgroundColor: isDark ? '#3A2A3A' : '#FCE4EC' },
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
          accessibilityLabel={ui('quiz', lang)}
        >
          <Text style={styles.specialEmoji}>{'🧩'}</Text>
          <Text style={[styles.specialLabel, { color: colors.text }]}>
            {ui('quiz', lang)}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/listen/_all')}
          style={({ pressed }) => [
            styles.specialTile,
            { backgroundColor: isDark ? '#2A3A2A' : '#E8F5E9' },
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
          accessibilityLabel={ui('listen', lang)}
        >
          <Text style={styles.specialEmoji}>{'🔊'}</Text>
          <Text style={[styles.specialLabel, { color: colors.text }]}>
            {ui('listen', lang)}
          </Text>
        </Pressable>
      </View>

      {/* Built-in categories */}
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
            accessibilityLabel={catText(cat, lang)}
          >
            <Text style={styles.tileEmoji}>{cat.emoji}</Text>
            <Text style={[styles.tileLabel, { color: colors.text }]}>
              {catText(cat, lang)}
            </Text>
          </Pressable>
        ))}

        {/* Custom categories */}
        {customCategories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => router.push(`/category/${cat.id}`)}
            onLongPress={() => handleDeleteCategory(cat.id, catText(cat, lang))}
            style={({ pressed }) => [
              styles.tile,
              { backgroundColor: dimCategoryColor(cat.color, isDark) },
              pressed && { transform: [{ scale: 0.97 }] },
            ]}
            accessibilityLabel={catText(cat, lang)}
          >
            <Text style={styles.tileEmoji}>{cat.emoji}</Text>
            <Text style={[styles.tileLabel, { color: colors.text }]}>
              {catText(cat, lang)}
            </Text>
            <View style={styles.customBadge}>
              <Text style={styles.customBadgeText}>MY</Text>
            </View>
          </Pressable>
        ))}

        {/* Add card tile */}
        <Pressable
          onPress={() => router.push('/add-card')}
          style={({ pressed }) => [
            styles.tile,
            { backgroundColor: isDark ? '#2D2D44' : '#F0F0F0', borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed' },
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
          accessibilityLabel={ui('createCard', lang)}
        >
          <Text style={styles.tileEmoji}>{'✏️'}</Text>
          <Text style={[styles.tileLabel, { color: colors.primary }]}>
            {ui('create', lang)}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.footer, { color: colors.textMuted }]}>
        {`👶 ${ui('forMyBaby', lang)}`}
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
  customBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  customBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
  },
  footer: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
});
