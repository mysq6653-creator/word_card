import * as FileSystem from 'expo-file-system/legacy';
import type { Lang } from '../data/words';

/**
 * Native implementation: store AI-generated audio files in the app document
 * directory as `ai-recordings/{wordId}-{lang}.mp3`.
 * Metro automatically picks `aiAudioStorage.web.ts` on web.
 */

function filePath(wordId: string, lang: Lang): string {
  return `${FileSystem.documentDirectory}ai-recordings/${wordId}-${lang}.mp3`;
}

async function ensureDir(): Promise<void> {
  const dir = `${FileSystem.documentDirectory}ai-recordings`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

export async function saveAiAudio(
  wordId: string,
  lang: Lang,
  sourceUri: string,
): Promise<void> {
  await ensureDir();
  const dest = filePath(wordId, lang);
  // Remove any stale file first.
  try {
    await FileSystem.deleteAsync(dest, { idempotent: true });
  } catch {
    // ignore
  }
  await FileSystem.copyAsync({ from: sourceUri, to: dest });
}

export async function loadAiAudioUri(
  wordId: string,
  lang: Lang,
): Promise<string | null> {
  const path = filePath(wordId, lang);
  const info = await FileSystem.getInfoAsync(path);
  return info.exists ? path : null;
}

export async function deleteAiAudio(
  wordId: string,
  lang: Lang,
): Promise<void> {
  const path = filePath(wordId, lang);
  try {
    await FileSystem.deleteAsync(path, { idempotent: true });
  } catch {
    // ignore
  }
}

export async function hasAiAudio(
  wordId: string,
  lang: Lang,
): Promise<boolean> {
  return (await loadAiAudioUri(wordId, lang)) !== null;
}

export async function getAiAudioCount(): Promise<number> {
  const dir = `${FileSystem.documentDirectory}ai-recordings`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) return 0;
  const files = await FileSystem.readDirectoryAsync(dir);
  return files.length;
}

export async function deleteAllAiAudio(): Promise<void> {
  const dir = `${FileSystem.documentDirectory}ai-recordings`;
  try {
    await FileSystem.deleteAsync(dir, { idempotent: true });
  } catch {
    // ignore
  }
}
