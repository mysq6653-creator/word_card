import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Lang } from '../data/words';

export type ColorMode = 'auto' | 'light' | 'dark';

type State = {
  lang: Lang;
  autoplay: boolean;
  shuffle: boolean;
  recordingVersion: number;
  colorMode: ColorMode;
  autoplaySpeed: number;
  ttsRate: number;
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

export const useCardStore = create<State & Actions>()(
  persist(
    (set) => ({
      lang: 'ko',
      autoplay: false,
      shuffle: false,
      recordingVersion: 0,
      colorMode: 'auto' as ColorMode,
      autoplaySpeed: 4000,
      ttsRate: 0.9,
      toggleLang: () =>
        set((s) => ({ lang: s.lang === 'ko' ? 'en' : 'ko' })),
      setLang: (lang) => set({ lang }),
      setAutoplay: (autoplay) => set({ autoplay }),
      setShuffle: (shuffle) => set({ shuffle }),
      bumpRecordingVersion: () =>
        set((s) => ({ recordingVersion: s.recordingVersion + 1 })),
      setColorMode: (colorMode) => set({ colorMode }),
      setAutoplaySpeed: (autoplaySpeed) => set({ autoplaySpeed }),
      setTtsRate: (ttsRate) => set({ ttsRate }),
    }),
    {
      name: 'word-card-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        lang: s.lang,
        colorMode: s.colorMode,
        autoplaySpeed: s.autoplaySpeed,
        ttsRate: s.ttsRate,
      }),
    },
  ),
);
