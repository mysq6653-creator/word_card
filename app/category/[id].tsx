import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
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

import { getAllWords, getCategoryById, shuffleWords } from '../../src/data/words';
import type { Word } from '../../src/data/words';
import { loadRecordingUri } from '../../src/lib/audioStorage';
import { playUri, stopPlayback } from '../../src/lib/recorder';
import { dimCategoryColor, radius, useIsDark, useThemeColors } from '../../src/lib/theme';
import { speak, stopSpeaking, unlockAudio, warmUpTTS } from '../../src/lib/tts';
import { VoiceRecorder } from '../../src/components/VoiceRecorder';
import { useCardStore } from '../../src/store/useCardStore';

const SWIPE_THRESHOLD = 80;

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = useIsDark();

  const isAll = id === '_all';
  const category = isAll ? null : getCategoryById(id ?? '');

  const [words, setWords] = useState<Word[]>(() => {
    if (isAll) return getAllWords();
    return category?.words ?? [];
  });
  const [shuffled, setShuffled] = useState(false);

  const lang = useCardStore((s) => s.lang);
  const toggleLang = useCardStore((s) => s.toggleLang);
  const autoplay = useCardStore((s) => s.autoplay);
  const setAutoplay = useCardStore((s) => s.setAutoplay);
  const recordingVersion = useCardStore((s) => s.recordingVersion);
  const autoplaySpeed = useCardStore((s) => s.autoplaySpeed);
  const ttsRate = useCardStore((s) => s.ttsRate);

  const [index, setIndex] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const width = Dimensions.get('window').width;

  const toggleShuffle = useCallback(() => {
    setShuffled((prev) => {
      const next = !prev;
      const base = isAll ? getAllWords() : category?.words ?? [];
      setWords(next ? shuffleWords(base) : base);
      setIndex(0);
      return next;
    });
  }, [isAll, category]);

  useEffect(() => {
    warmUpTTS();
  }, []);

  useEffect(() => {
    setIndex(0);
    setShuffled(false);
    if (isAll) setWords(getAllWords());
    else if (category) setWords(category.words);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const word = words[index];

  useEffect(() => {
    if (!word) {
      setRecordingUri(null);
      return;
    }
    let cancelled = false;
    loadRecordingUri(word.id, lang).then((uri) => {
      if (!cancelled) setRecordingUri(uri);
    });
    return () => {
      cancelled = true;
    };
  }, [word?.id, lang, recordingVersion]);

  const playCurrent = useCallback(() => {
    if (!word) return;
    unlockAudio();
    stopSpeaking();
    stopPlayback().catch(() => {});
    if (recordingUri) {
      playUri(recordingUri).catch(() => {});
    } else {
      speak(lang === 'ko' ? word.ko : word.en, lang, ttsRate);
    }
  }, [word, lang, recordingUri, ttsRate]);

  const goNext = useCallback(() => {
    if (words.length === 0) return;
    setIndex((i) => (i + 1) % words.length);
  }, [words]);

  const goPrev = useCallback(() => {
    if (words.length === 0) return;
    setIndex((i) => (i - 1 + words.length) % words.length);
  }, [words]);

  const handleNext = useCallback(() => {
    if (words.length === 0) return;
    unlockAudio();
    stopSpeaking();
    stopPlayback().catch(() => {});
    const next = (index + 1) % words.length;
    const nextWord = words[next];
    setIndex(next);
    if (nextWord) {
      speak(lang === 'ko' ? nextWord.ko : nextWord.en, lang, ttsRate);
    }
  }, [words, index, lang, ttsRate]);

  const handlePrev = useCallback(() => {
    if (words.length === 0) return;
    unlockAudio();
    stopSpeaking();
    stopPlayback().catch(() => {});
    const prev = (index - 1 + words.length) % words.length;
    const prevWord = words[prev];
    setIndex(prev);
    if (prevWord) {
      speak(lang === 'ko' ? prevWord.ko : prevWord.en, lang, ttsRate);
    }
  }, [words, index, lang, ttsRate]);

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
          speak(lang === 'ko' ? nextWord.ko : nextWord.en, lang, ttsRate);
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
    ? lang === 'ko' ? '전체보기' : 'All Cards'
    : lang === 'ko' ? category?.ko ?? '' : category?.en ?? '';

  const rawBg = isAll ? '#E0E7FF' : category?.color ?? '#fff';
  const bgColor = dimCategoryColor(rawBg, isDark);

  if ((!isAll && !category) || !word) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>카테고리를 찾을 수 없어요</Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtnError, { backgroundColor: colors.primary }]}>
          <Text style={styles.backBtnErrorText}>돌아가기</Text>
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
          onPress={() => { unlockAudio(); toggleLang(); }}
          style={({ pressed }) => [styles.iconBtn, { backgroundColor: overlayBg }, pressed && { opacity: 0.7 }]}
          accessibilityLabel="언어 전환"
        >
          <Text style={styles.langBtnText}>{lang === 'ko' ? '🇰🇷' : '🇺🇸'}</Text>
        </Pressable>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.cardArea, animatedStyle]}>
          <Pressable onPress={playCurrent} style={styles.cardPressable} accessibilityLabel={`${word.ko} 발음 듣기`}>
            <Text style={styles.emoji}>{word.emoji}</Text>
            <Text style={[styles.word, { color: colors.text }]}>{lang === 'ko' ? word.ko : word.en}</Text>
            <Text style={[styles.hint, { color: colors.textMuted }]}>{lang === 'ko' ? '탭하여 듣기' : 'Tap to hear'}</Text>
          </Pressable>
        </Animated.View>
      </GestureDetector>

      <View style={styles.pager}>
        <Pressable
          onPress={toggleShuffle}
          style={({ pressed }) => [styles.shuffleBtn, { backgroundColor: shuffled ? colors.primary : pillBg }, pressed && { opacity: 0.7 }]}
        >
          <Text style={[styles.shuffleText, { color: colors.text }]}>
            🔀 {shuffled ? (lang === 'ko' ? '순서대로' : 'Order') : (lang === 'ko' ? '섞기' : 'Shuffle')}
          </Text>
        </Pressable>
        <Text style={[styles.pagerText, { backgroundColor: pillBg }]}>
          <Text style={[styles.pagerCurrent, { color: colors.text }]}>{index + 1}</Text>
          <Text style={[styles.pagerDivider, { color: colors.textMuted }]}> / </Text>
          <Text style={[styles.pagerTotal, { color: colors.textMuted }]}>{words.length}</Text>
        </Text>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16, backgroundColor: barBg }]}>
        <View style={styles.bottomRow}>
          <Pressable onPress={handlePrev} style={({ pressed }) => [styles.navBtn, { backgroundColor: colors.surface, borderColor: colors.text }, pressed && { opacity: 0.7 }]}>
            <Text style={[styles.navIcon, { color: colors.text }]}>◀</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              const next = !autoplay;
              if (next) playCurrent();
              setAutoplay(next);
            }}
            style={({ pressed }) => [styles.autoplayBtn, { backgroundColor: autoplay ? colors.primary : colors.surface, borderColor: colors.primary }, pressed && { opacity: 0.7 }]}
          >
            <Text style={[styles.autoplayIcon, { color: colors.text }]}>{autoplay ? '⏸' : '▶'}</Text>
            <Text style={[styles.autoplayLabel, { color: colors.text }]}>
              {autoplay ? (lang === 'ko' ? '정지' : 'Stop') : (lang === 'ko' ? '자동재생' : 'Autoplay')}
            </Text>
          </Pressable>
          <Pressable onPress={handleNext} style={({ pressed }) => [styles.navBtn, { backgroundColor: colors.surface, borderColor: colors.text }, pressed && { opacity: 0.7 }]}>
            <Text style={[styles.navIcon, { color: colors.text }]}>▶</Text>
          </Pressable>
        </View>
        <View style={styles.recorderRow}>
          <VoiceRecorder word={word} lang={lang} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  iconBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 28, fontWeight: '800' },
  langBtnText: { fontSize: 24 },
  categoryLabel: { fontSize: 22, fontWeight: '800' },
  cardArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardPressable: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  emoji: { fontSize: 220, textAlign: 'center', lineHeight: 260 },
  word: { fontSize: 72, fontWeight: '900', textAlign: 'center', marginTop: 16 },
  hint: { fontSize: 16, marginTop: 12 },
  pager: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8, gap: 8 },
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
