import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import type { Lang } from '../data/words';

const LANG_MAP: Record<Lang, string> = {
  ko: 'ko-KR',
  en: 'en-US',
};

const isWeb = Platform.OS === 'web';
const hasWebSpeech =
  isWeb &&
  typeof globalThis !== 'undefined' &&
  typeof (globalThis as any).window !== 'undefined' &&
  typeof (globalThis as any).window.speechSynthesis !== 'undefined';

let warmedUp = false;
let unlocked = false;

function webSpeak(text: string, lang: Lang, rate = 0.9): void {
  if (!hasWebSpeech) return;
  const synth = (globalThis as any).window.speechSynthesis as SpeechSynthesis;
  try {
    synth.cancel();
  } catch {
    // ignore
  }
  const utterance = new (globalThis as any).window.SpeechSynthesisUtterance(
    text,
  ) as SpeechSynthesisUtterance;
  utterance.lang = LANG_MAP[lang];
  utterance.rate = rate;
  utterance.pitch = 1.0;
  synth.speak(utterance);
}

/**
 * On iOS WebKit (Safari + iOS Chrome), speechSynthesis must be primed
 * with a speak() call from within a direct user gesture. This "unlocks"
 * audio output for the rest of the session. Safe to call every tap —
 * subsequent calls are cheap no-ops (empty utterance).
 *
 * MUST be called synchronously from an onPress / onClick handler.
 */
export function unlockAudio(): void {
  if (unlocked || !hasWebSpeech) return;
  try {
    const synth = (globalThis as any).window
      .speechSynthesis as SpeechSynthesis;
    const utterance = new (globalThis as any).window.SpeechSynthesisUtterance(
      '',
    ) as SpeechSynthesisUtterance;
    utterance.volume = 0;
    synth.speak(utterance);
    unlocked = true;
  } catch {
    // ignore
  }
}

export async function warmUpTTS(): Promise<void> {
  if (warmedUp) return;
  try {
    await Speech.getAvailableVoicesAsync();
    warmedUp = true;
  } catch {
    // best-effort
  }
}

/**
 * Speak synchronously. Must be called from within a user gesture on
 * iOS WebKit browsers for the very first speak of the session.
 */
export function speak(text: string, lang: Lang, rate = 0.9): void {
  if (isWeb) {
    webSpeak(text, lang, rate);
    return;
  }
  try {
    Speech.stop();
  } catch {
    // ignore
  }
  Speech.speak(text, {
    language: LANG_MAP[lang],
    rate,
    pitch: 1.0,
  });
}

export function stopSpeaking(): void {
  if (hasWebSpeech) {
    try {
      (globalThis as any).window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
    return;
  }
  try {
    Speech.stop();
  } catch {
    // ignore
  }
}
