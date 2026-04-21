import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppState, Platform, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';

import { useIsDark, useThemeColors } from '../src/lib/theme';
import { ToastProvider } from '../src/components/Toast';
import { initIAP, restorePurchases, endIAP } from '../src/lib/iap';
import { usePremiumStore } from '../src/store/usePremiumStore';

function useIAPSync() {
  const isPremium = usePremiumStore((s) => s.isPremium);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    initIAP();

    if (Platform.OS !== 'web') {
      restorePurchases().then((restored) => {
        if (!restored && isPremium) {
          usePremiumStore.getState().setPremium(false);
        }
      });
    }

    return () => { endIAP(); };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        restorePurchases().then((restored) => {
          if (!restored && usePremiumStore.getState().isPremium) {
            usePremiumStore.getState().setPremium(false);
          }
        });
      }
      appState.current = next;
    });

    return () => sub.remove();
  }, []);
}

export default function RootLayout() {
  const colors = useThemeColors();
  const isDark = useIsDark();

  useIAPSync();

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: colors.bg }]}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="category/[id]" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="privacy" />
          <Stack.Screen name="add-card" />
          <Stack.Screen name="manage" />
          <Stack.Screen name="quiz/[id]" />
          <Stack.Screen name="listen/[id]" />
          <Stack.Screen name="premium" />
        </Stack>
        <ToastProvider />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
