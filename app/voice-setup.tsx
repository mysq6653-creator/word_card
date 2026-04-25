import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, useThemeColors } from '../src/lib/theme';
import { useCardStore } from '../src/store/useCardStore';
import { useVoiceStore, MAX_VOICES } from '../src/store/useVoiceStore';
import { usePremiumStore } from '../src/store/usePremiumStore';
import { isConfigured, cloneVoice, generateSpeech, deleteClonedVoice } from '../src/lib/elevenlabs';
import { requestPermission, startRecording } from '../src/lib/recorder';
import { saveAiAudio } from '../src/lib/aiAudioStorage';
import { getAllWords, wordText } from '../src/data/words';
import { ui, uiFmt } from '../src/data/ui';
import type { Lang, Word } from '../src/data/words';
import type { RecorderHandle } from '../src/lib/recorder';

function showAlert(message: string, title?: string) {
  if (Platform.OS === 'web') {
    window.alert(title ? `${title}\n${message}` : message);
  } else {
    Alert.alert(title ?? '', message);
  }
}

const SAMPLE_SENTENCES: Record<Lang, string[]> = {
  ko: [
    '안녕하세요, 저는 우리 아기에게 단어를 알려줄 거예요.',
    '사과는 빨갛고 맛있어요. 바나나는 노란색이에요.',
    '강아지가 멍멍 짖어요. 고양이가 야옹 울어요.',
    '하나, 둘, 셋, 넷, 다섯, 여섯, 일곱, 여덟, 아홉, 열.',
    '엄마가 사랑해. 아빠가 사랑해. 우리 아기 최고야.',
  ],
  en: [
    'Hello, I will teach my baby some new words today.',
    'The apple is red and delicious. The banana is yellow.',
    'The dog goes woof. The cat goes meow.',
    'One, two, three, four, five, six, seven, eight, nine, ten.',
    'Mommy loves you. Daddy loves you. You are the best baby.',
  ],
  ja: [
    'こんにちは、赤ちゃんに言葉を教えますよ。',
    'りんごは赤くておいしいです。バナナは黄色です。',
    '犬がワンワン吠えます。猫がニャーと鳴きます。',
    'いち、に、さん、し、ご、ろく、なな、はち、きゅう、じゅう。',
    'ママが大好き。パパが大好き。赤ちゃんが一番だよ。',
  ],
  es: [
    'Hola, voy a enseñarle palabras nuevas a mi bebé.',
    'La manzana es roja y deliciosa. El plátano es amarillo.',
    'El perro hace guau. El gato hace miau.',
    'Uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez.',
    'Mamá te quiere. Papá te quiere. Eres el mejor bebé.',
  ],
  zh: [
    '你好，我要教宝宝一些新单词。',
    '苹果是红色的，很好吃。香蕉是黄色的。',
    '小狗汪汪叫。小猫喵喵叫。',
    '一、二、三、四、五、六、七、八、九、十。',
    '妈妈爱你。爸爸爱你。你是最棒的宝宝。',
  ],
  fr: [
    "Bonjour, je vais apprendre de nouveaux mots à mon bébé.",
    "La pomme est rouge et délicieuse. La banane est jaune.",
    "Le chien fait ouaf. Le chat fait miaou.",
    "Un, deux, trois, quatre, cinq, six, sept, huit, neuf, dix.",
    "Maman t'aime. Papa t'aime. Tu es le meilleur bébé.",
  ],
  de: [
    'Hallo, ich werde meinem Baby neue Wörter beibringen.',
    'Der Apfel ist rot und lecker. Die Banane ist gelb.',
    'Der Hund bellt wau wau. Die Katze miaut.',
    'Eins, zwei, drei, vier, fünf, sechs, sieben, acht, neun, zehn.',
    'Mama hat dich lieb. Papa hat dich lieb. Du bist das beste Baby.',
  ],
  pt: [
    'Olá, vou ensinar palavras novas ao meu bebê.',
    'A maçã é vermelha e deliciosa. A banana é amarela.',
    'O cachorro faz au au. O gato faz miau.',
    'Um, dois, três, quatro, cinco, seis, sete, oito, nove, dez.',
    'Mamãe te ama. Papai te ama. Você é o melhor bebê.',
  ],
};

export default function VoiceSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const lang = useCardStore((s) => s.lang);

  const voices = useVoiceStore((s) => s.voices);
  const activeVoiceId = useVoiceStore((s) => s.activeVoiceId);
  const addVoice = useVoiceStore((s) => s.addVoice);
  const removeVoice = useVoiceStore((s) => s.removeVoice);
  const setActiveVoice = useVoiceStore((s) => s.setActiveVoice);

  const isPremium = usePremiumStore((s) => s.isPremium);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const recorderRef = useRef<RecorderHandle | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [voiceName, setVoiceName] = useState('');
  const [isCloning, setIsCloning] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genTotal, setGenTotal] = useState(0);
  const cancelledRef = useRef(false);

  const sampleSentences = SAMPLE_SENTENCES[lang] ?? SAMPLE_SENTENCES.en;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartRecording = useCallback(async () => {
    const granted = await requestPermission();
    if (!granted) {
      showAlert(ui('micPermission', lang));
      return;
    }

    try {
      const handle = await startRecording();
      recorderRef.current = handle;
      setIsRecording(true);
      setRecordingSeconds(0);
      setRecordedUri(null);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      showAlert(ui('cannotRecord', lang));
    }
  }, [lang]);

  const handleStopRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);

    if (recorderRef.current) {
      const uri = await recorderRef.current.stopAndGetUri();
      recorderRef.current = null;
      if (uri) {
        setRecordedUri(uri);
      }
    }
  }, []);

  const handleCloneVoice = useCallback(async () => {
    if (!recordedUri) return;
    if (voices.length >= MAX_VOICES) {
      showAlert(uiFmt('maxVoicesReached', lang, { max: String(MAX_VOICES) }));
      return;
    }

    const name = voiceName.trim() || ui('myVoice', lang);

    setIsCloning(true);
    try {
      const voiceId = await cloneVoice(name, recordedUri);
      const profile = {
        id: `voice-${Date.now()}`,
        name,
        voiceId,
        createdAt: Date.now(),
      };
      addVoice(profile);
      setActiveVoice(voiceId);
      setRecordedUri(null);
      setVoiceName('');
      setRecordingSeconds(0);
      showAlert(ui('voiceCloneCreated', lang));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      showAlert(uiFmt('voiceCloneFailed', lang, { error: message }));
    } finally {
      setIsCloning(false);
    }
  }, [recordedUri, voiceName, voices.length, lang, addVoice, setActiveVoice]);

  const handleDeleteVoice = useCallback(
    async (id: string, voiceId: string) => {
      try {
        await deleteClonedVoice(voiceId);
      } catch {
        // Voice may already be deleted from ElevenLabs; continue removing locally
      }
      removeVoice(id);
    },
    [removeVoice],
  );

  const handleGenerateAll = useCallback(async () => {
    if (!activeVoiceId) {
      showAlert(ui('selectVoiceFirst', lang));
      return;
    }

    const allWords: Word[] = getAllWords();
    const total = allWords.length;
    setGenTotal(total);
    setGenProgress(0);
    setIsGenerating(true);
    cancelledRef.current = false;

    let completed = 0;
    for (const word of allWords) {
      if (cancelledRef.current) break;

      const text = wordText(word, lang);
      try {
        const audioUri = await generateSpeech(text, activeVoiceId);
        await saveAiAudio(word.id, lang, audioUri);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        showAlert(uiFmt('generateWordFailed', lang, { word: text, error: message }));
        break;
      }

      completed += 1;
      setGenProgress(completed);
    }

    setIsGenerating(false);
    if (!cancelledRef.current) {
      showAlert(uiFmt('generateComplete', lang, { count: String(completed) }));
    }
  }, [activeVoiceId, lang]);

  const handleCancelGeneration = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  const handleGenerateCurrentCard = useCallback(async () => {
    if (!activeVoiceId) {
      showAlert(ui('selectVoiceFirst', lang));
      return;
    }

    const allWords = getAllWords();
    if (allWords.length === 0) return;
    const word = allWords[0];
    const text = wordText(word, lang);

    setIsGenerating(true);
    setGenTotal(1);
    setGenProgress(0);
    try {
      const audioUri = await generateSpeech(text, activeVoiceId);
      await saveAiAudio(word.id, lang, audioUri);
      setGenProgress(1);
      showAlert(uiFmt('sampleGenerated', lang, { word: text }));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      showAlert(uiFmt('speechGenFailed', lang, { error: message }));
    } finally {
      setIsGenerating(false);
    }
  }, [activeVoiceId, lang]);

  const formatDate = (ts: number): string => {
    const d = new Date(ts);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const apiReady = isConfigured();

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
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
          <Text style={[styles.backText, { color: colors.text }]}>
            {`← ${ui('back', lang)}`}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {`🎙️ ${ui('voiceSetup', lang)}`}
      </Text>

      {/* Section 1: API Key Status */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {ui('apiConnection', lang)}
        </Text>
        {apiReady ? (
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.statusText, { color: colors.success }]}>
              {ui('apiConnected', lang)}
            </Text>
          </View>
        ) : (
          <View>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.danger }]} />
              <Text style={[styles.statusText, { color: colors.danger }]}>
                {ui('apiKeyNotSet', lang)}
              </Text>
            </View>
            <Text style={[styles.helpText, { color: colors.textMuted }]}>
              {`app.json > expo.extra.elevenLabsApiKey${ui('setApiKeyHint', lang)}`}
            </Text>
          </View>
        )}
      </View>

      {/* Section 2: Voice Recording & Cloning */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {ui('voiceRecording', lang)}
        </Text>
        <Text style={[styles.instructions, { color: colors.textMuted }]}>
          {ui('readSentences', lang)}
        </Text>

        <View style={[styles.sampleBox, { backgroundColor: colors.bg }]}>
          {sampleSentences.map((sentence, i) => (
            <Text key={i} style={[styles.sampleText, { color: colors.text }]}>
              {sentence}
            </Text>
          ))}
        </View>

        <Pressable
          onPress={isRecording ? handleStopRecording : handleStartRecording}
          disabled={!apiReady || isCloning}
          style={({ pressed }) => [
            styles.recordBtn,
            {
              backgroundColor: isRecording ? colors.danger : colors.primary,
              opacity: !apiReady ? 0.4 : pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={styles.recordBtnText}>
            {isRecording
              ? uiFmt('stopRecordingTimer', lang, { seconds: String(recordingSeconds) })
              : ui('startRecordingBtn', lang)}
          </Text>
        </Pressable>

        {isRecording && (
          <Text style={[styles.timerText, { color: colors.textMuted }]}>
            {uiFmt('recordingTimer', lang, { seconds: String(recordingSeconds) })}
          </Text>
        )}

        {recordedUri && !isRecording && (
          <View style={styles.cloneArea}>
            <Text style={[styles.recordedLabel, { color: colors.success }]}>
              {uiFmt('recordedSeconds', lang, { seconds: String(recordingSeconds) })}
            </Text>

            <View style={styles.nameInputRow}>
              <Text style={[styles.nameLabel, { color: colors.text }]}>
                {ui('nameLabel', lang)}
              </Text>
              <TextInput
                style={[styles.nameInput, { backgroundColor: colors.bg, borderColor: colors.textMuted, color: colors.text }]}
                value={voiceName}
                onChangeText={setVoiceName}
                placeholder={ui('myVoice', lang)}
                placeholderTextColor={colors.textMuted}
                maxLength={20}
              />
            </View>

            <Pressable
              onPress={handleCloneVoice}
              disabled={isCloning || voices.length >= MAX_VOICES}
              style={({ pressed }) => [
                styles.cloneBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: isCloning || voices.length >= MAX_VOICES ? 0.5 : pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={styles.cloneBtnText}>
                {isCloning
                  ? ui('uploading', lang)
                  : ui('createVoiceClone', lang)}
              </Text>
            </Pressable>

            {voices.length >= MAX_VOICES && (
              <Text style={[styles.limitText, { color: colors.danger }]}>
                {uiFmt('maxVoicesDelete', lang, { max: String(MAX_VOICES) })}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Section 3: My Voices */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {ui('myVoices', lang)}
        </Text>
        <Text style={[styles.voiceCount, { color: colors.textMuted }]}>
          {voices.length}/{MAX_VOICES}
        </Text>

        {voices.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {ui('noVoicesYet', lang)}
          </Text>
        ) : (
          voices.map((voice) => {
            const isActive = voice.voiceId === activeVoiceId;
            return (
              <View
                key={voice.id}
                style={[
                  styles.voiceItem,
                  { backgroundColor: isActive ? colors.primary + '20' : colors.bg },
                  isActive && { borderColor: colors.primary, borderWidth: 2 },
                ]}
              >
                <View style={styles.voiceInfo}>
                  <Text style={[styles.voiceName, { color: colors.text }]}>
                    {isActive ? '✅ ' : ''}{voice.name}
                  </Text>
                  <Text style={[styles.voiceDate, { color: colors.textMuted }]}>
                    {formatDate(voice.createdAt)}
                  </Text>
                </View>
                <View style={styles.voiceActions}>
                  {!isActive && (
                    <Pressable
                      onPress={() => setActiveVoice(voice.voiceId)}
                      style={({ pressed }) => [
                        styles.selectBtn,
                        { backgroundColor: colors.primary },
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text style={styles.actionBtnText}>
                        {ui('select', lang)}
                      </Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => handleDeleteVoice(voice.id, voice.voiceId)}
                    style={({ pressed }) => [
                      styles.deleteVoiceBtn,
                      { backgroundColor: colors.danger },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={styles.actionBtnText}>
                      {ui('delete', lang)}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Section 4: Generate AI Voice */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {ui('generateAiVoice', lang)}
        </Text>

        {!activeVoiceId ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {ui('registerVoiceFirst', lang)}
          </Text>
        ) : (
          <View style={styles.generateArea}>
            <Text style={[styles.activeVoiceLabel, { color: colors.text }]}>
              {`${ui('selectedVoice', lang)} `}
              <Text style={{ fontWeight: '800', color: colors.primary }}>
                {voices.find((v) => v.voiceId === activeVoiceId)?.name ?? '—'}
              </Text>
            </Text>

            <Pressable
              onPress={handleGenerateCurrentCard}
              disabled={isGenerating || !apiReady}
              style={({ pressed }) => [
                styles.generateBtn,
                { backgroundColor: colors.accent },
                (isGenerating || !apiReady) && { opacity: 0.5 },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.generateBtnText}>
                {ui('generateSample', lang)}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleGenerateAll}
              disabled={isGenerating || !apiReady}
              style={({ pressed }) => [
                styles.generateBtn,
                { backgroundColor: colors.primary },
                (isGenerating || !apiReady) && { opacity: 0.5 },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.generateBtnText}>
                {ui('generateAllCards', lang)}
              </Text>
            </Pressable>

            {isGenerating && (
              <View style={styles.progressArea}>
                <Text style={[styles.progressText, { color: colors.text }]}>
                  {uiFmt('generatingProgress', lang, { done: String(genProgress), total: String(genTotal) })}
                </Text>

                <View style={[styles.progressBar, { backgroundColor: colors.bg }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.primary,
                        width: genTotal > 0 ? `${(genProgress / genTotal) * 100}%` : '0%',
                      },
                    ]}
                  />
                </View>

                <Pressable
                  onPress={handleCancelGeneration}
                  style={({ pressed }) => [
                    styles.cancelBtn,
                    { backgroundColor: colors.danger },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={styles.cancelBtnText}>
                    {ui('cancel', lang)}
                  </Text>
                </Pressable>
              </View>
            )}

            <Text style={[styles.noteText, { color: colors.textMuted }]}>
              {uiFmt('totalWordsCount', lang, { count: String(getAllWords().length) })}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 16 },
  header: { marginBottom: 8 },
  backBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  backText: { fontSize: 18, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  section: {
    borderRadius: radius.md,
    padding: 20,
    gap: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 16, fontWeight: '700' },
  helpText: { fontSize: 14, fontWeight: '500', marginTop: 8, lineHeight: 20 },
  instructions: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  sampleBox: {
    borderRadius: radius.sm,
    padding: 16,
    gap: 8,
  },
  sampleText: { fontSize: 15, fontWeight: '500', lineHeight: 24 },
  recordBtn: {
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  recordBtnText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  timerText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  cloneArea: { gap: 12 },
  recordedLabel: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  nameInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameLabel: { fontSize: 16, fontWeight: '700' },
  nameInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  nameInputText: { fontSize: 15, fontWeight: '500' },
  cloneBtn: {
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  cloneBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  limitText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  voiceCount: { fontSize: 14, fontWeight: '700' },
  emptyText: { fontSize: 15, fontWeight: '500', textAlign: 'center', paddingVertical: 12 },
  voiceItem: {
    borderRadius: radius.sm,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voiceInfo: { flex: 1, gap: 4 },
  voiceName: { fontSize: 16, fontWeight: '700' },
  voiceDate: { fontSize: 13, fontWeight: '500' },
  voiceActions: { flexDirection: 'row', gap: 8 },
  selectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  deleteVoiceBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  generateArea: { gap: 12 },
  activeVoiceLabel: { fontSize: 16, fontWeight: '600' },
  generateBtn: {
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  generateBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  progressArea: { gap: 12, alignItems: 'center' },
  progressText: { fontSize: 16, fontWeight: '700' },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  cancelBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
  },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  noteText: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
});
