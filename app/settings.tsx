import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, useThemeColors } from '../src/lib/theme';
import { useCardStore, type ColorMode } from '../src/store/useCardStore';
import { usePremiumStore } from '../src/store/usePremiumStore';
import { SUPPORTED_LANGS } from '../src/data/words';
import type { Lang } from '../src/data/words';
import { ui } from '../src/data/ui';

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
          <Text style={[styles.backText, { color: colors.text }]}>{`← ${ui('back', lang)}`}</Text>
        </Pressable>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {`⚙️ ${ui('settings', lang)}`}
      </Text>

      {/* Language */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        {ui('language', lang)}
      </Text>
      <View style={styles.langGrid}>
        {SUPPORTED_LANGS.map((l) => {
          const active = lang === l.code;
          return (
            <Pressable
              key={l.code}
              onPress={() => setLang(l.code)}
              style={[
                styles.langChip,
                { backgroundColor: active ? colors.primary : colors.surface },
              ]}
            >
              <Text style={styles.langFlag}>{l.flag}</Text>
              <Text style={[styles.langLabel, { color: active ? '#fff' : colors.text }]} numberOfLines={1}>
                {l.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Dark mode */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        {ui('appearance', lang)}
      </Text>
      <Segment<ColorMode>
        options={[
          { label: ui('auto', lang), value: 'auto' },
          { label: '☀️', value: 'light' },
          { label: '🌙', value: 'dark' },
        ]}
        value={colorMode}
        onChange={setColorMode}
        colors={colors}
      />

      {/* Autoplay speed */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        {ui('autoplaySpeed', lang)}
      </Text>
      <Segment<number>
        options={[
          { label: `${ui('slow', lang)} (6s)`, value: 6000 },
          { label: `${ui('normal', lang)} (4s)`, value: 4000 },
          { label: `${ui('fast', lang)} (2s)`, value: 2000 },
        ]}
        value={autoplaySpeed}
        onChange={setAutoplaySpeed}
        colors={colors}
      />

      {/* TTS speed */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        {ui('speechSpeed', lang)}
      </Text>
      <Segment<number>
        options={[
          { label: ui('slow', lang), value: 0.7 },
          { label: ui('normal', lang), value: 0.9 },
          { label: ui('fast', lang), value: 1.1 },
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
            ? `✅ ${ui('premiumActive', lang)}`
            : `⭐ ${ui('upgradePremium', lang)}`}
        </Text>
        <Text style={[styles.manageArrow, { color: '#666' }]}>→</Text>
      </Pressable>

      {/* AI Voice setup */}
      <Pressable
        onPress={() => router.push('/voice-setup')}
        style={({ pressed }) => [
          styles.manageBtn,
          { backgroundColor: colors.surface, marginTop: 12 },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={[styles.manageBtnText, { color: colors.text }]}>
          🎙️ {ui('voiceSetup', lang)}
        </Text>
        <Text style={[styles.manageArrow, { color: colors.textMuted }]}>→</Text>
      </Pressable>

      {/* Data management */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        {ui('data', lang)}
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
          {`📂 ${ui('dataManage', lang)}`}
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
          {`📋 ${ui('privacyPolicy', lang)}`}
        </Text>
      </Pressable>

      <Pressable onPress={() => { if (__DEV__ || Platform.OS === 'web') setDebugTaps((t) => t + 1); }}>
        <Text style={[styles.versionText, { color: colors.textMuted }]}>
          {ui('wordCard', lang)} v1.0.0
        </Text>
      </Pressable>

      {(__DEV__ || Platform.OS === 'web') && showDebug && (
        <View style={[styles.debugBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.debugTitle, { color: colors.text }]}>
            {`🛠 ${ui('testMode', lang)}`}
          </Text>

          <View style={styles.debugRow}>
            <Text style={[styles.debugLabel, { color: colors.text }]}>
              {ui('premium', lang)}: {isPremium ? 'ON' : 'OFF'}
            </Text>
            <Pressable
              onPress={() => setPremium(!isPremium)}
              style={[styles.debugToggle, { backgroundColor: isPremium ? colors.danger : colors.primary }]}
            >
              <Text style={styles.debugToggleText}>
                {isPremium ? ui('off', lang) : ui('on', lang)}
              </Text>
            </Pressable>
          </View>

          <View style={styles.debugRow}>
            <Text style={[styles.debugLabel, { color: colors.textMuted }]}>
              {ui('cardAdCredits', lang)}: {adCardCredits}
            </Text>
          </View>
          <View style={styles.debugRow}>
            <Text style={[styles.debugLabel, { color: colors.textMuted }]}>
              {ui('recordAdCredits', lang)}: {adRecordCredits}
            </Text>
          </View>
          <View style={styles.debugRow}>
            <Text style={[styles.debugLabel, { color: colors.textMuted }]}>
              {ui('quizToday', lang)}: {quizCountToday}
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
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, minWidth: '22%' as any },
  langFlag: { fontSize: 18 },
  langLabel: { fontSize: 13, fontWeight: '700' },
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
