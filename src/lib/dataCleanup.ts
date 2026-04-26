import { SUPPORTED_LANGS } from '../data/words';
import type { Lang } from '../data/words';
import { deleteRecording } from './audioStorage';
import { deleteAiAudio } from './aiAudioStorage';
import { deleteImage } from './imageStorage';

const ALL_LANGS = SUPPORTED_LANGS.map((l) => l.code);

export async function deleteWordData(wordId: string): Promise<void> {
  const tasks: Promise<void>[] = [deleteImage(wordId)];
  for (const lang of ALL_LANGS) {
    tasks.push(deleteRecording(wordId, lang));
    tasks.push(deleteAiAudio(wordId, lang));
  }
  await Promise.allSettled(tasks);
}

export async function deleteWordsData(wordIds: string[]): Promise<void> {
  await Promise.allSettled(wordIds.map((id) => deleteWordData(id)));
}

export interface StorageSummary {
  userRecordings: number;
  aiAudio: number;
  customCards: number;
  customCategories: number;
  photoOverrides: number;
}

export async function getStorageSummary(
  customWordsCount: number,
  customCategoriesCount: number,
  photoOverridesCount: number,
): Promise<StorageSummary> {
  const { getRecordingCount } = await import('./audioStorage');
  const { getAiAudioCount } = await import('./aiAudioStorage');

  const [userRecordings, aiAudio] = await Promise.all([
    getRecordingCount().catch(() => 0),
    getAiAudioCount().catch(() => 0),
  ]);

  return {
    userRecordings,
    aiAudio,
    customCards: customWordsCount,
    customCategories: customCategoriesCount,
    photoOverrides: photoOverridesCount,
  };
}
