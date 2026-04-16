import { create } from 'zustand';
import type { Lang } from '../data/words';

type State = {
  lang: Lang;
  autoplay: boolean;
  shuffle: boolean;
  recordingVersion: number;
};

type Actions = {
  toggleLang: () => void;
  setLang: (lang: Lang) => void;
  setAutoplay: (autoplay: boolean) => void;
  setShuffle: (shuffle: boolean) => void;
  bumpRecordingVersion: () => void;
};

export const useCardStore = create<State & Actions>((set) => ({
  lang: 'ko',
  autoplay: false,
  shuffle: false,
  recordingVersion: 0,
  toggleLang: () =>
    set((s) => ({ lang: s.lang === 'ko' ? 'en' : 'ko' })),
  setLang: (lang) => set({ lang }),
  setAutoplay: (autoplay) => set({ autoplay }),
  setShuffle: (shuffle) => set({ shuffle }),
  bumpRecordingVersion: () =>
    set((s) => ({ recordingVersion: s.recordingVersion + 1 })),
}));
