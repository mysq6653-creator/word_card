import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

import { categories as builtinCategories, wordText, catText } from '../src/data/words';
import { ui, uiFmt } from '../src/data/ui';
import { deleteAllRecordings, deleteRecording, getRecordingCount, hasRecording } from '../src/lib/audioStorage';
import { deleteAllAiAudio, getAiAudioCount, hasAiAudio } from '../src/lib/aiAudioStorage';
import { deleteImage, deleteAllImages } from '../src/lib/imageStorage';
import { deleteWordData } from '../src/lib/dataCleanup';
import { radius, useIsDark, useThemeColors } from '../src/lib/theme';
import { showToast } from '../src/components/Toast';
import { useCardStore } from '../src/store/useCardStore';
import { useCustomCardStore } from '../src/store/useCustomCardStore';

function confirmAction(
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

interface CardMeta {
  hasRec: boolean;
  hasAi: boolean;
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
  const [deletingAiAudio, setDeletingAiAudio] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  // Storage summary
  const [recCount, setRecCount] = useState<number | null>(null);
  const [aiCount, setAiCount] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getRecordingCount().catch(() => 0),
      getAiAudioCount().catch(() => 0),
    ]).then(([r, a]) => {
      if (!cancelled) {
        setRecCount(r);
        setAiCount(a);
      }
    });
    return () => { cancelled = true; };
  }, [refreshKey]);

  // Per-card metadata (recording / AI audio indicators)
  const [cardMeta, setCardMeta] = useState<Record<string, CardMeta>>({});

  useEffect(() => {
    let cancelled = false;
    const ids = customWords.map((w) => w.id);
    if (ids.length === 0) {
      setCardMeta({});
      return;
    }
    Promise.all(
      ids.map(async (id) => {
        const [rec, ai] = await Promise.all([
          hasRecording(id, lang).catch(() => false),
          hasAiAudio(id, lang).catch(() => false),
        ]);
        return [id, { hasRec: rec, hasAi: ai }] as const;
      }),
    ).then((entries) => {
      if (!cancelled) setCardMeta(Object.fromEntries(entries));
    });
    return () => { cancelled = true; };
  }, [customWords, lang, refreshKey]);

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
    confirmAction(
      ui('confirm', lang),
      uiFmt('deleteCatConfirm', lang, { name: catName }),
      ui('delete', lang),
      ui('cancel', lang),
      async () => {
        const wordsInCat = customWords.filter((w) => w.categoryId === catId);
        await Promise.allSettled(wordsInCat.map((w) => deleteWordData(w.id)));
        removeCategory(catId);
        bump();
        setRefreshKey((k) => k + 1);
        showToast(ui('categoryDeleted', lang));
      },
    );
  }, [lang, customWords, removeCategory, bump]);

  const handleDeleteWord = useCallback((wordId: string, wordName: string) => {
    confirmAction(
      ui('confirm', lang),
      uiFmt('deleteCardConfirmTpl', lang, { name: wordName }),
      ui('delete', lang),
      ui('cancel', lang),
      async () => {
        await deleteWordData(wordId);
        removeWord(wordId);
        bump();
        setRefreshKey((k) => k + 1);
        showToast(ui('cardDeleted', lang));
      },
    );
  }, [lang, removeWord, bump]);

  const handleRemoveOverride = useCallback(async (wordId: string) => {
    await deleteImage(wordId).catch(() => {});
    removeImageOverride(wordId);
    bump();
    setRefreshKey((k) => k + 1);
  }, [removeImageOverride, bump]);

  const handleDeleteAllRecordings = useCallback(() => {
    confirmAction(
      ui('confirm', lang),
      ui('deleteAllRecordingsConfirm', lang),
      ui('delete', lang),
      ui('cancel', lang),
      async () => {
        setDeletingRecordings(true);
        try {
          await deleteAllRecordings();
          bumpRecording();
          setRefreshKey((k) => k + 1);
          showToast(ui('allRecordingsDeleted', lang));
        } finally {
          setDeletingRecordings(false);
        }
      },
    );
  }, [lang, bumpRecording]);

  const handleDeleteAllAiAudio = useCallback(() => {
    confirmAction(
      ui('confirm', lang),
      ui('deleteAllAiAudioConfirm', lang),
      ui('delete', lang),
      ui('cancel', lang),
      async () => {
        setDeletingAiAudio(true);
        try {
          await deleteAllAiAudio();
          setRefreshKey((k) => k + 1);
          showToast(ui('allAiAudioDeleted', lang));
        } finally {
          setDeletingAiAudio(false);
        }
      },
    );
  }, [lang]);

  const handleResetAll = useCallback(() => {
    confirmAction(
      ui('confirm', lang),
      ui('resetAllConfirm', lang),
      ui('delete', lang),
      ui('cancel', lang),
      async () => {
        setDeletingAll(true);
        try {
          for (const cat of customCategories) {
            removeCategory(cat.id);
          }
          for (const id of imageOverrides) {
            removeImageOverride(id);
          }
          await Promise.allSettled([
            deleteAllRecordings(),
            deleteAllAiAudio(),
            deleteAllImages(),
          ]);
          bumpRecording();
          bump();
          setRefreshKey((k) => k + 1);
          showToast(ui('allDataReset', lang));
        } finally {
          setDeletingAll(false);
        }
      },
    );
  }, [lang, customCategories, imageOverrides, removeCategory, removeImageOverride, bumpRecording, bump]);

  const overrideInfo = useMemo(() => {
    return imageOverrides.map((id) => {
      for (const cat of builtinCategories) {
        const found = cat.words.find((w) => w.id === id);
        if (found) return { wordId: id, name: wordText(found, lang), emoji: found.emoji, catName: catText(cat, lang) };
      }
      return { wordId: id, name: id, emoji: '📷', catName: '' };
    });
  }, [imageOverrides, lang]);

  const totalData = (recCount ?? 0) + (aiCount ?? 0) + customWords.length + imageOverrides.length;
  const isLoading = recCount === null;

  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

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
          accessibilityRole="button"
          accessibilityLabel={ui('back', lang)}
        >
          <Text style={[styles.backText, { color: colors.text }]}>
            {`← ${ui('back', lang)}`}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {`📂 ${ui('dataManager', lang)}`}
      </Text>

      {/* ── Storage Overview ── */}
      <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>
          {ui('storageOverview', lang)}
        </Text>
        {isLoading ? (
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            {ui('loading', lang)}
          </Text>
        ) : totalData === 0 ? (
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            {ui('noData', lang)}
          </Text>
        ) : (
          <View style={styles.summaryGrid}>
            <SummaryBadge
              icon="🎙️"
              label={ui('userRecordings', lang)}
              count={recCount ?? 0}
              unit={ui('files', lang)}
              color="#FF6B6B"
              bgColor={isDark ? '#3a2020' : '#FFF0F0'}
            />
            <SummaryBadge
              icon="🤖"
              label={ui('aiAudioFiles', lang)}
              count={aiCount ?? 0}
              unit={ui('files', lang)}
              color="#4ECDC4"
              bgColor={isDark ? '#1a3533' : '#F0FFFE'}
            />
            <SummaryBadge
              icon="✏️"
              label={ui('customCardsCount', lang)}
              count={customWords.length}
              unit={ui('cards', lang)}
              color="#FFB347"
              bgColor={isDark ? '#3a3020' : '#FFF8F0'}
            />
            <SummaryBadge
              icon="📷"
              label={ui('photosCount', lang)}
              count={imageOverrides.length}
              unit={ui('items', lang)}
              color="#9B59B6"
              bgColor={isDark ? '#2d1f3a' : '#F8F0FF'}
            />
          </View>
        )}
      </View>

      {/* ── Custom Cards ── */}
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
                    <WordRow
                      key={w.id}
                      word={w}
                      lang={lang}
                      meta={cardMeta[w.id]}
                      colors={colors}
                      borderColor={borderColor}
                      onPress={() => router.push(`/edit-card?id=${w.id}`)}
                      onDelete={() => handleDeleteWord(w.id, wordText(w as any, lang))}
                    />
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
                    <WordRow
                      key={w.id}
                      word={w}
                      lang={lang}
                      meta={cardMeta[w.id]}
                      colors={colors}
                      borderColor={borderColor}
                      onPress={() => router.push(`/edit-card?id=${w.id}`)}
                      onDelete={() => handleDeleteWord(w.id, wordText(w as any, lang))}
                    />
                  ))}
                </View>
              );
            });
          })()}

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

      {/* ── Image Overrides ── */}
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
              <Pressable
                key={item.wordId}
                onPress={() => router.push(`/edit-card?id=${item.wordId}`)}
                style={({ pressed }) => [styles.wordRow, { borderColor }, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.wordEmoji}>{item.emoji}</Text>
                <View style={styles.wordInfo}>
                  <Text style={[styles.wordName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.wordSub, { color: colors.textMuted }]} numberOfLines={1}>
                    {item.catName}
                  </Text>
                </View>
                <Text style={[styles.editHint, { color: colors.primary }]}>{'✏️'}</Text>
                <Pressable
                  onPress={(e) => { e.stopPropagation(); handleRemoveOverride(item.wordId); }}
                  style={({ pressed }) => [styles.restoreBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }, pressed && { opacity: 0.5 }]}
                >
                  <Text style={[styles.restoreBtnText, { color: colors.textMuted }]}>
                    {ui('restorePhoto', lang)}
                  </Text>
                </Pressable>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* ── Danger Zone ── */}
      <Text style={[styles.sectionTitle, { color: colors.danger, marginTop: 32 }]}>
        {`⚠️ ${ui('bulkDelete', lang)}`}
      </Text>

      <View style={styles.dangerZone}>
        {(recCount ?? 0) > 0 && (
          <Pressable
            onPress={handleDeleteAllRecordings}
            disabled={deletingRecordings}
            style={({ pressed }) => [
              styles.dangerBtn,
              { backgroundColor: colors.surface, borderColor: colors.danger },
              (pressed || deletingRecordings) && { opacity: 0.6 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={ui('deleteAllRecordings', lang)}
          >
            <Text style={[styles.dangerBtnText, { color: colors.danger }]}>
              {`🎙️ ${deletingRecordings ? ui('deleting', lang) : ui('deleteAllRecordings', lang)}`}
            </Text>
            <Text style={[styles.dangerBtnSub, { color: colors.textMuted }]}>
              {`${recCount} ${ui('files', lang)}`}
            </Text>
          </Pressable>
        )}

        {(aiCount ?? 0) > 0 && (
          <Pressable
            onPress={handleDeleteAllAiAudio}
            disabled={deletingAiAudio}
            style={({ pressed }) => [
              styles.dangerBtn,
              { backgroundColor: colors.surface, borderColor: colors.danger },
              (pressed || deletingAiAudio) && { opacity: 0.6 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={ui('deleteAllAiAudio', lang)}
          >
            <Text style={[styles.dangerBtnText, { color: colors.danger }]}>
              {`🤖 ${deletingAiAudio ? ui('deleting', lang) : ui('deleteAllAiAudio', lang)}`}
            </Text>
            <Text style={[styles.dangerBtnSub, { color: colors.textMuted }]}>
              {`${aiCount} ${ui('files', lang)}`}
            </Text>
          </Pressable>
        )}

        {totalData > 0 && (
          <Pressable
            onPress={handleResetAll}
            disabled={deletingAll}
            style={({ pressed }) => [
              styles.dangerBtnStrong,
              { borderColor: colors.danger },
              (pressed || deletingAll) && { opacity: 0.6 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={ui('resetAll', lang)}
          >
            <Text style={styles.dangerBtnStrongText}>
              {`🔄 ${deletingAll ? ui('deleting', lang) : ui('resetAll', lang)}`}
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

// ── Sub-components ──

function SummaryBadge({
  icon,
  label,
  count,
  unit,
  color,
  bgColor,
}: {
  icon: string;
  label: string;
  count: number;
  unit: string;
  color: string;
  bgColor: string;
}) {
  if (count === 0) return null;
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={styles.badgeIcon}>{icon}</Text>
      <Text style={[styles.badgeCount, { color }]}>{count}</Text>
      <Text style={[styles.badgeUnit, { color }]}>{unit}</Text>
      <Text style={[styles.badgeLabel, { color }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function WordRow({
  word,
  lang,
  meta,
  colors,
  borderColor,
  onPress,
  onDelete,
}: {
  word: { id: string; ko: string; en: string; emoji: string; hasImage: boolean };
  lang: string;
  meta?: CardMeta;
  colors: any;
  borderColor: string;
  onPress: () => void;
  onDelete: () => void;
}) {
  const displayName = lang === 'ko' ? word.ko : word.en;
  const subName = lang === 'ko' ? word.en : word.ko;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wordRow, { borderColor }, pressed && { opacity: 0.7 }]}
    >
      <Text style={styles.wordEmoji}>{word.emoji}</Text>
      <View style={styles.wordInfo}>
        <Text style={[styles.wordName, { color: colors.text }]} numberOfLines={1}>
          {displayName}
        </Text>
        <View style={styles.wordSubRow}>
          <Text style={[styles.wordSub, { color: colors.textMuted }]} numberOfLines={1}>
            {subName}
          </Text>
          {word.hasImage && <Text style={styles.metaBadge}>{'📷'}</Text>}
          {meta?.hasRec && (
            <View style={[styles.metaTag, { backgroundColor: '#FF6B6B20' }]}>
              <Text style={[styles.metaTagText, { color: '#FF6B6B' }]}>🎙️</Text>
            </View>
          )}
          {meta?.hasAi && (
            <View style={[styles.metaTag, { backgroundColor: '#4ECDC420' }]}>
              <Text style={[styles.metaTagText, { color: '#4ECDC4' }]}>🤖</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.wordActions}>
        <Text style={[styles.editHint, { color: colors.primary }]}>{'✏️'}</Text>
        <Pressable
          onPress={(e) => { e.stopPropagation(); onDelete(); }}
          style={({ pressed }) => [styles.wordDeleteBtn, pressed && { opacity: 0.5 }]}
        >
          <Text style={[styles.wordDeleteText, { color: colors.danger }]}>{'🗑️'}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 8 },
  header: { marginBottom: 8 },
  backBtn: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md },
  backText: { fontSize: 18, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 20 },

  // Storage summary
  summaryCard: { borderRadius: radius.md, padding: 20, marginBottom: 20 },
  summaryTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  loadingText: { fontSize: 14, fontWeight: '500', textAlign: 'center', paddingVertical: 8 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: { flexBasis: '47%', flexGrow: 1, borderRadius: radius.sm, padding: 14, alignItems: 'center', gap: 2 },
  badgeIcon: { fontSize: 24 },
  badgeCount: { fontSize: 24, fontWeight: '900' },
  badgeUnit: { fontSize: 11, fontWeight: '600' },
  badgeLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },

  // Sections
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

  // Word rows
  wordRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1 },
  wordEmoji: { fontSize: 28 },
  wordInfo: { flex: 1 },
  wordName: { fontSize: 16, fontWeight: '700' },
  wordSubRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  wordSub: { fontSize: 13, fontWeight: '500' },
  metaBadge: { fontSize: 12 },
  metaTag: { paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
  metaTagText: { fontSize: 11, fontWeight: '700' },
  wordActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editHint: { fontSize: 16 },
  wordDeleteBtn: { padding: 8 },
  wordDeleteText: { fontSize: 20 },

  // Image overrides
  restoreBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  restoreBtnText: { fontSize: 13, fontWeight: '600' },

  // Danger zone
  dangerZone: { gap: 12 },
  dangerBtn: { paddingVertical: 16, borderRadius: radius.md, alignItems: 'center', borderWidth: 2, gap: 4 },
  dangerBtnText: { fontSize: 16, fontWeight: '700' },
  dangerBtnSub: { fontSize: 12, fontWeight: '500' },
  dangerBtnStrong: { paddingVertical: 16, borderRadius: radius.md, alignItems: 'center', borderWidth: 2, backgroundColor: '#DC354520' },
  dangerBtnStrongText: { fontSize: 16, fontWeight: '800', color: '#DC3545' },
});
