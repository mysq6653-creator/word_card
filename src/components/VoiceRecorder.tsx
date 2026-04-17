import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Lang, Word } from '../data/words';
import {
  deleteRecording,
  hasRecording,
  saveRecording,
} from '../lib/audioStorage';
import { requestPermission, startRecording } from '../lib/recorder';
import { radius, useThemeColors } from '../lib/theme';
import { useCardStore } from '../store/useCardStore';

type Props = {
  word: Word;
  lang: Lang;
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

export function VoiceRecorder({ word, lang }: Props) {
  const [state, setState] = useState<RecState>({ kind: 'idle' });
  const [hasRec, setHasRec] = useState(false);
  const bumpRecordingVersion = useCardStore((s) => s.bumpRecordingVersion);
  const recordingVersion = useCardStore((s) => s.recordingVersion);
  const colors = useThemeColors();

  useEffect(() => {
    let cancelled = false;
    hasRecording(word.id, lang).then((exists) => {
      if (!cancelled) setHasRec(exists);
    });
    return () => {
      cancelled = true;
    };
  }, [word.id, lang, recordingVersion]);

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
        showMessage('녹음 저장에 실패했어요');
      } finally {
        setState({ kind: 'idle' });
      }
      return;
    }

    if (state.kind === 'idle') {
      const granted = await requestPermission();
      if (!granted) {
        showMessage(
          lang === 'ko'
            ? '마이크 권한이 필요해요'
            : 'Microphone permission is required',
        );
        return;
      }
      try {
        const handle = await startRecording();
        setState({ kind: 'recording', handle });
      } catch {
        showMessage('녹음을 시작할 수 없어요');
      }
    }
  };

  const handleDelete = async () => {
    await deleteRecording(word.id, lang);
    bumpRecordingVersion();
  };

  const isRecording = state.kind === 'recording';

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
        accessibilityLabel={isRecording ? '녹음 중지' : '녹음 시작'}
      >
        <Text style={styles.recIcon}>{isRecording ? '⏺' : '🎙️'}</Text>
        <Text style={[styles.recLabel, { color: colors.text }]}>
          {isRecording
            ? lang === 'ko' ? '녹음 중...' : 'Recording...'
            : hasRec
            ? lang === 'ko' ? '다시 녹음' : 'Re-record'
            : lang === 'ko' ? '내 목소리' : 'Record'}
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
          accessibilityLabel="녹음 삭제"
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </Pressable>
      )}
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
});
