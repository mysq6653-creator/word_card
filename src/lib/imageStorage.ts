import * as FileSystem from 'expo-file-system/legacy';

const DIR = `${FileSystem.documentDirectory}card-images/`;

async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
  }
}

function filePath(wordId: string): string {
  return `${DIR}${wordId}.jpg`;
}

export async function saveImage(wordId: string, uri: string): Promise<void> {
  await ensureDir();
  const dest = filePath(wordId);
  try {
    await FileSystem.deleteAsync(dest, { idempotent: true });
  } catch {
    // ignore
  }
  await FileSystem.copyAsync({ from: uri, to: dest });
}

export async function loadImageUri(wordId: string): Promise<string | null> {
  const path = filePath(wordId);
  const info = await FileSystem.getInfoAsync(path);
  return info.exists ? path : null;
}

export async function deleteImage(wordId: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(filePath(wordId), { idempotent: true });
  } catch {
    // ignore
  }
}

export async function hasImage(wordId: string): Promise<boolean> {
  return (await loadImageUri(wordId)) !== null;
}

export async function deleteAllImages(): Promise<void> {
  try {
    await FileSystem.deleteAsync(DIR, { idempotent: true });
  } catch {
    // ignore
  }
}
