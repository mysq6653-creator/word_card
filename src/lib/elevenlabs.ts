import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

const BASE_URL = 'https://api.elevenlabs.io/v1';

export type ApiErrorKind = 'auth' | 'rate_limit' | 'server' | 'network' | 'unknown';

function classifyError(status: number): ApiErrorKind {
  if (status === 401 || status === 403) return 'auth';
  if (status === 429) return 'rate_limit';
  if (status >= 500) return 'server';
  return 'unknown';
}

export class ElevenLabsError extends Error {
  kind: ApiErrorKind;
  constructor(kind: ApiErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

function throwApiError(status: number, context: string): never {
  const kind = classifyError(status);
  throw new ElevenLabsError(kind, `${context} (${status})`);
}

function getApiKey(): string | null {
  const key = Constants.expoConfig?.extra?.elevenLabsApiKey;
  if (!key || typeof key !== 'string') return null;
  return key;
}

/**
 * Check whether the ElevenLabs API key is configured in app.json.
 */
export function isConfigured(): boolean {
  const key = getApiKey();
  return key !== null && key.length > 0 && key !== 'YOUR_API_KEY_HERE';
}

function requireApiKey(): string {
  const key = getApiKey();
  if (!key || key === 'YOUR_API_KEY_HERE') {
    throw new Error(
      'ElevenLabs API key is not configured. Set it in app.json > expo.extra.elevenLabsApiKey.',
    );
  }
  return key;
}

/**
 * Clone a voice by uploading an audio sample.
 * Returns the new voice_id from ElevenLabs.
 */
export async function cloneVoice(name: string, audioUri: string): Promise<string> {
  const apiKey = requireApiKey();

  const formData = new FormData();
  formData.append('name', name);
  formData.append('description', 'Cloned voice using eleven_multilingual_v2');

  if (Platform.OS !== 'web') {
    // Native: read file info and create a file part
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists) {
      throw new Error(`Audio file not found at: ${audioUri}`);
    }
    formData.append('files', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as unknown as Blob);
  } else {
    // Web: fetch the blob URI
    const response = await fetch(audioUri);
    const blob = await response.blob();
    formData.append('files', blob, 'recording.m4a');
  }

  const response = await fetch(`${BASE_URL}/voices/add`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    throwApiError(response.status, 'Voice cloning failed');
  }

  const data = await response.json();
  if (!data.voice_id) {
    throw new Error('ElevenLabs did not return a voice_id.');
  }
  return data.voice_id as string;
}

/**
 * Simple hash for generating unique-ish file names from text + voiceId.
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generate TTS audio for the given text using a cloned voice.
 * Returns a URI to the audio file (file path on native, blob URL on web).
 */
export async function generateSpeech(text: string, voiceId: string): Promise<string> {
  const apiKey = requireApiKey();

  const response = await fetch(`${BASE_URL}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    throwApiError(response.status, 'Speech generation failed');
  }

  if (Platform.OS !== 'web') {
    // Native: save the audio binary to the filesystem
    const dir = `${FileSystem.documentDirectory}ai-recordings`;
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }

    const hash = simpleHash(`${text}-${voiceId}`);
    const filePath = `${dir}/${hash}.mp3`;

    // Read the response as a base64 string via blob → FileReader
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Strip the data URL prefix
          const base64Data = reader.result.split(',')[1];
          resolve(base64Data);
        } else {
          reject(new Error('Failed to read audio blob as base64.'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader error.'));
      reader.readAsDataURL(blob);
    });

    await FileSystem.writeAsStringAsync(filePath, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return filePath;
  } else {
    // Web: create a blob URL
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}

/**
 * Delete a cloned voice from ElevenLabs.
 */
export async function deleteClonedVoice(voiceId: string): Promise<void> {
  const apiKey = requireApiKey();

  const response = await fetch(`${BASE_URL}/voices/${voiceId}`, {
    method: 'DELETE',
    headers: {
      'xi-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throwApiError(response.status, 'Voice deletion failed');
  }
}

/**
 * List all voices available in the ElevenLabs account.
 */
export async function getVoices(): Promise<{ voice_id: string; name: string }[]> {
  const apiKey = requireApiKey();

  const response = await fetch(`${BASE_URL}/voices`, {
    method: 'GET',
    headers: {
      'xi-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throwApiError(response.status, 'Fetching voices failed');
  }

  const data = await response.json();
  const voices: { voice_id: string; name: string }[] = (data.voices ?? []).map(
    (v: { voice_id: string; name: string }) => ({
      voice_id: v.voice_id,
      name: v.name,
    }),
  );
  return voices;
}
