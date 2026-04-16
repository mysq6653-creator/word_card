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

import { getCategoryById } from '../../src/data/words';
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
  const category = getCategoryById(id ?? '');

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

  useEffect(() => {
    warmUpTTS();
  }, []);

  // Reset index when category changes.
  useEffect(() => {
    setIndex(0);
  }, [id]);

  const word = category?.words[index];

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
    if (!category) return;
    setIndex((i) => (i + 1) % category.words.length);
  }, [category]);

  const goPrev = useCallback(() => {
    if (!category) return;
    setIndex((i) => (i - 1 + category.words.length) % category.words.length);
  }, [category]);

  // Tap-driven nav: unlock audio and speak the next word synchronously.
  const handleNext = useCallback(() => {
    if (!category) return;
    unlockAudio();
    stopSpeaking();
    stopPlayback().catch(() => {});
    const next = (index + 1) % category.words.length;
    const nextWord = category.words[next];
    setIndex(next);
    if (nextWord) {
      // We speak the TTS fallback immediately within the gesture; if a
      // recording exists for the new card, the next tap will play it.
      speak(lang === 'ko' ? nextWord.ko : nextWord.en, lang);
    }
  }, [category, index, lang]);

  const handlePrev = useCallback(() => {
    if (!category) return;
    unlockAudio();
    stopSpeaking();
    stopPlayback().catch(() => {});
    const prev = (index - 1 + category.words.length) % category.words.length;
    const prevWord = category.words[prev];
    setIndex(prev);
    if (prevWord) {
      speak(lang === 'ko' ? prevWord.ko : prevWord.en, lang);
    }
  }, [category, index, lang]);

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
      if (!category) return;
      setIndex((i) => {
        const next = (i + 1) % category.words.length;
        const nextWord = category.words[next];
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
  }, [autoplay, category, lang]);

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

  if (!category || !word) {
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
    <View style={[styles.root, { backgroundColor: category.color }]}>
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
          {lang === 'ko' ? category.ko : category.en}
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

      {/* Page indicator (current / total) */}
      <View style={styles.pager}>
        <Text style={styles.pagerText}>
          <Text style={styles.pagerCurrent}>{index + 1}</Text>
          <Text style={styles.pagerDivider}> / </Text>
          <Text style={styles.pagerTotal}>{category.words.length}</Text>
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
