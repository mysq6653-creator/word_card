import { create } from 'zustand';
import { storage } from './storage';

export type CustomWord = {
  id: string;
  ko: string;
  en: string;
  emoji: string;
  categoryId: string;
  hasImage: boolean;
};

export type CustomCategory = {
  id: string;
  ko: string;
  en: string;
  emoji: string;
  color: string;
};

type State = {
  customCategories: CustomCategory[];
  customWords: CustomWord[];
  imageOverrides: string[];
  version: number;
};

type Actions = {
  addCategory: (cat: CustomCategory) => void;
  removeCategory: (id: string) => void;
  addWord: (word: CustomWord) => void;
  removeWord: (id: string) => void;
  updateWord: (id: string, updates: Partial<Omit<CustomWord, 'id'>>) => void;
  addImageOverride: (wordId: string) => void;
  removeImageOverride: (wordId: string) => void;
  bump: () => void;
};

const STORAGE_KEY = 'word-card-custom';

type PersistedCustom = {
  customCategories: CustomCategory[];
  customWords: CustomWord[];
  imageOverrides: string[];
};

function persistCustom(s: State) {
  const data: PersistedCustom = {
    customCategories: s.customCategories,
    customWords: s.customWords,
    imageOverrides: s.imageOverrides,
  };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    if (__DEV__) console.warn('Custom card persist failed:', e);
  }
}

export const useCustomCardStore = create<State & Actions>((set, get) => ({
  customCategories: [],
  customWords: [],
  imageOverrides: [],
  version: 0,

  addCategory: (cat) => {
    set((s) => ({ customCategories: [...s.customCategories, cat] }));
    persistCustom(get());
  },
  removeCategory: (id) => {
    set((s) => ({
      customCategories: s.customCategories.filter((c) => c.id !== id),
      customWords: s.customWords.filter((w) => w.categoryId !== id),
    }));
    persistCustom(get());
  },
  addWord: (word) => {
    set((s) => ({ customWords: [...s.customWords, word] }));
    persistCustom(get());
  },
  removeWord: (id) => {
    set((s) => ({ customWords: s.customWords.filter((w) => w.id !== id) }));
    persistCustom(get());
  },
  updateWord: (id, updates) => {
    set((s) => ({
      customWords: s.customWords.map((w) =>
        w.id === id ? { ...w, ...updates } : w,
      ),
    }));
    persistCustom(get());
  },
  addImageOverride: (wordId) => {
    set((s) => ({
      imageOverrides: s.imageOverrides.includes(wordId)
        ? s.imageOverrides
        : [...s.imageOverrides, wordId],
    }));
    persistCustom(get());
  },
  removeImageOverride: (wordId) => {
    set((s) => ({
      imageOverrides: s.imageOverrides.filter((id) => id !== wordId),
    }));
    persistCustom(get());
  },
  bump: () => set((s) => ({ version: s.version + 1 })),
}));

// Hydrate
try {
  const raw = storage.getItem(STORAGE_KEY);
  const apply = (json: string | null) => {
    if (!json) return;
    try {
      const data = JSON.parse(json) as Partial<PersistedCustom>;
      const customCategories = Array.isArray(data.customCategories)
        ? data.customCategories.filter(
            (c): c is CustomCategory =>
              typeof c === 'object' && c !== null &&
              typeof c.id === 'string' && typeof c.ko === 'string' &&
              typeof c.en === 'string' && typeof c.emoji === 'string' &&
              typeof c.color === 'string',
          )
        : [];
      const customWords = Array.isArray(data.customWords)
        ? data.customWords.filter(
            (w): w is CustomWord =>
              typeof w === 'object' && w !== null &&
              typeof w.id === 'string' && typeof w.ko === 'string' &&
              typeof w.en === 'string' && typeof w.emoji === 'string' &&
              typeof w.categoryId === 'string',
          )
        : [];
      const imageOverrides = Array.isArray(data.imageOverrides)
        ? data.imageOverrides.filter((v): v is string => typeof v === 'string')
        : [];
      useCustomCardStore.setState({ customCategories, customWords, imageOverrides });
    } catch {
      // corrupted data — keep defaults
    }
  };
  if (raw instanceof Promise) {
    raw.then(apply);
  } else {
    apply(raw);
  }
} catch {
  // ignore
}
