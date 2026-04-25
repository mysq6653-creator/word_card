import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import type { Lang } from '../data/words';
import { storage } from './storage';

const LOCALE_TO_LANG: Record<string, Lang> = {
  ko: 'ko',
  en: 'en',
  ja: 'ja',
  es: 'es',
  zh: 'zh',
  fr: 'fr',
  de: 'de',
  pt: 'pt',
};

function getDeviceLang(): Lang {
  try {
    const locales = getLocales();
    const code = locales[0]?.languageCode ?? '';
    return LOCALE_TO_LANG[code] ?? 'en';
  } catch {}
  return 'en';
}

export type ColorMode = 'auto' | 'light' | 'dark';

type State = {
  lang: Lang;
  autoplay: boolean;
  shuffle: boolean;
  recordingVersion: number;
  colorMode: ColorMode;
  autoplaySpeed: number;
  ttsRate: number;
  _hydrated: boolean;
};

type Actions = {
  setLang: (lang: Lang) => void;
  setAutoplay: (autoplay: boolean) => void;
  setShuffle: (shuffle: boolean) => void;
  bumpRecordingVersion: () => void;
  setColorMode: (mode: ColorMode) => void;
  setAutoplaySpeed: (ms: number) => void;
  setTtsRate: (rate: number) => void;
};

const STORAGE_KEY = 'word-card-settings';

type PersistedState = {
  lang: Lang;
  colorMode: ColorMode;
  autoplaySpeed: number;
  ttsRate: number;
};

function persistState(s: State) {
  const data: PersistedState = {
    lang: s.lang,
    colorMode: s.colorMode,
    autoplaySpeed: s.autoplaySpeed,
    ttsRate: s.ttsRate,
  };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const useCardStore = create<State & Actions>((set, get) => ({
  lang: getDeviceLang(),
  autoplay: false,
  shuffle: false,
  recordingVersion: 0,
  colorMode: 'auto' as ColorMode,
  autoplaySpeed: 4000,
  ttsRate: 0.9,
  _hydrated: false,
  setLang: (lang) => {
    set({ lang });
    persistState(get());
  },
  setAutoplay: (autoplay) => set({ autoplay }),
  setShuffle: (shuffle) => set({ shuffle }),
  bumpRecordingVersion: () =>
    set((s) => ({ recordingVersion: s.recordingVersion + 1 })),
  setColorMode: (colorMode) => {
    set({ colorMode });
    persistState(get());
  },
  setAutoplaySpeed: (autoplaySpeed) => {
    set({ autoplaySpeed });
    persistState(get());
  },
  setTtsRate: (ttsRate) => {
    set({ ttsRate });
    persistState(get());
  },
}));

// Hydrate on startup
try {
  const raw = storage.getItem(STORAGE_KEY);
  const apply = (json: string | null) => {
    if (!json) {
      useCardStore.setState({ _hydrated: true });
      return;
    }
    try {
      const data = JSON.parse(json) as Partial<PersistedState>;
      useCardStore.setState({
        ...(data.lang && { lang: data.lang }),
        ...(data.colorMode && { colorMode: data.colorMode }),
        ...(data.autoplaySpeed && { autoplaySpeed: data.autoplaySpeed }),
        ...(data.ttsRate && { ttsRate: data.ttsRate }),
        _hydrated: true,
      });
    } catch {
      useCardStore.setState({ _hydrated: true });
    }
  };
  if (raw instanceof Promise) {
    raw.then(apply);
  } else {
    apply(raw);
  }
} catch {
  useCardStore.setState({ _hydrated: true });
}
