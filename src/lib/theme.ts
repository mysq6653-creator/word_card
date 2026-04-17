import { useColorScheme } from 'react-native';
import { useCardStore } from '../store/useCardStore';

export type Colors = typeof lightColors;

const lightColors = {
  bg: '#FFF9F4',
  surface: '#FFFFFF',
  text: '#2E2A26',
  textMuted: '#6B6460',
  primary: '#FF8FA3',
  accent: '#FFB4A2',
  overlay: 'rgba(0,0,0,0.35)',
  danger: '#E85D75',
  success: '#6BCB77',
};

const darkColors: typeof lightColors = {
  bg: '#1A1A2E',
  surface: '#2D2D44',
  text: '#F0ECE8',
  textMuted: '#A09A96',
  primary: '#FF8FA3',
  accent: '#FFB4A2',
  overlay: 'rgba(0,0,0,0.55)',
  danger: '#E85D75',
  success: '#6BCB77',
};

export const radius = {
  sm: 12,
  md: 20,
  lg: 32,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
} as const;

export const font = {
  word: 72,
  emoji: 220,
  emojiSmall: 64,
  title: 28,
  body: 18,
} as const;

export function useThemeColors(): Colors {
  const colorMode = useCardStore((s) => s.colorMode);
  const system = useColorScheme();
  const resolved = colorMode === 'auto' ? (system ?? 'light') : colorMode;
  return resolved === 'dark' ? darkColors : lightColors;
}

export function useIsDark(): boolean {
  const colorMode = useCardStore((s) => s.colorMode);
  const system = useColorScheme();
  const resolved = colorMode === 'auto' ? (system ?? 'light') : colorMode;
  return resolved === 'dark';
}

export function dimCategoryColor(hex: string, isDark: boolean): string {
  if (!isDark) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const f = 0.35;
  return `rgb(${Math.round(r * f)}, ${Math.round(g * f)}, ${Math.round(b * f)})`;
}

// Static fallback for non-hook contexts (avoid if possible)
export const theme = {
  colors: lightColors,
  radius,
  spacing,
  font,
} as const;
