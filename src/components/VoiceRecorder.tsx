import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ui, uiFmt } from '../data/ui';
import type { Lang, Word } from '../data/words';
import {
  deleteRecording,
  getRecordingCount,
  hasRecording,
  saveRecording,
} from '../lib/audioStorage';
import { requestPermission, startRecording } from '../lib/recorder';
import { radius, useThemeColors } from '../lib/theme';
import { useCardStore } from '../store/useCardStore';
import { usePremiumStore } from '../store/usePremiumStore';
import { AdRewardModal } from './AdRewardModal';

type Props = {
  word: Word;
  lang: Lang;
  onRecordStart?: () => void;
};

type RecState =
  | { kind: 'idle' }
  | { kind: 'recording'; handle: Awaited<ReturnType<typeof startRecording>> }
  | { kind: 'saving' };

function showMessage(message: string) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    window.alert(message);
  } else {
    Alert.alert(message);
  }
}

export function VoiceRecorder({ word, lang, onRecordStart }: Props) {
  const router = useRouter();
  const [state, setState] = useState<RecState>({ kind: 'idle' });
  const stateRef = useRef(state);
  stateRef.current = state;
  const [hasRec, setHasRec] = useState(false);
  const [recCount, setRecCount] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);
  const bumpRecordingVersion = useCardStore((s) => s.bumpRecordingVersion);
  const recordingVersion = useCardStore((s) => s.recordingVersion);
  const colors = useThemeColors();

  const canRecord = usePremiumStore((s) => s.canRecord);
  const getRecordLimit = usePremiumStore((s) => s.getRecordLimit);
  const addAdRecordCredit = usePremiumStore((s) => s.addAdRecordCredit);
  const recordLimit = getRecordLimit(recCount);

  useEffect(() => {
    let cancelled = false;
    hasRecording(word.id, lang).then((exists) => {
      if (!cancelled) setHasRec(exists);
    });
    return () => {
      cancelled = true;
    };
  }, [word.id, lang, recordingVersion]);

  useEffect(() => {
    let cancelled = false;
    getRecordingCount().then((c) => {
      if (!cancelled) setRecCount(c);
    });
    return () => {
      cancelled = true;
    };
  }, [recordingVersion]);

  useEffect(() => {
    return () => {
      if (stateRef.current.kind === 'recording') {
        stateRef.current.handle.stopAndGetUri().catch(() => {});
      }
    };
  }, []);

  const handlePress = async () => {
    if (state.kind === 'recording') {
      setState({ kind: 'saving' });
      try {
        const uri = await state.handle.stopAndGetUri();
        if (uri) {
          await saveRecording(word.id, lang, uri);
          bumpRecordingVersion();
        }
      } catch {
        showMessage(ui('recordFailed', lang));
      } finally {
        setState({ kind: 'idle' });
      }
      return;
    }

    if (state.kind === 'idle') {
      if (!hasRec && !canRecord(recCount)) {
        setShowAdModal(true);
        return;
      }
      onRecordStart?.();

      const granted = await requestPermission();
      if (!granted) {
        showMessage(ui('micPermission', lang));
        return;
      }
      try {
        const handle = await startRecording();
        setState({ kind: 'recording', handle });
      } catch {
        showMessage(ui('cannotRecord', lang));
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRecording(word.id, lang);
      bumpRecordingVersion();
    } catch {
      // ignore deletion errors
    }
  };

  const isRecording = state.kind === 'recording';
  const isNewAndAtLimit = !hasRec && recordLimit.needAd;

  if (isNewAndAtLimit && !isRecording) {
    return (
      <View style={styles.limitContainer}>
        <Text style={[styles.limitText, { color: colors.textMuted }]}>
          🎙️ {uiFmt('recLimit', lang, { used: String(recCount), limit: String(recordLimit.limit) })}
        </Text>
        <View style={styles.limitRow}>
          <Pressable
            onPress={() => setShowAdModal(true)}
            style={({ pressed }) => [
              styles.adBtn,
              { backgroundColor: colors.accent },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.adBtnText}>
              📺 {ui('adPlus1', lang)}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/premium')}
            style={({ pressed }) => [
              styles.premBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.premBtnText}>⭐</Text>
          </Pressable>
        </View>
        <AdRewardModal
          visible={showAdModal}
          onReward={addAdRecordCredit}
          onClose={() => setShowAdModal(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Pressable
        onPress={handlePress}
        disabled={state.kind === 'saving'}
        style={({ pressed }) => [
          styles.recBtn,
          { backgroundColor: colors.surface, borderColor: colors.primary },
          isRecording && { backgroundColor: colors.danger, borderColor: colors.danger },
          pressed && { opacity: 0.7 },
        ]}
        accessibilityLabel={isRecording ? ui('stopRecording', lang) : ui('startRecording', lang)}
      >
        <Text style={styles.recIcon}>{isRecording ? '⏺' : '🎙️'}</Text>
        <Text style={[styles.recLabel, { color: colors.text }]}>
          {isRecording
            ? ui('recording', lang)
            : hasRec
            ? ui('reRecord', lang)
            : ui('record', lang)}
        </Text>
      </Pressable>

      {hasRec && !isRecording && (
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [
            styles.deleteBtn,
            { backgroundColor: colors.surface, borderColor: colors.textMuted },
            pressed && { opacity: 0.7 },
          ]}
          accessibilityLabel={ui('deleteRecording', lang)}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </Pressable>
      )}

      <AdRewardModal
        visible={showAdModal}
        onReward={addAdRecordCredit}
        onClose={() => setShowAdModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.md, borderWidth: 2 },
  recIcon: { fontSize: 24 },
  recLabel: { fontSize: 16, fontWeight: '700' },
  deleteBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  deleteIcon: { fontSize: 20 },
  limitContainer: { alignItems: 'center', gap: 8 },
  limitText: { fontSize: 14, fontWeight: '700' },
  limitRow: { flexDirection: 'row', gap: 8 },
  adBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 },
  adBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  premBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  premBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
