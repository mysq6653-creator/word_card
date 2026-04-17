import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { categories as builtinCategories } from '../src/data/words';
import { deleteAllRecordings } from '../src/lib/audioStorage';
import { deleteImage, deleteAllImages } from '../src/lib/imageStorage';
import { radius, useIsDark, useThemeColors } from '../src/lib/theme';
import { useCardStore } from '../src/store/useCardStore';
import { useCustomCardStore } from '../src/store/useCustomCardStore';

function confirmAction(
  lang: string,
  message: string,
  onConfirm: () => void,
) {
  if (Platform.OS === 'web') {
    if (window.confirm(message)) onConfirm();
  } else {
    Alert.alert(
      lang === 'ko' ? '확인' : 'Confirm',
      message,
      [
        { text: lang === 'ko' ? '취소' : 'Cancel', style: 'cancel' },
        { text: lang === 'ko' ? '삭제' : 'Delete', style: 'destructive', onPress: onConfirm },
      ],
    );
  }
}

export default function ManageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = useIsDark();

  const lang = useCardStore((s) => s.lang);
  const bumpRecording = useCardStore((s) => s.bumpRecordingVersion);

  const customCategories = useCustomCardStore((s) => s.customCategories);
  const customWords = useCustomCardStore((s) => s.customWords);
  const imageOverrides = useCustomCardStore((s) => s.imageOverrides);
  const removeCategory = useCustomCardStore((s) => s.removeCategory);
  const removeWord = useCustomCardStore((s) => s.removeWord);
  const removeImageOverride = useCustomCardStore((s) => s.removeImageOverride);
  const bump = useCustomCardStore((s) => s.bump);

  const [deletingRecordings, setDeletingRecordings] = useState(false);
  const [deletingImages, setDeletingImages] = useState(false);

  const wordsByCategory = useMemo(() => {
    const map = new Map<string, typeof customWords>();
    for (const w of customWords) {
      const list = map.get(w.categoryId) ?? [];
      list.push(w);
      map.set(w.categoryId, list);
    }
    return map;
  }, [customWords]);

  const handleDeleteCategory = useCallback((catId: string, catName: string) => {
    confirmAction(lang,
      lang === 'ko'
        ? `"${catName}" 카테고리와 모든 카드를 삭제할까요?`
        : `Delete "${catName}" and all its cards?`,
      () => {
        const wordsInCat = customWords.filter((w) => w.categoryId === catId);
        for (const w of wordsInCat) {
          deleteImage(w.id).catch(() => {});
        }
        removeCategory(catId);
        bump();
      },
    );
  }, [lang, customWords, removeCategory, bump]);

  const handleDeleteWord = useCallback((wordId: string, wordName: string) => {
    confirmAction(lang,
      lang === 'ko' ? `"${wordName}" 카드를 삭제할까요?` : `Delete "${wordName}"?`,
      () => {
        deleteImage(wordId).catch(() => {});
        removeWord(wordId);
        bump();
      },
    );
  }, [lang, removeWord, bump]);

  const handleRemoveOverride = useCallback((wordId: string) => {
    deleteImage(wordId).catch(() => {});
    removeImageOverride(wordId);
    bump();
  }, [removeImageOverride, bump]);

  const handleDeleteAllRecordings = useCallback(() => {
    confirmAction(lang,
      lang === 'ko' ? '모든 녹음을 삭제할까요? 되돌릴 수 없어요.' : 'Delete all recordings? Cannot be undone.',
      async () => {
        setDeletingRecordings(true);
        try {
          await deleteAllRecordings();
          bumpRecording();
        } finally {
          setDeletingRecordings(false);
        }
      },
    );
  }, [lang, bumpRecording]);

  const handleDeleteAllCustom = useCallback(() => {
    confirmAction(lang,
      lang === 'ko' ? '모든 커스텀 카드, 카테고리, 사진을 삭제할까요?' : 'Delete all custom cards, categories, and photos?',
      async () => {
        setDeletingImages(true);
        try {
          for (const cat of customCategories) {
            removeCategory(cat.id);
          }
          for (const id of imageOverrides) {
            removeImageOverride(id);
          }
          await deleteAllImages();
          bump();
        } finally {
          setDeletingImages(false);
        }
      },
    );
  }, [lang, customCategories, imageOverrides, removeCategory, removeImageOverride, bump]);

  const overrideInfo = useMemo(() => {
    return imageOverrides.map((id) => {
      for (const cat of builtinCategories) {
        const found = cat.words.find((w) => w.id === id);
        if (found) return { wordId: id, name: lang === 'ko' ? found.ko : found.en, emoji: found.emoji, catName: lang === 'ko' ? cat.ko : cat.en };
      }
      return { wordId: id, name: id, emoji: '📷', catName: '' };
    });
  }, [imageOverrides, lang]);

  const hasCustomData = customCategories.length > 0 || customWords.length > 0 || imageOverrides.length > 0;

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
      ]}
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
        📂 {lang === 'ko' ? '데이터 관리' : 'Data Manager'}
      </Text>

      {/* Custom categories & words */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        ✏️ {lang === 'ko' ? '나만의 카드' : 'My Cards'}
        <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
          {' '}({customWords.length})
        </Text>
      </Text>

      {customCategories.length === 0 && customWords.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {lang === 'ko' ? '아직 만든 카드가 없어요' : 'No custom cards yet'}
          </Text>
          <Pressable
            onPress={() => router.push('/add-card')}
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.addBtnText}>
              ➕ {lang === 'ko' ? '카드 만들기' : 'Create Card'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.categoryList}>
          {customCategories.map((cat) => {
            const wordsInCat = wordsByCategory.get(cat.id) ?? [];
            return (
              <View key={cat.id} style={[styles.catSection, { backgroundColor: colors.surface }]}>
                <View style={styles.catHeader}>
                  <Text style={[styles.catName, { color: colors.text }]}>
                    {cat.emoji} {lang === 'ko' ? cat.ko : cat.en}
                  </Text>
                  <Pressable
                    onPress={() => handleDeleteCategory(cat.id, lang === 'ko' ? cat.ko : cat.en)}
                    style={({ pressed }) => [styles.deleteChip, { backgroundColor: colors.danger }, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={styles.deleteChipText}>
                      {lang === 'ko' ? '삭제' : 'Delete'}
                    </Text>
                  </Pressable>
                </View>
                {wordsInCat.length === 0 ? (
                  <Text style={[styles.emptyWordText, { color: colors.textMuted }]}>
                    {lang === 'ko' ? '카드 없음' : 'No cards'}
                  </Text>
                ) : (
                  wordsInCat.map((w) => (
                    <View key={w.id} style={[styles.wordRow, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
                      <Text style={styles.wordEmoji}>{w.emoji}</Text>
                      <View style={styles.wordInfo}>
                        <Text style={[styles.wordName, { color: colors.text }]} numberOfLines={1}>
                          {w.ko}
                        </Text>
                        <Text style={[styles.wordSub, { color: colors.textMuted }]} numberOfLines={1}>
                          {w.en} {w.hasImage ? '📷' : ''}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleDeleteWord(w.id, w.ko)}
                        style={({ pressed }) => [styles.wordDeleteBtn, pressed && { opacity: 0.5 }]}
                      >
                        <Text style={[styles.wordDeleteText, { color: colors.danger }]}>🗑️</Text>
                      </Pressable>
                    </View>
                  ))
                )}
              </View>
            );
          })}

          {/* Cards in built-in categories */}
          {(() => {
            const builtinCatWords = customWords.filter(
              (w) => !customCategories.some((c) => c.id === w.categoryId),
            );
            if (builtinCatWords.length === 0) return null;

            const grouped = new Map<string, typeof customWords>();
            for (const w of builtinCatWords) {
              const list = grouped.get(w.categoryId) ?? [];
              list.push(w);
              grouped.set(w.categoryId, list);
            }

            return Array.from(grouped.entries()).map(([catId, words]) => {
              const cat = builtinCategories.find((c) => c.id === catId);
              return (
                <View key={catId} style={[styles.catSection, { backgroundColor: colors.surface }]}>
                  <View style={styles.catHeader}>
                    <Text style={[styles.catName, { color: colors.text }]}>
                      {cat?.emoji ?? '📁'} {lang === 'ko' ? cat?.ko ?? catId : cat?.en ?? catId}
                    </Text>
                    <Text style={[styles.builtinBadge, { color: colors.textMuted }]}>
                      {lang === 'ko' ? '기본 카테고리' : 'Built-in'}
                    </Text>
                  </View>
                  {words.map((w) => (
                    <View key={w.id} style={[styles.wordRow, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
                      <Text style={styles.wordEmoji}>{w.emoji}</Text>
                      <View style={styles.wordInfo}>
                        <Text style={[styles.wordName, { color: colors.text }]} numberOfLines={1}>{w.ko}</Text>
                        <Text style={[styles.wordSub, { color: colors.textMuted }]} numberOfLines={1}>{w.en}</Text>
                      </View>
                      <Pressable
                        onPress={() => handleDeleteWord(w.id, w.ko)}
                        style={({ pressed }) => [styles.wordDeleteBtn, pressed && { opacity: 0.5 }]}
                      >
                        <Text style={[styles.wordDeleteText, { color: colors.danger }]}>🗑️</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              );
            });
          })()}
        </View>
      )}

      {/* Image overrides */}
      {overrideInfo.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
            📷 {lang === 'ko' ? '사진으로 변경된 카드' : 'Photo Overrides'}
            <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
              {' '}({overrideInfo.length})
            </Text>
          </Text>
          <View style={[styles.catSection, { backgroundColor: colors.surface }]}>
            {overrideInfo.map((item) => (
              <View key={item.wordId} style={[styles.wordRow, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
                <Text style={styles.wordEmoji}>{item.emoji}</Text>
                <View style={styles.wordInfo}>
                  <Text style={[styles.wordName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.wordSub, { color: colors.textMuted }]} numberOfLines={1}>
                    {item.catName}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleRemoveOverride(item.wordId)}
                  style={({ pressed }) => [styles.restoreBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }, pressed && { opacity: 0.5 }]}
                >
                  <Text style={[styles.restoreBtnText, { color: colors.textMuted }]}>
                    {lang === 'ko' ? '복원' : 'Restore'}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Danger zone */}
      <Text style={[styles.sectionTitle, { color: colors.danger, marginTop: 32 }]}>
        ⚠️ {lang === 'ko' ? '일괄 삭제' : 'Bulk Delete'}
      </Text>

      <View style={styles.dangerZone}>
        <Pressable
          onPress={handleDeleteAllRecordings}
          disabled={deletingRecordings}
          style={({ pressed }) => [
            styles.dangerBtn,
            { backgroundColor: colors.surface, borderColor: colors.danger },
            (pressed || deletingRecordings) && { opacity: 0.6 },
          ]}
        >
          <Text style={[styles.dangerBtnText, { color: colors.danger }]}>
            🎙️ {deletingRecordings
              ? (lang === 'ko' ? '삭제 중...' : 'Deleting...')
              : (lang === 'ko' ? '모든 녹음 삭제' : 'Delete All Recordings')}
          </Text>
        </Pressable>

        {hasCustomData && (
          <Pressable
            onPress={handleDeleteAllCustom}
            disabled={deletingImages}
            style={({ pressed }) => [
              styles.dangerBtn,
              { backgroundColor: colors.surface, borderColor: colors.danger },
              (pressed || deletingImages) && { opacity: 0.6 },
            ]}
          >
            <Text style={[styles.dangerBtnText, { color: colors.danger }]}>
              ✏️ {deletingImages
                ? (lang === 'ko' ? '삭제 중...' : 'Deleting...')
                : (lang === 'ko' ? '모든 커스텀 데이터 삭제' : 'Delete All Custom Data')}
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 8 },
  header: { marginBottom: 8 },
  backBtn: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md },
  backText: { fontSize: 18, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  sectionCount: { fontSize: 16, fontWeight: '600' },
  emptyBox: { borderRadius: radius.md, padding: 24, alignItems: 'center', gap: 16 },
  emptyText: { fontSize: 16, fontWeight: '600' },
  addBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.md },
  addBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  categoryList: { gap: 12 },
  catSection: { borderRadius: radius.md, padding: 16, gap: 4 },
  catHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  catName: { fontSize: 18, fontWeight: '800' },
  builtinBadge: { fontSize: 12, fontWeight: '600' },
  deleteChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  deleteChipText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  emptyWordText: { fontSize: 14, fontWeight: '500', paddingVertical: 4 },
  wordRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1 },
  wordEmoji: { fontSize: 28 },
  wordInfo: { flex: 1 },
  wordName: { fontSize: 16, fontWeight: '700' },
  wordSub: { fontSize: 13, fontWeight: '500' },
  wordDeleteBtn: { padding: 8 },
  wordDeleteText: { fontSize: 20 },
  restoreBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  restoreBtnText: { fontSize: 13, fontWeight: '600' },
  dangerZone: { gap: 12 },
  dangerBtn: { paddingVertical: 16, borderRadius: radius.md, alignItems: 'center', borderWidth: 2 },
  dangerBtnText: { fontSize: 16, fontWeight: '700' },
});
