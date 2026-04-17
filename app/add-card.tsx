import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { categories } from '../src/data/words';
import { saveImage } from '../src/lib/imageStorage';
import { radius, useThemeColors } from '../src/lib/theme';
import { useCardStore } from '../src/store/useCardStore';
import {
  useCustomCardStore,
  type CustomCategory,
} from '../src/store/useCustomCardStore';

const CATEGORY_COLORS = [
  '#FFD6A5', '#FFADAD', '#FDCBB6', '#BDE0FE', '#CAFFBF',
  '#FFC8DD', '#A0E7A0', '#E0C3FC', '#FFE066', '#B8E0FF',
  '#F0E68C', '#DDA0DD', '#98FB98', '#FFA07A', '#87CEEB',
];

const CATEGORY_EMOJIS = [
  '📁', '⭐', '💡', '🎯', '🏠', '🎵', '🎨', '📚',
  '🌟', '💖', '🔮', '🎪', '🌺', '🍀', '🦄',
];

export default function AddCardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const lang = useCardStore((s) => s.lang);
  const { categoryId: preselectedCatId } = useLocalSearchParams<{ categoryId?: string }>();

  const customCategories = useCustomCardStore((s) => s.customCategories);
  const addWord = useCustomCardStore((s) => s.addWord);
  const addCategory = useCustomCardStore((s) => s.addCategory);
  const bump = useCustomCardStore((s) => s.bump);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ko, setKo] = useState('');
  const [en, setEn] = useState('');
  const [emoji, setEmoji] = useState('📷');
  const [selectedCatId, setSelectedCatId] = useState<string>(preselectedCatId ?? '');
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCatKo, setNewCatKo] = useState('');
  const [newCatEn, setNewCatEn] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('📁');
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const allCategories = useMemo(
    () => [...categories, ...customCategories],
    [customCategories],
  );

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const canSave = ko.trim() && en.trim() && (selectedCatId || (isNewCategory && newCatKo.trim() && newCatEn.trim()));

  const handleSave = useCallback(async () => {
    if (!canSave || saving) return;
    setSaving(true);

    try {
      let catId = selectedCatId;

      if (isNewCategory) {
        catId = `custom-cat-${Date.now()}`;
        const newCat: CustomCategory = {
          id: catId,
          ko: newCatKo.trim(),
          en: newCatEn.trim(),
          emoji: newCatEmoji,
          color: newCatColor,
        };
        addCategory(newCat);
      }

      const wordId = `custom-${Date.now()}`;

      if (imageUri) {
        await saveImage(wordId, imageUri);
      }

      addWord({
        id: wordId,
        ko: ko.trim(),
        en: en.trim(),
        emoji,
        categoryId: catId,
        hasImage: !!imageUri,
      });

      bump();
      router.back();
    } finally {
      setSaving(false);
    }
  }, [canSave, saving, selectedCatId, isNewCategory, newCatKo, newCatEn, newCatEmoji, newCatColor, imageUri, ko, en, emoji, addCategory, addWord, bump, router]);

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
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
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        ✏️ {lang === 'ko' ? '카드 만들기' : 'Create Card'}
      </Text>

      {/* Image picker */}
      <Text style={[styles.label, { color: colors.textMuted }]}>
        {lang === 'ko' ? '사진 (선택)' : 'Photo (optional)'}
      </Text>
      <Pressable
        onPress={pickImage}
        style={({ pressed }) => [
          styles.imagePicker,
          { backgroundColor: colors.surface, borderColor: colors.primary },
          pressed && { opacity: 0.7 },
        ]}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderIcon}>📷</Text>
            <Text style={[styles.imagePlaceholderText, { color: colors.textMuted }]}>
              {lang === 'ko' ? '앨범에서 선택' : 'Pick from album'}
            </Text>
          </View>
        )}
      </Pressable>

      {/* Korean name */}
      <Text style={[styles.label, { color: colors.textMuted }]}>
        {lang === 'ko' ? '한국어 이름 *' : 'Korean Name *'}
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.primary }]}
        value={ko}
        onChangeText={setKo}
        placeholder={lang === 'ko' ? '예: 강아지' : 'e.g. 강아지'}
        placeholderTextColor={colors.textMuted}
      />

      {/* English name */}
      <Text style={[styles.label, { color: colors.textMuted }]}>
        {lang === 'ko' ? '영어 이름 *' : 'English Name *'}
      </Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.primary }]}
        value={en}
        onChangeText={setEn}
        placeholder={lang === 'ko' ? '예: Dog' : 'e.g. Dog'}
        placeholderTextColor={colors.textMuted}
      />

      {/* Emoji fallback */}
      <Text style={[styles.label, { color: colors.textMuted }]}>
        {lang === 'ko' ? '이모지 (사진 없을 때 표시)' : 'Emoji (shown without photo)'}
      </Text>
      <TextInput
        style={[styles.input, styles.emojiInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.primary }]}
        value={emoji}
        onChangeText={(t) => setEmoji(t || '📷')}
        placeholder="📷"
        placeholderTextColor={colors.textMuted}
      />

      {/* Category selection */}
      <Text style={[styles.label, { color: colors.textMuted }]}>
        {lang === 'ko' ? '카테고리 *' : 'Category *'}
      </Text>

      <View style={styles.catGrid}>
        {allCategories.map((cat) => {
          const active = !isNewCategory && selectedCatId === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => {
                setSelectedCatId(cat.id);
                setIsNewCategory(false);
              }}
              style={[
                styles.catChip,
                { backgroundColor: active ? colors.primary : colors.surface },
              ]}
            >
              <Text style={styles.catChipEmoji}>{cat.emoji}</Text>
              <Text
                style={[styles.catChipLabel, { color: active ? '#fff' : colors.text }]}
                numberOfLines={1}
              >
                {lang === 'ko' ? cat.ko : cat.en}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={() => {
            setIsNewCategory(true);
            setSelectedCatId('');
          }}
          style={[
            styles.catChip,
            { backgroundColor: isNewCategory ? colors.primary : colors.surface },
          ]}
        >
          <Text style={styles.catChipEmoji}>➕</Text>
          <Text
            style={[styles.catChipLabel, { color: isNewCategory ? '#fff' : colors.text }]}
          >
            {lang === 'ko' ? '새 카테고리' : 'New'}
          </Text>
        </Pressable>
      </View>

      {/* New category fields */}
      {isNewCategory && (
        <View style={[styles.newCatBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.newCatTitle, { color: colors.text }]}>
            {lang === 'ko' ? '새 카테고리 만들기' : 'New Category'}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.primary }]}
            value={newCatKo}
            onChangeText={setNewCatKo}
            placeholder={lang === 'ko' ? '한국어 이름' : 'Korean name'}
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.primary }]}
            value={newCatEn}
            onChangeText={setNewCatEn}
            placeholder={lang === 'ko' ? '영어 이름' : 'English name'}
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.subLabel, { color: colors.textMuted }]}>
            {lang === 'ko' ? '아이콘' : 'Icon'}
          </Text>
          <View style={styles.emojiRow}>
            {CATEGORY_EMOJIS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setNewCatEmoji(e)}
                style={[
                  styles.emojiOption,
                  newCatEmoji === e && { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.emojiOptionText}>{e}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.subLabel, { color: colors.textMuted }]}>
            {lang === 'ko' ? '색상' : 'Color'}
          </Text>
          <View style={styles.colorRow}>
            {CATEGORY_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setNewCatColor(c)}
                style={[
                  styles.colorOption,
                  { backgroundColor: c },
                  newCatColor === c && styles.colorOptionActive,
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* Save button */}
      <Pressable
        onPress={handleSave}
        disabled={!canSave || saving}
        style={({ pressed }) => [
          styles.saveBtn,
          { backgroundColor: canSave ? colors.primary : colors.surface },
          (pressed || saving) && { opacity: 0.6 },
        ]}
      >
        <Text style={[styles.saveBtnText, { color: canSave ? '#fff' : colors.textMuted }]}>
          {saving
            ? (lang === 'ko' ? '저장 중...' : 'Saving...')
            : (lang === 'ko' ? '카드 저장' : 'Save Card')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 8 },
  header: { marginBottom: 8 },
  backBtn: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md },
  backText: { fontSize: 18, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 16 },
  label: { fontSize: 15, fontWeight: '600', marginTop: 12, marginBottom: 4, marginLeft: 4 },
  subLabel: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: { fontSize: 18, fontWeight: '600', paddingHorizontal: 16, paddingVertical: 14, borderRadius: radius.md, borderWidth: 2 },
  emojiInput: { fontSize: 32, textAlign: 'center', width: 80 },
  imagePicker: { height: 200, borderRadius: radius.lg, borderWidth: 2, borderStyle: 'dashed', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { alignItems: 'center', gap: 8 },
  imagePlaceholderIcon: { fontSize: 48 },
  imagePlaceholderText: { fontSize: 16, fontWeight: '600' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  catChipEmoji: { fontSize: 18 },
  catChipLabel: { fontSize: 15, fontWeight: '700' },
  newCatBox: { borderRadius: radius.md, padding: 16, marginTop: 8, gap: 8 },
  newCatTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiOption: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  emojiOptionText: { fontSize: 24 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorOption: { width: 36, height: 36, borderRadius: 18 },
  colorOptionActive: { borderWidth: 3, borderColor: '#333' },
  saveBtn: { marginTop: 24, paddingVertical: 18, borderRadius: radius.md, alignItems: 'center' },
  saveBtnText: { fontSize: 20, fontWeight: '800' },
});
