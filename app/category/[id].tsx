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
import { theme } from '../../src/lib/theme';
import { speak, stopSpeaking, unlockAudio, warmUpTTS } from '../../src/lib/tts';
import { VoiceRecorder } from '../../src/components/VoiceRecorder';
import { useCardStore } from '../../src/store/useCardStore';

const SWIPE_THRESHOLD = 80;
const AUTOPLAY_INTERVAL_MS = 4000;

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

  // Reset index / words when category changes.
  useEffect(() => {
    setIndex(0);
    setShuffled(false);
    if (isAll) setWords(getAllWords());
    else if (category) setWords(category.words);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const word = words[index];

  // Pre-load the recording URI whenever the visible word / language /
  // recording version changes. Keeping this async work out of the play
  // path is critical on iOS WebKit: speak() / play() must fire within
  // the same synchronous tick as the user gesture, so no awaits allowed
  // between the tap and the audio API call.
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

  // Synchronous play — safe to call from onPress handlers on iOS Safari.
  // The first invocation must come from a real user gesture to unlock
  // audio; all subsequent timer-driven speak() calls then work for the
  // rest of the page session.
  const playCurrent = useCallback(() => {
    if (!word) return;
    unlockAudio();
    stopSpeaking();
    // Fire-and-forget: do not await before calling audio APIs.
    stopPlayback().catch(() => {});
    if (recordingUri) {
      playUri(recordingUri).catch(() => {});
    } else {
      speak(lang === 'ko' ? word.ko : word.en, lang);
    }
  }, [word, lang, recordingUri]);

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
      speak(lang === 'ko' ? nextWord.ko : nextWord.en, lang);
    }
  }, [words, index, lang]);

  const handlePrev = useCallback(() => {
    if (words.length === 0) return;
    unlockAudio();
    stopSpeaking();
    stopPlayback().catch(() => {});
    const prev = (index - 1 + words.length) % words.length;
    const prevWord = words[prev];
    setIndex(prev);
    if (prevWord) {
      speak(lang === 'ko' ? prevWord.ko : prevWord.en, lang);
    }
  }, [words, index, lang]);

  // Autoplay slideshow. The speak() on each tick runs inside a timer,
  // but iOS WebKit allows it because audio was unlocked by the tap on
  // the autoplay toggle (handled by onPress → playCurrent → unlockAudio).
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!autoplay) {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
      if (Platform.OS !== 'web') {
        deactivateKeepAwake();
      }
      return;
    }

    if (Platform.OS !== 'web') {
      activateKeepAwakeAsync();
    }
    autoplayRef.current = setInterval(() => {
      if (words.length === 0) return;
      setIndex((i) => {
        const next = (i + 1) % words.length;
        const nextWord = words[next];
        if (nextWord) {
          stopSpeaking();
          speak(lang === 'ko' ? nextWord.ko : nextWord.en, lang);
        }
        return next;
      });
    }, AUTOPLAY_INTERVAL_MS);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [autoplay, words, lang]);

  // Stop autoplay on unmount.
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
      // Dampen the drag so the card doesn't feel overly loose.
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
        // Return to center without spring bounce.
        translateX.value = withTiming(0, { duration: 200 });
      }
    });

  const headerLabel = isAll
    ? lang === 'ko' ? '전체보기' : 'All Cards'
    : lang === 'ko' ? category?.ko ?? '' : category?.en ?? '';

  const bgColor = isAll ? '#E0E7FF' : category?.color ?? '#fff';

  if ((!isAll && !category) || !word) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>카테고리를 찾을 수 없어요</Text>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtnError}
        >
          <Text style={styles.backBtnErrorText}>돌아가기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>
      {/* Top bar */}
      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top + 8 },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.iconBtn,
            pressed && { opacity: 0.7 },
          ]}
          accessibilityLabel="뒤로가기"
        >
          <Text style={styles.iconBtnText}>←</Text>
        </Pressable>

        <Text style={styles.categoryLabel}>
          {headerLabel}
        </Text>

        <Pressable
          onPress={() => {
            unlockAudio();
            toggleLang();
          }}
          style={({ pressed }) => [
            styles.iconBtn,
            pressed && { opacity: 0.7 },
          ]}
          accessibilityLabel="언어 전환"
        >
          <Text style={styles.langBtnText}>
            {lang === 'ko' ? '🇰🇷' : '🇺🇸'}
          </Text>
        </Pressable>
      </View>

      {/* Card area with swipe */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.cardArea, animatedStyle]}>
          <Pressable
            onPress={playCurrent}
            style={styles.cardPressable}
            accessibilityLabel={`${word.ko} 발음 듣기`}
          >
            <Text style={styles.emoji}>{word.emoji}</Text>
            <Text style={styles.word}>
              {lang === 'ko' ? word.ko : word.en}
            </Text>
            <Text style={styles.hint}>
              {lang === 'ko' ? '탭하여 듣기' : 'Tap to hear'}
            </Text>
          </Pressable>
        </Animated.View>
      </GestureDetector>

      {/* Page indicator + shuffle */}
      <View style={styles.pager}>
        <Pressable
          onPress={toggleShuffle}
          style={({ pressed }) => [
            styles.shuffleBtn,
            shuffled && styles.shuffleBtnActive,
            pressed && { opacity: 0.7 },
          ]}
          accessibilityLabel={shuffled ? (lang === 'ko' ? '순서대로' : 'In Order') : (lang === 'ko' ? '섞기' : 'Shuffle')}
        >
          <Text style={styles.shuffleText}>
            🔀 {shuffled ? (lang === 'ko' ? '순서대로' : 'Order') : (lang === 'ko' ? '섞기' : 'Shuffle')}
          </Text>
        </Pressable>
        <Text style={styles.pagerText}>
          <Text style={styles.pagerCurrent}>{index + 1}</Text>
          <Text style={styles.pagerDivider}> / </Text>
          <Text style={styles.pagerTotal}>{words.length}</Text>
        </Text>
      </View>

      {/* Bottom bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + 16 },
        ]}
      >
        <View style={styles.bottomRow}>
          <Pressable
            onPress={handlePrev}
            style={({ pressed }) => [
              styles.navBtn,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityLabel="이전 카드"
          >
            <Text style={styles.navIcon}>◀</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              const next = !autoplay;
              // Unlock audio and speak immediately from this user gesture
              // so iOS WebKit allows the timer-driven speaks that follow.
              if (next) playCurrent();
              setAutoplay(next);
            }}
            style={({ pressed }) => [
              styles.autoplayBtn,
              autoplay && styles.autoplayBtnActive,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityLabel={autoplay ? '자동재생 중지' : '자동재생 시작'}
          >
            <Text style={styles.autoplayIcon}>{autoplay ? '⏸' : '▶'}</Text>
            <Text style={styles.autoplayLabel}>
              {autoplay
                ? lang === 'ko'
                  ? '정지'
                  : 'Stop'
                : lang === 'ko'
                ? '자동재생'
                : 'Autoplay'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.navBtn,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityLabel="다음 카드"
          >
            <Text style={styles.navIcon}>▶</Text>
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
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
  },
  langBtnText: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
  },
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPressable: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 220,
    textAlign: 'center',
    lineHeight: 260,
  },
  word: {
    fontSize: 72,
    fontWeight: '900',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 16,
  },
  hint: {
    fontSize: 16,
    color: theme.colors.textMuted,
    marginTop: 12,
  },
  pager: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  shuffleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  shuffleBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  shuffleText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  pagerText: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden',
  },
  pagerCurrent: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.text,
  },
  pagerDivider: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  pagerTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  navBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  navIcon: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
  },
  autoplayBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  autoplayBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  autoplayIcon: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
  },
  autoplayLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  recorderRow: {
    alignItems: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.bg,
    gap: 16,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  backBtnError: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  backBtnErrorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
