import * as Speech from 'expo-speech';
import type { Lang } from '../data/words';

const LANG_MAP: Record<Lang, string> = {
  ko: 'ko-KR',
  en: 'en-US',
};

let warmedUp = false;

/**
 * Warm up the TTS engine by fetching available voices.
 * On web (Web Speech API), voices load asynchronously.
 */
export async function warmUpTTS(): Promise<void> {
  if (warmedUp) return;
  try {
    await Speech.getAvailableVoicesAsync();
    warmedUp = true;
  } catch {
    // best-effort
  }
}

export function speak(text: string, lang: Lang): void {
  try {
    Speech.stop();
  } catch {
    // ignore
  }
  Speech.speak(text, {
    language: LANG_MAP[lang],
    rate: 0.9,
    pitch: 1.0,
  });
}

export function stopSpeaking(): void {
  try {
    Speech.stop();
  } catch {
    // ignore
  }
}
