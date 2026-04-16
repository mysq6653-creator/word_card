import { Audio } from 'expo-av';

export type RecorderHandle = {
  stopAndGetUri: () => Promise<string | null>;
};

let activeRecording: Audio.Recording | null = null;

/**
 * Request recording permission. Safe to call multiple times.
 */
export async function requestPermission(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Start a new recording. Returns a handle whose `stopAndGetUri()` resolves
 * with the recording URI. Only one recording at a time is supported.
 */
export async function startRecording(): Promise<RecorderHandle> {
  // Cleanup any leftover recording.
  if (activeRecording) {
    try {
      await activeRecording.stopAndUnloadAsync();
    } catch {
      // ignore
    }
    activeRecording = null;
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY,
  );
  await recording.startAsync();
  activeRecording = recording;

  return {
    stopAndGetUri: async () => {
      if (!activeRecording) return null;
      const rec = activeRecording;
      activeRecording = null;
      try {
        await rec.stopAndUnloadAsync();
      } catch {
        // ignore
      }
      try {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      } catch {
        // ignore
      }
      return rec.getURI();
    },
  };
}

/**
 * Play an audio URI (file path, blob URL, or http URL). Returns when playback
 * finishes, or when a new sound is played.
 */
let activeSound: Audio.Sound | null = null;

export async function playUri(uri: string): Promise<void> {
  if (activeSound) {
    try {
      await activeSound.unloadAsync();
    } catch {
      // ignore
    }
    activeSound = null;
  }
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
    );
    activeSound = sound;
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        if (activeSound === sound) activeSound = null;
      }
    });
  } catch {
    // ignore playback errors
  }
}

export async function stopPlayback(): Promise<void> {
  if (activeSound) {
    try {
      await activeSound.stopAsync();
      await activeSound.unloadAsync();
    } catch {
      // ignore
    }
    activeSound = null;
  }
}
