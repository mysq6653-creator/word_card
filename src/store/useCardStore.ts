import { create } from 'zustand';
import type { Lang } from '../data/words';

type State = {
  lang: Lang;
  autoplay: boolean;
  // Bump this counter whenever a recording is saved/deleted so dependent
  // components can refresh.
  recordingVersion: number;
};

type Actions = {
  toggleLang: () => void;
  setLang: (lang: Lang) => void;
  setAutoplay: (autoplay: boolean) => void;
  bumpRecordingVersion: () => void;
};

export const useCardStore = create<State & Actions>((set) => ({
  lang: 'ko',
  autoplay: false,
  recordingVersion: 0,
  toggleLang: () =>
    set((s) => ({ lang: s.lang === 'ko' ? 'en' : 'ko' })),
  setLang: (lang) => set({ lang }),
  setAutoplay: (autoplay) => set({ autoplay }),
  bumpRecordingVersion: () =>
    set((s) => ({ recordingVersion: s.recordingVersion + 1 })),
}));
