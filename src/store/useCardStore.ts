import { create } from 'zustand';
import type { Lang } from '../data/words';
import { storage } from './storage';

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
  toggleLang: () => void;
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
  lang: 'ko',
  autoplay: false,
  shuffle: false,
  recordingVersion: 0,
  colorMode: 'auto' as ColorMode,
  autoplaySpeed: 4000,
  ttsRate: 0.9,
  _hydrated: false,
  toggleLang: () => {
    set((s) => ({ lang: s.lang === 'ko' ? 'en' : 'ko' }));
    persistState(get());
  },
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
