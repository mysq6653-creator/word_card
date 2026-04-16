import { get, set, del } from 'idb-keyval';
import type { Lang } from '../data/words';

/**
 * Web implementation: store recording Blobs in IndexedDB keyed by
 * `{wordId}-{lang}`. Returns a blob: URL for playback.
 */

function key(wordId: string, lang: Lang): string {
  return `rec:${wordId}:${lang}`;
}

async function fetchBlob(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  return await res.blob();
}

export async function saveRecording(
  wordId: string,
  lang: Lang,
  sourceUri: string,
): Promise<void> {
  const blob = await fetchBlob(sourceUri);
  await set(key(wordId, lang), blob);
}

export async function loadRecordingUri(
  wordId: string,
  lang: Lang,
): Promise<string | null> {
  const blob = await get<Blob>(key(wordId, lang));
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function deleteRecording(
  wordId: string,
  lang: Lang,
): Promise<void> {
  await del(key(wordId, lang));
}

export async function hasRecording(
  wordId: string,
  lang: Lang,
): Promise<boolean> {
  const blob = await get<Blob>(key(wordId, lang));
  return !!blob;
}
