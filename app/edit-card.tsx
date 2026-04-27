import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
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

import {
  categories as builtinCategories,
  getAllWords,
  wordText,
} from '../src/data/words';
import type { Word } from '../src/data/words';
import { ui } from '../src/data/ui';
import { hasRecording, deleteRecording, loadRecordingUri } from '../src/lib/audioStorage';
import { hasAiAudio, deleteAiAudio, loadAiAudioUri } from '../src/lib/aiAudioStorage';
import { saveImage, loadImageUri, deleteImage } from '../src/lib/imageStorage';
import { resizeImage } from '../src/lib/imageResize';
import { playUri, stopPlayback } from '../src/lib/recorder';
import { speak, stopSpeaking, unlockAudio } from '../src/lib/tts';
import { radius, useIsDark, useThemeColors } from '../src/lib/theme';
import { showToast } from '../src/components/Toast';
import { VoiceRecorder } from '../src/components/VoiceRecorder';
import { useCardStore } from '../src/store/useCardStore';
import { useCustomCardStore } from '../src/store/useCustomCardStore';

export default function EditCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = useIsDark();

  const lang = useCardStore((s) => s.lang);
  const ttsRate = useCardStore((s) => s.ttsRate);
  const recordingVersion = useCardStore((s) => s.recordingVersion);

  const customWords = useCustomCardStore((s) => s.customWords);
  const imageOverrides = useCustomCardStore((s) => s.imageOverrides);
  const updateWord = useCustomCardStore((s) => s.updateWord);
  const addImageOverride = useCustomCardStore((s) => s.addImageOverride);
  const removeImageOverride = useCustomCardStore((s) => s.removeImageOverride);
  const bump = useCustomCardStore((s) => s.bump);
  const customVersion = useCustomCardStore((s) => s.version);

  // Find the word — could be custom or built-in
  const wordData = useMemo(() => {
    const custom = customWords.find((w) => w.id === id);
    if (custom) return { word: { ...custom, isCustom: true } as Word & { isCustom: true }, isCustom: true };

    for (const cat of builtinCategories) {
      const found = cat.words.find((w) => w.id === id);
      if (found) return { word: found, isCustom: false };
    }
    return null;
  }, [id, customWords]);

  const word = wordData?.word;
  const isCustom = wordData?.isCustom ?? false;

  // Editable fields (only for custom cards)
  const [ko, setKo] = useState(word?.ko ?? '');
  const [en, setEn] = useState(word?.en ?? '');
  const [emoji, setEmoji] = useState(word?.emoji ?? '');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (word) {
      setKo(word.ko);
      setEn(word.en);
      setEmoji(word.emoji);
      setHasChanges(false);
    }
  }, [word?.id]);

  const handleFieldChange = useCallback((setter: (v: string) => void, value: string) => {
    setter(value);
    setHasChanges(true);
  }, []);

  // Image state
  const [cardImageUri, setCardImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (!word) return;
    let cancelled = false;
    const hasOverride = imageOverrides.includes(word.id);
    const isCustomWithImage = isCustom && customWords.find((w) => w.id === word.id)?.hasImage;
    if (hasOverride || isCustomWithImage) {
      loadImageUri(word.id).then((uri) => {
        if (!cancelled) setCardImageUri(uri);
      });
    } else {
      setCardImageUri(null);
    }
    return () => { cancelled = true; };
  }, [word?.id, imageOverrides, customVersion]);

  // Audio state
  const [hasRec, setHasRec] = useState(false);
  const [hasAi, setHasAi] = useState(false);
  const [audioRefresh, setAudioRefresh] = useState(0);

  useEffect(() => {
    if (!word) return;
    let cancelled = false;
    Promise.all([
      hasRecording(word.id, lang).catch(() => false),
      hasAiAudio(word.id, lang).catch(() => false),
    ]).then(([rec, ai]) => {
      if (!cancelled) {
        setHasRec(rec);
        setHasAi(ai);
      }
    });
    return () => { cancelled = true; };
  }, [word?.id, lang, recordingVersion, audioRefresh]);

  const handlePickImage = useCallback(async () => {
    if (!word) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled && result.assets[0]) {
      const resized = await resizeImage(result.assets[0].uri);
      await saveImage(word.id, resized);
      if (!isCustom) {
        addImageOverride(word.id);
      } else {
        updateWord(word.id, { hasImage: true });
      }
      bump();
    }
  }, [word, isCustom, addImageOverride, updateWord, bump]);

  const handleRemoveImage = useCallback(async () => {
    if (!word) return;
    await deleteImage(word.id);
    if (!isCustom) {
      removeImageOverride(word.id);
    } else {
      updateWord(word.id, { hasImage: false });
    }
    bump();
  }, [word, isCustom, removeImageOverride, updateWord, bump]);

  const handlePlayRecording = useCallback(async () => {
    if (!word) return;
    unlockAudio();
    stopSpeaking();
    await stopPlayback().catch(() => {});
    const uri = await loadRecordingUri(word.id, lang);
    if (uri) playUri(uri).catch(() => {});
  }, [word, lang]);

  const handlePlayAiAudio = useCallback(async () => {
    if (!word) return;
    unlockAudio();
    stopSpeaking();
    await stopPlayback().catch(() => {});
    const uri = await loadAiAudioUri(word.id, lang);
    if (uri) playUri(uri).catch(() => {});
  }, [word, lang]);

  const handleDeleteAiAudio = useCallback(async () => {
    if (!word) return;
    const doDelete = async () => {
      await deleteAiAudio(word.id, lang);
      setAudioRefresh((k) => k + 1);
      showToast(ui('allAiAudioDeleted', lang));
    };
    if (Platform.OS === 'web') {
      if (window.confirm(ui('deleteAiAudio', lang) + '?')) await doDelete();
    } else {
      Alert.alert(ui('confirm', lang), ui('deleteAiAudio', lang) + '?', [
        { text: ui('cancel', lang), style: 'cancel' },
        { text: ui('delete', lang), style: 'destructive', onPress: doDelete },
      ]);
    }
  }, [word, lang]);

  const handlePlayTTS = useCallback(() => {
    if (!word) return;
    unlockAudio();
    stopSpeaking();
    stopPlayback().catch(() => {});
    speak(wordText(word, lang), lang, ttsRate);
  }, [word, lang, ttsRate]);

  const handleSave = useCallback(() => {
    if (!word || !isCustom) return;
    updateWord(word.id, {
      ko: ko.trim(),
      en: en.trim(),
      emoji: emoji || word.emoji,
    });
    bump();
    setHasChanges(false);
    showToast(ui('changesSaved', lang));
  }, [word, isCustom, ko, en, emoji, updateWord, bump, lang]);

  const confirmBack = useCallback(() => {
    if (!hasChanges) {
      router.back();
      return;
    }
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm(ui('unsavedChanges', lang))) router.back();
    } else {
      Alert.alert('', ui('unsavedChanges', lang), [
        { text: ui('stay', lang), style: 'cancel' },
        { text: ui('leave', lang), style: 'destructive', onPress: () => router.back() },
      ]);
    }
  }, [hasChanges, lang, router]);

  if (!word) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          {ui('cardNotFound', lang)}
        </Text>
        <Pressable onPress={() => router.back()} style={[styles.mainBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.mainBtnText}>{ui('back', lang)}</Text>
        </Pressable>
      </View>
    );
  }

  const borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={confirmBack}
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
        {`✏️ ${ui('editCard', lang)}`}
      </Text>

      {/* ── Preview ── */}
      <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
        <Pressable onPress={handlePlayTTS} style={styles.previewCenter}>
          {cardImageUri ? (
            <Image source={{ uri: cardImageUri }} style={styles.previewImage} />
          ) : (
            <Text style={styles.previewEmoji}>{emoji || word.emoji}</Text>
          )}
          <Text style={[styles.previewWord, { color: colors.text }]}>
            {wordText(word, lang)}
          </Text>
          <Text style={[styles.previewHint, { color: colors.textMuted }]}>
            {`🔊 ${ui('tapToHear', lang)}`}
          </Text>
        </Pressable>
      </View>

      {/* ── Photo Section ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {`📷 ${ui('photo', lang)}`}
      </Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.photoRow}>
          <Pressable
            onPress={handlePickImage}
            style={({ pressed }) => [
              styles.photoBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.photoBtnText}>
              {`📷 ${cardImageUri ? ui('changePhoto', lang) : ui('pickFromAlbum', lang)}`}
            </Text>
          </Pressable>
          {cardImageUri && (
            <Pressable
              onPress={handleRemoveImage}
              style={({ pressed }) => [
                styles.photoBtn,
                { backgroundColor: colors.danger },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.photoBtnText}>
                {`🗑️ ${ui('removePhoto', lang)}`}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Name/Emoji Edit (Custom cards only) ── */}
      {isCustom && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {`✏️ ${ui('editCard', lang)}`}
          </Text>
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
              {ui('koreanName', lang)}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor }]}
              value={ko}
              onChangeText={(v) => handleFieldChange(setKo, v)}
              placeholder={ui('koreanNamePlaceholder', lang)}
              placeholderTextColor={colors.textMuted}
              maxLength={20}
            />

            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
              {ui('englishName', lang)}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor }]}
              value={en}
              onChangeText={(v) => handleFieldChange(setEn, v)}
              placeholder={ui('englishNamePlaceholder', lang)}
              placeholderTextColor={colors.textMuted}
              maxLength={30}
            />

            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
              {ui('emojiLabel', lang)}
            </Text>
            <TextInput
              style={[styles.input, styles.emojiInput, { backgroundColor: colors.bg, color: colors.text, borderColor }]}
              value={emoji}
              onChangeText={(v) => handleFieldChange(setEmoji, v)}
              maxLength={2}
            />

            {hasChanges && (
              <Pressable
                onPress={handleSave}
                disabled={!ko.trim() || !en.trim()}
                style={({ pressed }) => [
                  styles.saveBtn,
                  { backgroundColor: ko.trim() && en.trim() ? colors.primary : colors.surface },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.saveBtnText, { color: ko.trim() && en.trim() ? '#fff' : colors.textMuted }]}>
                  {`💾 ${ui('saveChanges', lang)}`}
                </Text>
              </Pressable>
            )}
          </View>
        </>
      )}

      {/* ── Voice Data Section ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {`🎙️ ${ui('voiceData', lang)}`}
      </Text>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        {/* User recording */}
        <View style={styles.audioRow}>
          <View style={styles.audioInfo}>
            <Text style={[styles.audioLabel, { color: colors.text }]}>
              {ui('userRecordings', lang)}
            </Text>
            <Text style={[styles.audioStatus, { color: hasRec ? colors.success : colors.textMuted }]}>
              {hasRec ? `✅ ${ui('saved', lang)}` : ui('noRecording', lang)}
            </Text>
          </View>
          {hasRec && (
            <Pressable
              onPress={handlePlayRecording}
              style={({ pressed }) => [styles.playBtn, { backgroundColor: '#FF6B6B' }, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.playBtnText}>{'▶️'}</Text>
            </Pressable>
          )}
        </View>

        {/* Inline recorder */}
        <View style={styles.recorderWrap}>
          <VoiceRecorder word={word} lang={lang} />
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        {/* AI audio */}
        <View style={styles.audioRow}>
          <View style={styles.audioInfo}>
            <Text style={[styles.audioLabel, { color: colors.text }]}>
              {ui('aiAudioFiles', lang)}
            </Text>
            <Text style={[styles.audioStatus, { color: hasAi ? colors.success : colors.textMuted }]}>
              {hasAi ? `✅ ${ui('saved', lang)}` : ui('noAiAudio', lang)}
            </Text>
          </View>
          {hasAi && (
            <View style={styles.audioActions}>
              <Pressable
                onPress={handlePlayAiAudio}
                style={({ pressed }) => [styles.playBtn, { backgroundColor: '#4ECDC4' }, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.playBtnText}>{'▶️'}</Text>
              </Pressable>
              <Pressable
                onPress={handleDeleteAiAudio}
                style={({ pressed }) => [styles.playBtn, { backgroundColor: colors.danger }, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.playBtnText}>{'🗑️'}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  errorText: { fontSize: 20, fontWeight: '700' },
  mainBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.md },
  mainBtnText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  header: { marginBottom: 8 },
  backBtn: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md },
  backText: { fontSize: 18, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 16 },

  // Preview
  previewCard: { borderRadius: radius.lg, padding: 24, alignItems: 'center', marginBottom: 20 },
  previewCenter: { alignItems: 'center' },
  previewImage: { width: 140, height: 140, borderRadius: 20 },
  previewEmoji: { fontSize: 100, lineHeight: 120 },
  previewWord: { fontSize: 36, fontWeight: '900', marginTop: 8 },
  previewHint: { fontSize: 14, fontWeight: '500', marginTop: 6 },

  // Sections
  sectionTitle: { fontSize: 18, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  section: { borderRadius: radius.md, padding: 16, gap: 12 },

  // Photo
  photoRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  photoBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.md },
  photoBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // Fields
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  input: { fontSize: 17, fontWeight: '600', paddingHorizontal: 14, paddingVertical: 12, borderRadius: radius.sm, borderWidth: 1.5 },
  emojiInput: { fontSize: 32, textAlign: 'center', width: 70, paddingVertical: 8 },
  saveBtn: { paddingVertical: 14, borderRadius: radius.md, alignItems: 'center', marginTop: 4 },
  saveBtnText: { fontSize: 17, fontWeight: '800' },

  // Audio
  audioRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  audioInfo: { flex: 1, gap: 2 },
  audioLabel: { fontSize: 16, fontWeight: '700' },
  audioStatus: { fontSize: 13, fontWeight: '500' },
  audioActions: { flexDirection: 'row', gap: 8 },
  playBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  playBtnText: { fontSize: 18 },
  recorderWrap: { alignItems: 'center' },
  divider: { height: 1 },
});
