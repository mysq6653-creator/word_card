import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, useThemeColors } from '../src/lib/theme';
import { useCardStore, type ColorMode } from '../src/store/useCardStore';
import { usePremiumStore } from '../src/store/usePremiumStore';
import type { Lang } from '../src/data/words';

type SegmentOption<T> = { label: string; value: T };

function Segment<T extends string | number>({
  options,
  value,
  onChange,
  colors,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={[segStyles.row, { backgroundColor: colors.surface }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            style={[
              segStyles.item,
              active && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                segStyles.label,
                { color: active ? '#fff' : colors.text },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const segStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
  },
  item: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const lang = useCardStore((s) => s.lang);
  const setLang = useCardStore((s) => s.setLang);
  const colorMode = useCardStore((s) => s.colorMode);
  const setColorMode = useCardStore((s) => s.setColorMode);
  const autoplaySpeed = useCardStore((s) => s.autoplaySpeed);
  const setAutoplaySpeed = useCardStore((s) => s.setAutoplaySpeed);
  const ttsRate = useCardStore((s) => s.ttsRate);
  const setTtsRate = useCardStore((s) => s.setTtsRate);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const setPremium = usePremiumStore((s) => s.setPremium);
  const adCardCredits = usePremiumStore((s) => s.adCardCredits);
  const adRecordCredits = usePremiumStore((s) => s.adRecordCredits);
  const quizCountToday = usePremiumStore((s) => s.quizCountToday);

  const [debugTaps, setDebugTaps] = useState(0);
  const showDebug = debugTaps >= 5;

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
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
          <Text style={[styles.backText, { color: colors.text }]}>← {lang === 'ko' ? '돌아가기' : 'Back'}</Text>
        </Pressable>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        ⚙️ {lang === 'ko' ? '설정' : 'Settings'}
      </Text>

      {/* Language */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        {lang === 'ko' ? '기본 언어' : 'Language'}
      </Text>
      <Segment<Lang>
        options={[
          { label: '🇰🇷 한국어', value: 'ko' },
          { label: '🇺🇸 English', value: 'en' },
        ]}
        value={lang}
        onChange={setLang}
        colors={colors}
      />

      {/* Dark mode */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        {lang === 'ko' ? '화면 모드' : 'Appearance'}
      </Text>
      <Segment<ColorMode>
        options={[
          { label: lang === 'ko' ? '자동' : 'Auto', value: 'auto' },
          { label: '☀️', value: 'light' },
          { label: '🌙', value: 'dark' },
        ]}
        value={colorMode}
        onChange={setColorMode}
        colors={colors}
      />

      {/* Autoplay speed */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        {lang === 'ko' ? '자동재생 속도' : 'Autoplay Speed'}
      </Text>
      <Segment<number>
        options={[
          { label: lang === 'ko' ? '느리게 (6초)' : 'Slow (6s)', value: 6000 },
          { label: lang === 'ko' ? '보통 (4초)' : 'Normal (4s)', value: 4000 },
          { label: lang === 'ko' ? '빠르게 (2초)' : 'Fast (2s)', value: 2000 },
        ]}
        value={autoplaySpeed}
        onChange={setAutoplaySpeed}
        colors={colors}
      />

      {/* TTS speed */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        {lang === 'ko' ? '발음 속도' : 'Speech Speed'}
      </Text>
      <Segment<number>
        options={[
          { label: lang === 'ko' ? '느리게' : 'Slow', value: 0.7 },
          { label: lang === 'ko' ? '보통' : 'Normal', value: 0.9 },
          { label: lang === 'ko' ? '빠르게' : 'Fast', value: 1.1 },
        ]}
        value={ttsRate}
        onChange={setTtsRate}
        colors={colors}
      />

      {/* Premium */}
      <Pressable
        onPress={() => router.push('/premium')}
        style={({ pressed }) => [
          styles.premiumBtn,
          { backgroundColor: isPremium ? '#d4edda' : '#FFF3CD' },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={styles.premiumBtnText}>
          {isPremium
            ? (lang === 'ko' ? '✅ 프리미엄 활성화됨' : '✅ Premium Active')
            : (lang === 'ko' ? '⭐ 프리미엄으로 업그레이드' : '⭐ Upgrade to Premium')}
        </Text>
        <Text style={[styles.manageArrow, { color: '#666' }]}>→</Text>
      </Pressable>

      {/* Data management */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        {lang === 'ko' ? '데이터 관리' : 'Data'}
      </Text>
      <Pressable
        onPress={() => router.push('/manage')}
        style={({ pressed }) => [
          styles.manageBtn,
          { backgroundColor: colors.surface },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={[styles.manageBtnText, { color: colors.text }]}>
          📂 {lang === 'ko' ? '카드 · 녹음 · 사진 관리' : 'Cards · Recordings · Photos'}
        </Text>
        <Text style={[styles.manageArrow, { color: colors.textMuted }]}>→</Text>
      </Pressable>

      {/* Privacy policy */}
      <Pressable
        onPress={() => router.push('/privacy')}
        style={({ pressed }) => [
          styles.linkBtn,
          pressed && { opacity: 0.6 },
        ]}
      >
        <Text style={[styles.linkText, { color: colors.primary }]}>
          {lang === 'ko' ? '📋 개인정보 처리방침' : '📋 Privacy Policy'}
        </Text>
      </Pressable>

      <Pressable onPress={() => setDebugTaps((t) => t + 1)}>
        <Text style={[styles.versionText, { color: colors.textMuted }]}>
          {lang === 'ko' ? '낱말 카드' : 'Word Card'} v1.0.0
        </Text>
      </Pressable>

      {showDebug && (
        <View style={[styles.debugBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.debugTitle, { color: colors.text }]}>
            🛠 {lang === 'ko' ? '테스트 모드' : 'Test Mode'}
          </Text>

          <View style={styles.debugRow}>
            <Text style={[styles.debugLabel, { color: colors.text }]}>
              {lang === 'ko' ? '프리미엄' : 'Premium'}: {isPremium ? 'ON' : 'OFF'}
            </Text>
            <Pressable
              onPress={() => setPremium(!isPremium)}
              style={[styles.debugToggle, { backgroundColor: isPremium ? colors.danger : colors.primary }]}
            >
              <Text style={styles.debugToggleText}>
                {isPremium ? (lang === 'ko' ? '해제' : 'OFF') : (lang === 'ko' ? '활성화' : 'ON')}
              </Text>
            </Pressable>
          </View>

          <View style={styles.debugRow}>
            <Text style={[styles.debugLabel, { color: colors.textMuted }]}>
              {lang === 'ko' ? '카드 광고 크레딧' : 'Card ad credits'}: {adCardCredits}
            </Text>
          </View>
          <View style={styles.debugRow}>
            <Text style={[styles.debugLabel, { color: colors.textMuted }]}>
              {lang === 'ko' ? '녹음 광고 크레딧' : 'Record ad credits'}: {adRecordCredits}
            </Text>
          </View>
          <View style={styles.debugRow}>
            <Text style={[styles.debugLabel, { color: colors.textMuted }]}>
              {lang === 'ko' ? '오늘 퀴즈 횟수' : 'Quiz today'}: {quizCountToday}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 8 },
  header: { marginBottom: 8 },
  backBtn: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md },
  backText: { fontSize: 18, fontWeight: '700' },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 24 },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginTop: 16, marginBottom: 8, marginLeft: 4 },
  premiumBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 18, borderRadius: radius.md, marginTop: 24 },
  premiumBtnText: { fontSize: 17, fontWeight: '800', color: '#333' },
  manageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 18, borderRadius: radius.md },
  manageBtnText: { fontSize: 17, fontWeight: '700' },
  manageArrow: { fontSize: 20, fontWeight: '700' },
  linkBtn: { paddingVertical: 14, alignItems: 'center' },
  linkText: { fontSize: 17, fontWeight: '600' },
  versionText: { textAlign: 'center', marginTop: 40, fontSize: 13 },
  debugBox: { borderRadius: 16, padding: 16, marginTop: 16, gap: 12 },
  debugTitle: { fontSize: 16, fontWeight: '800' },
  debugRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  debugLabel: { fontSize: 15, fontWeight: '600' },
  debugToggle: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  debugToggleText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
