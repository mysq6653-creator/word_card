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

import { categories as builtinCategories, wordText, catText } from '../src/data/words';
import { ui, uiFmt } from '../src/data/ui';
import { deleteAllRecordings, deleteRecording } from '../src/lib/audioStorage';
import { deleteImage, deleteAllImages } from '../src/lib/imageStorage';
import { radius, useIsDark, useThemeColors } from '../src/lib/theme';
import { showToast } from '../src/components/Toast';
import { useCardStore } from '../src/store/useCardStore';
import { useCustomCardStore } from '../src/store/useCustomCardStore';

function confirmAction(
  lang: string,
  title: string,
  message: string,
  deleteLabel: string,
  cancelLabel: string,
  onConfirm: () => void,
) {
  if (Platform.OS === 'web') {
    if (window.confirm(message)) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel' },
      { text: deleteLabel, style: 'destructive', onPress: onConfirm },
    ]);
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
      ui('confirm', lang),
      uiFmt('deleteCatConfirm', lang, { name: catName }),
      ui('delete', lang),
      ui('cancel', lang),
      () => {
        const wordsInCat = customWords.filter((w) => w.categoryId === catId);
        for (const w of wordsInCat) {
          deleteImage(w.id).catch(() => {});
          deleteRecording(w.id, 'ko').catch(() => {});
          deleteRecording(w.id, 'en').catch(() => {});
        }
        removeCategory(catId);
        bump();
        showToast(ui('categoryDeleted', lang));
      },
    );
  }, [lang, customWords, removeCategory, bump]);

  const handleDeleteWord = useCallback((wordId: string, wordName: string) => {
    confirmAction(lang,
      ui('confirm', lang),
      uiFmt('deleteCardConfirmTpl', lang, { name: wordName }),
      ui('delete', lang),
      ui('cancel', lang),
      () => {
        deleteImage(wordId).catch(() => {});
        deleteRecording(wordId, 'ko').catch(() => {});
        deleteRecording(wordId, 'en').catch(() => {});
        removeWord(wordId);
        bump();
        showToast(ui('cardDeleted', lang));
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
      ui('confirm', lang),
      ui('deleteAllRecordingsConfirm', lang),
      ui('delete', lang),
      ui('cancel', lang),
      async () => {
        setDeletingRecordings(true);
        try {
          await deleteAllRecordings();
          bumpRecording();
          showToast(ui('allRecordingsDeleted', lang));
        } finally {
          setDeletingRecordings(false);
        }
      },
    );
  }, [lang, bumpRecording]);

  const handleDeleteAllCustom = useCallback(() => {
    confirmAction(lang,
      ui('confirm', lang),
      ui('deleteAllCustomConfirm', lang),
      ui('delete', lang),
      ui('cancel', lang),
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
          showToast(ui('allDataDeleted', lang));
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
        if (found) return { wordId: id, name: wordText(found, lang), emoji: found.emoji, catName: catText(cat, lang) };
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
            {`← ${ui('back', lang)}`}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {`📂 ${ui('dataManager', lang)}`}
      </Text>

      {/* Custom categories & words */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {`✏️ ${ui('myCards', lang)}`}
        <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
          {' '}({customWords.length})
        </Text>
      </Text>

      {customCategories.length === 0 && customWords.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {ui('noCustomCards', lang)}
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
              {`➕ ${ui('createCard', lang)}`}
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
                    {cat.emoji} {catText(cat, lang)}
                  </Text>
                  <Pressable
                    onPress={() => handleDeleteCategory(cat.id, catText(cat, lang))}
                    style={({ pressed }) => [styles.deleteChip, { backgroundColor: colors.danger }, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={styles.deleteChipText}>
                      {ui('delete', lang)}
                    </Text>
                  </Pressable>
                </View>
                {wordsInCat.length === 0 ? (
                  <Text style={[styles.emptyWordText, { color: colors.textMuted }]}>
                    {ui('noCards', lang)}
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
                        <Text style={[styles.wordDeleteText, { color: colors.danger }]}>{'🗑️'}</Text>
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
                      {cat?.emoji ?? '📁'} {cat ? catText(cat, lang) : catId}
                    </Text>
                    <Text style={[styles.builtinBadge, { color: colors.textMuted }]}>
                      {ui('builtIn', lang)}
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
                        <Text style={[styles.wordDeleteText, { color: colors.danger }]}>{'🗑️'}</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              );
            });
          })()}

          {/* Add card button */}
          <Pressable
            onPress={() => router.push('/add-card')}
            style={({ pressed }) => [
              styles.addBtnWide,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.addBtnText}>
              {`➕ ${ui('createCard', lang)}`}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Image overrides */}
      {overrideInfo.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
            {`📷 ${ui('photoOverridesLabel', lang)}`}
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
                    {ui('restorePhoto', lang)}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Danger zone */}
      <Text style={[styles.sectionTitle, { color: colors.danger, marginTop: 32 }]}>
        {`⚠️ ${ui('bulkDelete', lang)}`}
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
            {`🎙️ ${deletingRecordings ? ui('deleting', lang) : ui('deleteAllRecordings', lang)}`}
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
              {`✏️ ${deletingImages ? ui('deleting', lang) : ui('deleteAllCustom', lang)}`}
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
  addBtnWide: { paddingVertical: 16, borderRadius: radius.md, alignItems: 'center', marginTop: 8 },
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
