import { get, set, del, keys } from 'idb-keyval';

function imgKey(wordId: string): string {
  return `img:${wordId}`;
}

export async function saveImage(wordId: string, uri: string): Promise<void> {
  const res = await fetch(uri);
  const blob = await res.blob();
  await set(imgKey(wordId), blob);
}

const activeBlobUrls = new Map<string, string>();

export async function loadImageUri(wordId: string): Promise<string | null> {
  const existing = activeBlobUrls.get(wordId);
  if (existing) URL.revokeObjectURL(existing);

  const blob = await get<Blob>(imgKey(wordId));
  if (!blob) {
    activeBlobUrls.delete(wordId);
    return null;
  }
  const url = URL.createObjectURL(blob);
  activeBlobUrls.set(wordId, url);
  return url;
}

export async function deleteImage(wordId: string): Promise<void> {
  await del(imgKey(wordId));
}

export async function hasImage(wordId: string): Promise<boolean> {
  const blob = await get<Blob>(imgKey(wordId));
  return !!blob;
}

export async function deleteAllImages(): Promise<void> {
  const allKeys = await keys();
  for (const k of allKeys) {
    if (typeof k === 'string' && k.startsWith('img:')) {
      await del(k);
    }
  }
}
