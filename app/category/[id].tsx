import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import {
  getAllWordsMerged,
  getCategoryByIdMerged,
  shuffleWords,
  wordText,
  catText,
} from '../../src/data/words';
import type { Word } from '../../src/data/words';
import { ui } from '../../src/data/ui';
import { loadRecordingUri, deleteRecording } from '../../src/lib/audioStorage';
import { loadAiAudioUri } from '../../src/lib/aiAudioStorage';
import { saveImage, loadImageUri, deleteImage } from '../../src/lib/imageStorage';
import { resizeImage } from '../../src/lib/imageResize';
import { playUri, stopPlayback } from '../../src/lib/recorder';
import { dimCategoryColor, radius, useIsDark, useThemeColors } from '../../src/lib/theme';
import { speak, stopSpeaking, unlockAudio, warmUpTTS } from '../../src/lib/tts';
import { VoiceRecorder } from '../../src/components/VoiceRecorder';
import { useCardStore } from '../../src/store/useCardStore';
import { useCustomCardStore } from '../../src/store/useCustomCardStore';

const SWIPE_THRESHOLD = 80;

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = useIsDark();

  const isAll = id === '_all';
  const customCategories = useCustomCardStore((s) => s.customCategories);
  const customWords = useCustomCardStore((s) => s.customWords);
  const imageOverrides = useCustomCardStore((s) => s.imageOverrides);
  const addImageOverride = useCustomCardStore((s) => s.addImageOverride);
  const removeImageOverride = useCustomCardStore((s) => s.removeImageOverride);
  const removeWord = useCustomCardStore((s) => s.removeWord);
  const customVersion = useCustomCardStore((s) => s.version);
  const bump = useCustomCardStore((s) => s.bump);

  const category = useMemo(
    () => (isAll ? null : getCategoryByIdMerged(id ?? '', customCategories, customWords)),
    [isAll, id, customCategories, customWords],
  );

  const [words, setWords] = useState<Word[]>(() => {
    if (isAll) return getAllWordsMerged(customWords);
    return category?.words ?? [];
  });
  const [shuffled, setShuffled] = useState(false);

  useEffect(() => {
    if (shuffled) return;
    if (isAll) setWords(getAllWordsMerged(customWords));
    else if (category) setWords(category.words);
  }, [customVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const lang = useCardStore((s) => s.lang);
  const autoplay = useCardStore((s) => s.autoplay);
  const setAutoplay = useCardStore((s) => s.setAutoplay);
  const recordingVersion = useCardStore((s) => s.recordingVersion);
  const autoplaySpeed = useCardStore((s) => s.autoplaySpeed);
  const ttsRate = useCardStore((s) => s.ttsRate);

  const [index, setIndex] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [aiAudioUri, setAiAudioUri] = useState<string | null>(null);
  const [cardImageUri, setCardImageUri] = useState<string | null>(null);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const width = Dimensions.get('window').width;

  const stopAudio = useCallback(() => {
    stopSpeaking();
    stopPlayback().catch(() => {});
  }, []);

  const pauseAutoplay = useCallback(() => {
    if (autoplay) {
      setAutoplay(false);
      stopAudio();
    }
  }, [autoplay, setAutoplay, stopAudio]);

  const toggleShuffle = useCallback(() => {
    pauseAutoplay();
    setShuffled((prev) => {
      const next = !prev;
      const base = isAll ? getAllWordsMerged(customWords) : category?.words ?? [];
      setWords(next ? shuffleWords(base) : base);
      setIndex(0);
      return next;
    });
  }, [isAll, category, customWords, pauseAutoplay]);

  const initialSpoken = useRef(false);

  useEffect(() => {
    warmUpTTS();
  }, []);

  useEffect(() => {
    setIndex(0);
    setShuffled(false);
    if (isAll) setWords(getAllWordsMerged(customWords));
    else {
      const cat = getCategoryByIdMerged(id ?? '', customCategories, customWords);
      if (cat) setWords(cat.words);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const word = words[index];

  useEffect(() => {
    if (!initialSpoken.current && word) {
      initialSpoken.current = true;
      const timer = setTimeout(() => {
        unlockAudio();
        speak(wordText(word, lang), lang, ttsRate);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [word?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!word) {
      setRecordingUri(null);
      setAiAudioUri(null);
      return;
    }
    let cancelled = false;
    loadRecordingUri(word.id, lang).then((uri) => {
      if (!cancelled) setRecordingUri(uri);
    });
    loadAiAudioUri(word.id, lang).then((uri) => {
      if (!cancelled) setAiAudioUri(uri);
    });
    return () => {
      cancelled = true;
    };
  }, [word?.id, lang, recordingVersion]);

  // Load card image (custom card image or image override)
  useEffect(() => {
    if (!word) {
      setCardImageUri(null);
      return;
    }
    let cancelled = false;
    const hasOverride = imageOverrides.includes(word.id);
    const isCustomWithImage = word.isCustom && customWords.find((w) => w.id === word.id)?.hasImage;
    if (hasOverride || isCustomWithImage) {
      loadImageUri(word.id).then((uri) => {
        if (!cancelled) setCardImageUri(uri);
      });
    } else {
      setCardImageUri(null);
    }
    return () => {
      cancelled = true;
    };
  }, [word?.id, imageOverrides, customWords, customVersion]);

  const playCurrent = useCallback(() => {
    if (!word) return;
    unlockAudio();
    stopAudio();
    if (recordingUri) {
      playUri(recordingUri).catch(() => {});
    } else if (aiAudioUri) {
      playUri(aiAudioUri).catch(() => {});
    } else {
      speak(wordText(word, lang), lang, ttsRate);
    }
  }, [word, lang, recordingUri, aiAudioUri, ttsRate, stopAudio]);

  const goNext = useCallback(() => {
    if (words.length === 0) return;
    stopAudio();
    const next = (index + 1) % words.length;
    setIndex(next);
    const w = words[next];
    if (w) speak(wordText(w, lang), lang, ttsRate);
  }, [words, index, lang, ttsRate, stopAudio]);

  const goPrev = useCallback(() => {
    if (words.length === 0) return;
    stopAudio();
    const prev = (index - 1 + words.length) % words.length;
    setIndex(prev);
    const w = words[prev];
    if (w) speak(wordText(w, lang), lang, ttsRate);
  }, [words, index, lang, ttsRate, stopAudio]);

  const handleNext = useCallback(() => {
    if (words.length === 0) return;
    pauseAutoplay();
    unlockAudio();
    stopAudio();
    const next = (index + 1) % words.length;
    const nextWord = words[next];
    setIndex(next);
    if (nextWord) {
      speak(wordText(nextWord, lang), lang, ttsRate);
    }
  }, [words, index, lang, ttsRate, pauseAutoplay, stopAudio]);

  const handlePrev = useCallback(() => {
    if (words.length === 0) return;
    pauseAutoplay();
    unlockAudio();
    stopAudio();
    const prev = (index - 1 + words.length) % words.length;
    const prevWord = words[prev];
    setIndex(prev);
    if (prevWord) {
      speak(wordText(prevWord, lang), lang, ttsRate);
    }
  }, [words, index, lang, ttsRate, pauseAutoplay, stopAudio]);

  const handleReplaceImage = useCallback(async () => {
    if (!word) return;
    pauseAutoplay();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled && result.assets[0]) {
      const resized = await resizeImage(result.assets[0].uri);
      await saveImage(word.id, resized);
      if (!word.isCustom) {
        addImageOverride(word.id);
      }
      bump();
    }
  }, [word, pauseAutoplay, addImageOverride, bump]);

  const handleRemoveImage = useCallback(async () => {
    if (!word) return;
    await deleteImage(word.id);
    if (!word.isCustom) {
      removeImageOverride(word.id);
    }
    bump();
  }, [word, removeImageOverride, bump]);

  const handleDeleteCard = useCallback(() => {
    if (!word?.isCustom) return;
    const doDelete = () => {
      removeWord(word.id);
      deleteImage(word.id).catch(() => {});
      deleteRecording(word.id, 'ko').catch(() => {});
      deleteRecording(word.id, 'en').catch(() => {});
      bump();
      if (words.length <= 1) {
        router.back();
      } else {
        setIndex((i) => Math.min(i, words.length - 2));
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm(ui('deleteConfirm', lang))) doDelete();
    } else {
      Alert.alert(
        ui('deleteCard', lang),
        ui('deleteConfirm', lang),
        [
          { text: ui('cancel', lang), style: 'cancel' },
          { text: ui('delete', lang), style: 'destructive', onPress: doDelete },
        ],
      );
    }
  }, [word, words.length, lang, removeWord, bump, router]);

  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!autoplay) {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
      if (Platform.OS !== 'web') deactivateKeepAwake();
      return;
    }
    if (Platform.OS !== 'web') activateKeepAwakeAsync();
    autoplayRef.current = setInterval(() => {
      if (words.length === 0) return;
      setIndex((i) => {
        const next = (i + 1) % words.length;
        const nextWord = words[next];
        if (nextWord) {
          stopSpeaking();
          speak(wordText(nextWord, lang), lang, ttsRate);
        }
        return next;
      });
    }, autoplaySpeed);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [autoplay, words, lang, autoplaySpeed, ttsRate]);

  useEffect(() => {
    return () => {
      setAutoplay(false);
      stopSpeaking();
      stopPlayback();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      translateX.value = e.translationX * 0.6;
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-width, { duration: 180 }, () => {
          translateX.value = width;
          runOnJS(goNext)();
          translateX.value = withTiming(0, { duration: 220 });
        });
      } else if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(width, { duration: 180 }, () => {
          translateX.value = -width;
          runOnJS(goPrev)();
          translateX.value = withTiming(0, { duration: 220 });
        });
      } else {
        translateX.value = withTiming(0, { duration: 200 });
      }
    });

  const headerLabel = isAll
    ? ui('allCards', lang)
    : category ? catText(category, lang) : '';

  const rawBg = isAll ? '#E0E7FF' : category?.color ?? '#fff';
  const bgColor = dimCategoryColor(rawBg, isDark);

  if ((!isAll && !category) || !word) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          {ui('categoryNotFound', lang)}
        </Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtnError, { backgroundColor: colors.primary }]}>
          <Text style={styles.backBtnErrorText}>{ui('back', lang)}</Text>
        </Pressable>
      </View>
    );
  }

  const overlayBg = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)';
  const pillBg = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.7)';
  const barBg = isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)';

  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.iconBtn, { backgroundColor: overlayBg }, pressed && { opacity: 0.7 }]}
          accessibilityLabel="뒤로가기"
        >
          <Text style={[styles.iconBtnText, { color: colors.text }]}>←</Text>
        </Pressable>
        <Text style={[styles.categoryLabel, { color: colors.text }]}>{headerLabel}</Text>
        <Pressable
          onPress={handleReplaceImage}
          style={({ pressed }) => [styles.smallBtn, { backgroundColor: overlayBg }, pressed && { opacity: 0.7 }]}
          accessibilityLabel={ui('changePhoto', lang)}
        >
          <Text style={styles.smallBtnText}>{'📷'}</Text>
        </Pressable>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.cardArea, animatedStyle]}>
          <Pressable
            onPress={() => {
              if (autoplay) {
                pauseAutoplay();
                return;
              }
              playCurrent();
            }}
            style={styles.cardPressable}
            accessibilityLabel={`${wordText(word, lang)}`}
          >
            {cardImageUri ? (
              <Image source={{ uri: cardImageUri }} style={styles.cardImage} />
            ) : (
              <Text style={styles.emoji}>{word.emoji}</Text>
            )}
            <Text style={[styles.word, { color: colors.text }]}>{wordText(word, lang)}</Text>
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              {autoplay ? ui('tapToStop', lang) : ui('tapToHear', lang)}
            </Text>
          </Pressable>
        </Animated.View>
      </GestureDetector>

      <View style={styles.pager}>
        {/* Image actions */}
        {cardImageUri && (
          <Pressable
            onPress={handleRemoveImage}
            style={({ pressed }) => [styles.removeImageBtn, { backgroundColor: pillBg }, pressed && { opacity: 0.7 }]}
          >
            <Text style={[styles.removeImageText, { color: colors.textMuted }]}>
              {`🔄 ${ui('restoreEmoji', lang)}`}
            </Text>
          </Pressable>
        )}
        <View style={styles.pagerRow}>
          <Pressable
            onPress={toggleShuffle}
            style={({ pressed }) => [styles.shuffleBtn, { backgroundColor: shuffled ? colors.primary : pillBg }, pressed && { opacity: 0.7 }]}
          >
            <Text style={[styles.shuffleText, { color: colors.text }]}>
              {`🔀 ${shuffled ? ui('order', lang) : ui('shuffle', lang)}`}
            </Text>
          </Pressable>
          <Text style={[styles.pagerText, { backgroundColor: pillBg }]}>
            <Text style={[styles.pagerCurrent, { color: colors.text }]}>{index + 1}</Text>
            <Text style={[styles.pagerDivider, { color: colors.textMuted }]}> / </Text>
            <Text style={[styles.pagerTotal, { color: colors.textMuted }]}>{words.length}</Text>
          </Text>
          {word.isCustom && (
            <Pressable
              onPress={handleDeleteCard}
              style={({ pressed }) => [styles.shuffleBtn, { backgroundColor: pillBg }, pressed && { opacity: 0.7 }]}
            >
              <Text style={[styles.shuffleText, { color: colors.danger }]}>🗑️</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16, backgroundColor: barBg }]}>
        <View style={styles.bottomRow}>
          <Pressable onPress={handlePrev} style={({ pressed }) => [styles.navBtn, { backgroundColor: colors.surface, borderColor: colors.text }, pressed && { opacity: 0.7 }]}>
            <Text style={[styles.navIcon, { color: colors.text }]}>◀</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              unlockAudio();
              const next = !autoplay;
              if (next) {
                stopAudio();
                playCurrent();
              } else {
                stopAudio();
              }
              setAutoplay(next);
            }}
            style={({ pressed }) => [styles.autoplayBtn, { backgroundColor: autoplay ? colors.primary : colors.surface, borderColor: colors.primary }, pressed && { opacity: 0.7 }]}
          >
            <Text style={[styles.autoplayIcon, { color: colors.text }]}>{autoplay ? '⏸' : '▶'}</Text>
            <Text style={[styles.autoplayLabel, { color: colors.text }]}>
              {autoplay ? ui('stop', lang) : ui('autoplay', lang)}
            </Text>
          </Pressable>
          <Pressable onPress={handleNext} style={({ pressed }) => [styles.navBtn, { backgroundColor: colors.surface, borderColor: colors.text }, pressed && { opacity: 0.7 }]}>
            <Text style={[styles.navIcon, { color: colors.text }]}>▶</Text>
          </Pressable>
        </View>
        <View style={styles.recorderRow}>
          <VoiceRecorder word={word} lang={lang} onRecordStart={pauseAutoplay} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 28, fontWeight: '800' },
  smallBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  smallBtnText: { fontSize: 20 },
  langBtnText: { fontSize: 24 },
  categoryLabel: { fontSize: 22, fontWeight: '800', flex: 1, textAlign: 'center' },
  cardArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardPressable: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  cardImage: { width: 220, height: 220, borderRadius: 24 },
  emoji: { fontSize: 220, textAlign: 'center', lineHeight: 260 },
  word: { fontSize: 72, fontWeight: '900', textAlign: 'center', marginTop: 16 },
  hint: { fontSize: 16, marginTop: 12 },
  pager: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8, gap: 8 },
  pagerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  removeImageBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  removeImageText: { fontSize: 13, fontWeight: '600' },
  shuffleBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999 },
  shuffleText: { fontSize: 15, fontWeight: '700' },
  pagerText: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, overflow: 'hidden' },
  pagerCurrent: { fontSize: 18, fontWeight: '900' },
  pagerDivider: { fontSize: 16, fontWeight: '600' },
  pagerTotal: { fontSize: 16, fontWeight: '700' },
  bottomBar: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  navBtn: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  navIcon: { fontSize: 24, fontWeight: '800' },
  autoplayBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 60, borderRadius: 30, borderWidth: 2 },
  autoplayIcon: { fontSize: 22, fontWeight: '800' },
  autoplayLabel: { fontSize: 18, fontWeight: '800' },
  recorderRow: { alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { fontSize: 20, fontWeight: '700' },
  backBtnError: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.md },
  backBtnErrorText: { fontSize: 18, fontWeight: '700', color: '#fff' },
});
