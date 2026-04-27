import { create } from 'zustand';
import { storage } from './storage';

const FREE_CUSTOM_CARDS = 3;
const FREE_RECORDINGS = 3;
const FREE_QUIZ_PER_DAY = 1;
const FREE_AI_CREDITS = 5;
const LIFETIME_AI_CREDITS = 100;

type State = {
  isPremium: boolean;
  adCardCredits: number;
  adRecordCredits: number;
  quizCountToday: number;
  quizDate: string;
  aiCredits: number;
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
  addAiCredits: (amount: number) => void;
  useAiCredit: () => boolean;
  canUseAiCredit: () => boolean;
  getAiCredits: () => number;
};

const STORAGE_KEY = 'word-card-premium';

type Persisted = {
  isPremium: boolean;
  adCardCredits: number;
  adRecordCredits: number;
  quizCountToday: number;
  quizDate: string;
  aiCredits: number;
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
    aiCredits: s.aiCredits,
  };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    if (__DEV__) console.warn('Premium persist failed:', e);
  }
}

export const usePremiumStore = create<State & Actions>((set, get) => ({
  isPremium: false,
  adCardCredits: 0,
  adRecordCredits: 0,
  quizCountToday: 0,
  quizDate: today(),
  aiCredits: FREE_AI_CREDITS,

  setPremium: (v) => {
    const prev = get().isPremium;
    set({ isPremium: v });
    if (v && !prev) {
      set((s) => ({ aiCredits: s.aiCredits + LIFETIME_AI_CREDITS }));
    }
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

  addAiCredits: (amount) => {
    set((s) => ({ aiCredits: s.aiCredits + amount }));
    persistPremium(get());
  },

  useAiCredit: () => {
    const s = get();
    if (s.aiCredits <= 0) return false;
    set({ aiCredits: s.aiCredits - 1 });
    persistPremium(get());
    return true;
  },

  canUseAiCredit: () => get().aiCredits > 0,

  getAiCredits: () => get().aiCredits,
}));

export { FREE_CUSTOM_CARDS, FREE_RECORDINGS, FREE_QUIZ_PER_DAY, FREE_AI_CREDITS, LIFETIME_AI_CREDITS };

// Hydrate
try {
  const raw = storage.getItem(STORAGE_KEY);
  const apply = (json: string | null) => {
    if (!json) return;
    try {
      const data = JSON.parse(json) as Partial<Persisted>;
      const safeInt = (v: unknown, fallback: number): number =>
        typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : fallback;
      const safeDate = (v: unknown): string =>
        typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : today();
      usePremiumStore.setState({
        isPremium: typeof data.isPremium === 'boolean' ? data.isPremium : false,
        adCardCredits: safeInt(data.adCardCredits, 0),
        adRecordCredits: safeInt(data.adRecordCredits, 0),
        quizCountToday: safeInt(data.quizCountToday, 0),
        quizDate: safeDate(data.quizDate),
        aiCredits: safeInt(data.aiCredits, FREE_AI_CREDITS),
      });
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
