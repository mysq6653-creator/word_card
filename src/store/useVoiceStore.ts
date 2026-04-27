import { create } from 'zustand';
import { storage } from './storage';

export type VoiceProfile = {
  id: string;
  name: string;
  voiceId: string;
  createdAt: number;
};

type State = {
  voices: VoiceProfile[];
  activeVoiceId: string | null;
};

type Actions = {
  addVoice: (voice: VoiceProfile) => void;
  removeVoice: (id: string) => void;
  setActiveVoice: (voiceId: string | null) => void;
  getActiveVoice: () => VoiceProfile | undefined;
};

const STORAGE_KEY = 'word-card-voices';
const MAX_VOICES = 2;

type Persisted = {
  voices: VoiceProfile[];
  activeVoiceId: string | null;
};

function persistVoices(s: State) {
  const data: Persisted = {
    voices: s.voices,
    activeVoiceId: s.activeVoiceId,
  };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    if (__DEV__) console.warn('Voice persist failed:', e);
  }
}

export const useVoiceStore = create<State & Actions>((set, get) => ({
  voices: [],
  activeVoiceId: null,

  addVoice: (voice) => {
    const s = get();
    if (s.voices.length >= MAX_VOICES) {
      throw new Error(`Maximum ${MAX_VOICES} voice profiles allowed.`);
    }
    set({ voices: [...s.voices, voice] });
    persistVoices(get());
  },

  removeVoice: (id) => {
    const s = get();
    const voice = s.voices.find((v) => v.id === id);
    const filtered = s.voices.filter((v) => v.id !== id);
    const newActiveId =
      voice && s.activeVoiceId === voice.voiceId ? null : s.activeVoiceId;
    set({ voices: filtered, activeVoiceId: newActiveId });
    persistVoices(get());
  },

  setActiveVoice: (voiceId) => {
    set({ activeVoiceId: voiceId });
    persistVoices(get());
  },

  getActiveVoice: () => {
    const s = get();
    return s.voices.find((v) => v.voiceId === s.activeVoiceId);
  },
}));

export { MAX_VOICES };

// Hydrate
try {
  const raw = storage.getItem(STORAGE_KEY);
  const apply = (json: string | null) => {
    if (!json) return;
    try {
      const data = JSON.parse(json) as Partial<Persisted>;
      const voices = Array.isArray(data.voices)
        ? data.voices.filter(
            (v): v is VoiceProfile =>
              typeof v === 'object' && v !== null &&
              typeof v.id === 'string' &&
              typeof v.name === 'string' &&
              typeof v.voiceId === 'string' &&
              typeof v.createdAt === 'number',
          )
        : [];
      const activeVoiceId =
        typeof data.activeVoiceId === 'string' ? data.activeVoiceId : null;
      useVoiceStore.setState({ voices, activeVoiceId });
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
