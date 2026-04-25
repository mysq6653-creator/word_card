import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

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
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>😢</Text>
          <Text style={styles.title}>Oops!</Text>
          <Text style={styles.message}>Something went wrong.</Text>
          <Pressable
            onPress={this.handleReset}
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.buttonText}>Try Again</Text>
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
    backgroundColor: '#fff',
    padding: 32,
    gap: 12,
  },
  emoji: { fontSize: 64 },
  title: { fontSize: 28, fontWeight: '800', color: '#333' },
  message: { fontSize: 16, fontWeight: '500', color: '#666', textAlign: 'center' },
  button: {
    marginTop: 16,
    backgroundColor: '#4A90D9',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: { fontSize: 18, fontWeight: '700', color: '#fff' },
});
