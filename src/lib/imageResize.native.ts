import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const MAX_SIZE = 400;

export async function resizeImage(uri: string): Promise<string> {
  try {
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: MAX_SIZE } }],
      { compress: 0.7, format: SaveFormat.JPEG },
    );
    return result.uri;
  } catch {
    return uri;
  }
}
