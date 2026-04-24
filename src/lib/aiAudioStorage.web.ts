import { get, set, del, keys } from 'idb-keyval';
import type { Lang } from '../data/words';

/**
 * Web implementation: store AI-generated audio Blobs in IndexedDB keyed by
 * `ai:{wordId}:{lang}`. Returns a blob: URL for playback.
 */

function key(wordId: string, lang: Lang): string {
  return `ai:${wordId}:${lang}`;
}

async function fetchBlob(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  return await res.blob();
}

export async function saveAiAudio(
  wordId: string,
  lang: Lang,
  sourceUri: string,
): Promise<void> {
  const blob = await fetchBlob(sourceUri);
  await set(key(wordId, lang), blob);
}

const activeBlobUrls = new Map<string, string>();

export async function loadAiAudioUri(
  wordId: string,
  lang: Lang,
): Promise<string | null> {
  const k = key(wordId, lang);
  const existing = activeBlobUrls.get(k);
  if (existing) URL.revokeObjectURL(existing);

  const blob = await get<Blob>(k);
  if (!blob) {
    activeBlobUrls.delete(k);
    return null;
  }
  const url = URL.createObjectURL(blob);
  activeBlobUrls.set(k, url);
  return url;
}

export async function deleteAiAudio(
  wordId: string,
  lang: Lang,
): Promise<void> {
  const k = key(wordId, lang);
  const existing = activeBlobUrls.get(k);
  if (existing) {
    URL.revokeObjectURL(existing);
    activeBlobUrls.delete(k);
  }
  await del(k);
}

export async function hasAiAudio(
  wordId: string,
  lang: Lang,
): Promise<boolean> {
  const blob = await get<Blob>(key(wordId, lang));
  return !!blob;
}

export async function getAiAudioCount(): Promise<number> {
  const allKeys = await keys();
  return allKeys.filter((k) => typeof k === 'string' && k.startsWith('ai:')).length;
}

export async function deleteAllAiAudio(): Promise<void> {
  const allKeys = await keys();
  for (const k of allKeys) {
    if (typeof k === 'string' && k.startsWith('ai:')) {
      // Revoke any active blob URL
      const existing = activeBlobUrls.get(k);
      if (existing) {
        URL.revokeObjectURL(existing);
        activeBlobUrls.delete(k);
      }
      await del(k);
    }
  }
}
