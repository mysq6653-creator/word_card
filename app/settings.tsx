import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { deleteAllRecordings } from '../src/lib/audioStorage';

import { radius, useThemeColors } from '../src/lib/theme';
import { useCardStore, type ColorMode } from '../src/store/useCardStore';
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
  const bumpRecordingVersion = useCardStore((s) => s.bumpRecordingVersion);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAll = useCallback(() => {
    const doDelete = async () => {
      setDeleting(true);
      try {
        await deleteAllRecordings();
        bumpRecordingVersion();
      } finally {
        setDeleting(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(lang === 'ko' ? '모든 녹음을 삭제할까요?' : 'Delete all recordings?')) {
        doDelete();
      }
    } else {
      Alert.alert(
        lang === 'ko' ? '녹음 삭제' : 'Delete Recordings',
        lang === 'ko' ? '모든 녹음을 삭제할까요? 되돌릴 수 없어요.' : 'Delete all recordings? This cannot be undone.',
        [
          { text: lang === 'ko' ? '취소' : 'Cancel', style: 'cancel' },
          { text: lang === 'ko' ? '삭제' : 'Delete', style: 'destructive', onPress: doDelete },
        ],
      );
    }
  }, [lang, bumpRecordingVersion]);

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

      {/* Delete all recordings */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        {lang === 'ko' ? '데이터 관리' : 'Data'}
      </Text>
      <Pressable
        onPress={handleDeleteAll}
        disabled={deleting}
        style={({ pressed }) => [
          styles.dangerBtn,
          { backgroundColor: colors.danger },
          (pressed || deleting) && { opacity: 0.6 },
        ]}
      >
        <Text style={styles.dangerBtnText}>
          🗑️ {deleting
            ? (lang === 'ko' ? '삭제 중...' : 'Deleting...')
            : (lang === 'ko' ? '모든 녹음 삭제' : 'Delete All Recordings')}
        </Text>
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

      <Text style={[styles.versionText, { color: colors.textMuted }]}>
        낱말 카드 v1.0.0
      </Text>
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
  dangerBtn: { paddingVertical: 16, borderRadius: radius.md, alignItems: 'center' },
  dangerBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  linkBtn: { paddingVertical: 14, alignItems: 'center' },
  linkText: { fontSize: 17, fontWeight: '600' },
  versionText: { textAlign: 'center', marginTop: 40, fontSize: 13 },
});
