import React from 'react';
import { Appearance, Pressable, StyleSheet, Text, View } from 'react-native';

import { ui } from '../data/ui';
import { useCardStore } from '../store/useCardStore';
import type { Lang } from '../data/words';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

function getLang(): Lang {
  try {
    return useCardStore.getState().lang;
  } catch {
    return 'en';
  }
}

function getIsDark(): boolean {
  try {
    const colorMode = useCardStore.getState().colorMode;
    const system = Appearance.getColorScheme();
    const resolved = colorMode === 'auto' ? (system ?? 'light') : colorMode;
    return resolved === 'dark';
  } catch {
    return false;
  }
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      const lang = getLang();
      const isDark = getIsDark();
      return (
        <View style={[styles.container, { backgroundColor: isDark ? '#1A1A2E' : '#fff' }]}>
          <Text style={styles.emoji}>😢</Text>
          <Text style={[styles.title, { color: isDark ? '#F0ECE8' : '#333' }]}>{ui('errorOops', lang)}</Text>
          <Text style={[styles.message, { color: isDark ? '#A09A96' : '#666' }]}>{ui('errorMessage', lang)}</Text>
          <Pressable
            onPress={this.handleReset}
            style={({ pressed }) => [styles.button, { backgroundColor: '#FF8FA3' }, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel={ui('errorRetry', lang)}
          >
            <Text style={styles.buttonText}>{ui('errorRetry', lang)}</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emoji: { fontSize: 64 },
  title: { fontSize: 28, fontWeight: '800' },
  message: { fontSize: 16, fontWeight: '500', textAlign: 'center' },
  button: {
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: { fontSize: 18, fontWeight: '700', color: '#fff' },
});
