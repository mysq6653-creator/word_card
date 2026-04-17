import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getAllWords,
  getCategoryById,
  getQuizChoices,
  shuffleWords,
} from '../../src/data/words';
import type { Word } from '../../src/data/words';
import { dimCategoryColor, radius, useIsDark, useThemeColors } from '../../src/lib/theme';
import { speak, unlockAudio } from '../../src/lib/tts';
import { useCardStore } from '../../src/store/useCardStore';

const TOTAL_QUESTIONS = 10;

export default function ListenQuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = useIsDark();

  const isAll = id === '_all';
  const category = isAll ? null : getCategoryById(id ?? '');
  const pool = useMemo(
    () => (isAll ? getAllWords() : category?.words ?? []),
    [isAll, category],
  );

  const lang = useCardStore((s) => s.lang);
  const ttsRate = useCardStore((s) => s.ttsRate);

  const [queue, setQueue] = useState<Word[]>(() =>
    shuffleWords(pool).slice(0, TOTAL_QUESTIONS),
  );
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const current = queue[qIndex];
  const choices = useMemo(
    () => (current ? getQuizChoices(pool, current) : []),
    [current, pool],
  );

  const shakeX = useSharedValue(0);
  const bounceScale = useSharedValue(1);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounceScale.value }],
  }));

  const speakCurrent = useCallback(() => {
    if (!current) return;
    unlockAudio();
    speak(lang === 'ko' ? current.ko : current.en, lang, ttsRate);
  }, [current, lang, ttsRate]);

  const handleChoice = useCallback(
    (choice: Word) => {
      if (answered || !current) return;
      unlockAudio();
      setAnswered(choice.id);

      if (choice.id === current.id) {
        setScore((s) => s + 1);
        setRevealed(true);
        speak(lang === 'ko' ? current.ko : current.en, lang, ttsRate);
        bounceScale.value = withSequence(
          withTiming(1.3, { duration: 150 }),
          withTiming(1, { duration: 200 }),
        );
        setTimeout(() => {
          if (qIndex + 1 >= queue.length) {
            setFinished(true);
          } else {
            setQIndex((i) => i + 1);
            setAnswered(null);
            setRevealed(false);
          }
        }, 1500);
      } else {
        shakeX.value = withSequence(
          withTiming(-12, { duration: 50 }),
          withTiming(12, { duration: 50 }),
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 50 }),
          withTiming(0, { duration: 50 }),
        );
        setTimeout(() => {
          setAnswered(null);
          speakCurrent();
        }, 800);
      }
    },
    [answered, current, lang, ttsRate, qIndex, queue.length, bounceScale, shakeX, speakCurrent],
  );

  const restart = useCallback(() => {
    setQueue(shuffleWords(pool).slice(0, TOTAL_QUESTIONS));
    setQIndex(0);
    setScore(0);
    setAnswered(null);
    setFinished(false);
    setRevealed(false);
  }, [pool]);

  const rawBg = isAll ? '#E8F5E9' : category?.color ?? '#E8F5E9';
  const bgColor = dimCategoryColor(rawBg, isDark);
  const headerLabel = isAll
    ? lang === 'ko' ? '듣기 퀴즈' : 'Listening Quiz'
    : lang === 'ko' ? `${category?.ko} 듣기` : `${category?.en} Listen`;

  if (pool.length < 3) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={[styles.msgText, { color: colors.text }]}>
          {lang === 'ko' ? '퀴즈를 하려면 카드가 3개 이상 필요해요' : 'Need at least 3 cards'}
        </Text>
        <Pressable onPress={() => router.back()} style={[styles.mainBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.mainBtnText}>{lang === 'ko' ? '돌아가기' : 'Back'}</Text>
        </Pressable>
      </View>
    );
  }

  if (finished) {
    return (
      <View style={[styles.center, { backgroundColor: bgColor }]}>
        <Text style={styles.celebEmoji}>🎉</Text>
        <Text style={[styles.celebTitle, { color: colors.text }]}>
          {lang === 'ko' ? '잘했어요!' : 'Great Job!'}
        </Text>
        <Text style={[styles.celebScore, { color: colors.text }]}>
          ⭐ {score} / {queue.length}
        </Text>
        <View style={styles.celebRow}>
          <Pressable onPress={restart} style={[styles.mainBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.mainBtnText}>{lang === 'ko' ? '다시 하기' : 'Play Again'}</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={[styles.mainBtn, { backgroundColor: colors.surface }]}>
            <Text style={[styles.mainBtnText, { color: colors.text }]}>{lang === 'ko' ? '돌아가기' : 'Back'}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!current) return null;

  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.iconBtn,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)' },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.iconBtnText, { color: colors.text }]}>←</Text>
        </Pressable>
        <Text style={[styles.headerLabel, { color: colors.text }]}>{headerLabel}</Text>
        <View style={[styles.scoreBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.7)' }]}>
          <Text style={[styles.scoreText, { color: colors.text }]}>⭐ {score}/{queue.length}</Text>
        </View>
      </View>

      <View style={styles.listenArea}>
        <Animated.View style={bounceStyle}>
          <Text style={[styles.listenPrompt, { color: colors.text }]}>
            {lang === 'ko' ? '잘 듣고 골라보세요!' : 'Listen and pick!'}
          </Text>

          {revealed && (
            <Text style={styles.revealedWord}>
              {current.emoji} {lang === 'ko' ? current.ko : current.en}
            </Text>
          )}
        </Animated.View>

        <Pressable
          onPress={speakCurrent}
          style={({ pressed }) => [
            styles.speakBtn,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.7)' },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.speakBtnText}>🔊 {lang === 'ko' ? '다시 듣기' : 'Listen Again'}</Text>
        </Pressable>
      </View>

      <Animated.View style={[styles.choicesArea, shakeStyle, { paddingBottom: insets.bottom + 32 }]}>
        {choices.map((choice) => {
          const isCorrect = choice.id === current.id;
          const isChosen = choice.id === answered;
          let borderColor = colors.surface;
          if (answered) {
            if (isChosen && isCorrect) borderColor = colors.success;
            else if (isChosen && !isCorrect) borderColor = colors.danger;
          }
          return (
            <Pressable
              key={choice.id}
              onPress={() => handleChoice(choice)}
              style={({ pressed }) => [
                styles.choiceBtn,
                { backgroundColor: colors.surface, borderColor },
                answered && isChosen && isCorrect && { backgroundColor: '#d4edda' },
                answered && isChosen && !isCorrect && { backgroundColor: '#f8d7da' },
                pressed && !answered && { transform: [{ scale: 0.95 }] },
              ]}
            >
              <Text style={styles.choiceEmoji}>{choice.emoji}</Text>
            </Pressable>
          );
        })}
      </Animated.View>

      <View style={styles.progress}>
        <Text style={[styles.progressText, { color: colors.textMuted }]}>
          {qIndex + 1} / {queue.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  iconBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 28, fontWeight: '800' },
  headerLabel: { fontSize: 22, fontWeight: '800' },
  scoreBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  scoreText: { fontSize: 18, fontWeight: '800' },
  listenArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 24 },
  listenPrompt: { fontSize: 32, fontWeight: '900', textAlign: 'center' },
  revealedWord: { fontSize: 40, fontWeight: '800', textAlign: 'center', marginTop: 16 },
  speakBtn: { paddingHorizontal: 28, paddingVertical: 16, borderRadius: 999 },
  speakBtnText: { fontSize: 20, fontWeight: '700' },
  choicesArea: { flexDirection: 'row', justifyContent: 'center', gap: 16, paddingHorizontal: 20 },
  choiceBtn: { width: 100, height: 100, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 4 },
  choiceEmoji: { fontSize: 56 },
  progress: { position: 'absolute', bottom: 8, left: 0, right: 0, alignItems: 'center' },
  progressText: { fontSize: 14, fontWeight: '600' },
  msgText: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  mainBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: radius.md },
  mainBtnText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  celebEmoji: { fontSize: 80 },
  celebTitle: { fontSize: 36, fontWeight: '900' },
  celebScore: { fontSize: 28, fontWeight: '800' },
  celebRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
});
