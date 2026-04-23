import { create } from 'zustand';
import { storage } from './storage';

const FREE_CUSTOM_CARDS = 3;
const FREE_RECORDINGS = 3;
const FREE_QUIZ_PER_DAY = 1;

type State = {
  isPremium: boolean;
  adCardCredits: number;
  adRecordCredits: number;
  quizCountToday: number;
  quizDate: string;
};

type Actions = {
  setPremium: (v: boolean) => void;
  addAdCardCredit: () => void;
  addAdRecordCredit: () => void;
  useQuiz: () => void;
  canAddCard: (currentCustomCount: number) => boolean;
  canRecord: (currentRecordingCount: number) => boolean;
  canPlayQuiz: () => boolean;
  getCardLimit: (currentCustomCount: number) => { used: number; limit: number; needAd: boolean };
  getRecordLimit: (currentRecordingCount: number) => { used: number; limit: number; needAd: boolean };
};

const STORAGE_KEY = 'word-card-premium';

type Persisted = {
  isPremium: boolean;
  adCardCredits: number;
  adRecordCredits: number;
  quizCountToday: number;
  quizDate: string;
};

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function persistPremium(s: State) {
  const data: Persisted = {
    isPremium: s.isPremium,
    adCardCredits: s.adCardCredits,
    adRecordCredits: s.adRecordCredits,
    quizCountToday: s.quizCountToday,
    quizDate: s.quizDate,
  };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const usePremiumStore = create<State & Actions>((set, get) => ({
  isPremium: false,
  adCardCredits: 0,
  adRecordCredits: 0,
  quizCountToday: 0,
  quizDate: today(),

  setPremium: (v) => {
    set({ isPremium: v });
    persistPremium(get());
  },

  addAdCardCredit: () => {
    set((s) => ({ adCardCredits: s.adCardCredits + 1 }));
    persistPremium(get());
  },

  addAdRecordCredit: () => {
    set((s) => ({ adRecordCredits: s.adRecordCredits + 1 }));
    persistPremium(get());
  },

  useQuiz: () => {
    const s = get();
    const d = today();
    if (s.quizDate !== d) {
      set({ quizCountToday: 1, quizDate: d });
    } else {
      set((s) => ({ quizCountToday: s.quizCountToday + 1 }));
    }
    persistPremium(get());
  },

  canAddCard: (currentCustomCount) => {
    const s = get();
    if (s.isPremium) return true;
    return currentCustomCount < FREE_CUSTOM_CARDS + s.adCardCredits;
  },

  canRecord: (currentRecordingCount) => {
    const s = get();
    if (s.isPremium) return true;
    return currentRecordingCount < FREE_RECORDINGS + s.adRecordCredits;
  },

  canPlayQuiz: () => {
    const s = get();
    if (s.isPremium) return true;
    const d = today();
    const count = s.quizDate === d ? s.quizCountToday : 0;
    return count < FREE_QUIZ_PER_DAY;
  },

  getCardLimit: (currentCustomCount) => {
    const s = get();
    const limit = FREE_CUSTOM_CARDS + s.adCardCredits;
    return { used: currentCustomCount, limit, needAd: !s.isPremium && currentCustomCount >= limit };
  },

  getRecordLimit: (currentRecordingCount) => {
    const s = get();
    const limit = FREE_RECORDINGS + s.adRecordCredits;
    return { used: currentRecordingCount, limit, needAd: !s.isPremium && currentRecordingCount >= limit };
  },
}));

export { FREE_CUSTOM_CARDS, FREE_RECORDINGS, FREE_QUIZ_PER_DAY };

// Hydrate
try {
  const raw = storage.getItem(STORAGE_KEY);
  const apply = (json: string | null) => {
    if (!json) return;
    try {
      const data = JSON.parse(json) as Partial<Persisted>;
      usePremiumStore.setState({
        isPremium: data.isPremium ?? false,
        adCardCredits: data.adCardCredits ?? 0,
        adRecordCredits: data.adRecordCredits ?? 0,
        quizCountToday: data.quizCountToday ?? 0,
        quizDate: data.quizDate ?? today(),
      });
    } catch {
      // ignore
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
