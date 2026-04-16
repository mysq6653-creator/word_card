import * as FileSystem from 'expo-file-system/legacy';
import type { Lang } from '../data/words';

/**
 * Native implementation: store recording files in the app document directory
 * as `{wordId}-{lang}.{ext}`. Metro automatically picks `audioStorage.web.ts`
 * on web.
 */

function filePath(wordId: string, lang: Lang, ext = 'm4a'): string {
  return `${FileSystem.documentDirectory}recordings/${wordId}-${lang}.${ext}`;
}

async function ensureDir(): Promise<void> {
  const dir = `${FileSystem.documentDirectory}recordings`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

export async function saveRecording(
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

export async function loadRecordingUri(
  wordId: string,
  lang: Lang,
): Promise<string | null> {
  const path = filePath(wordId, lang);
  const info = await FileSystem.getInfoAsync(path);
  return info.exists ? path : null;
}

export async function deleteRecording(
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

export async function hasRecording(
  wordId: string,
  lang: Lang,
): Promise<boolean> {
  return (await loadRecordingUri(wordId, lang)) !== null;
}
