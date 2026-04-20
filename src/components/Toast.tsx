import { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, Text, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastMessage = { text: string; id: number };

let _show: ((msg: string) => void) | null = null;

export function showToast(msg: string) {
  _show?.(msg);
}

export function ToastProvider() {
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState<ToastMessage | null>(null);
  const idRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const opacity = useSharedValue(0);

  const hide = useCallback(() => {
    setCurrent(null);
  }, []);

  const show = useCallback(
    (msg: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      idRef.current += 1;
      setCurrent({ text: msg, id: idRef.current });
      opacity.value = 0;
      opacity.value = withTiming(1, { duration: 200 });
      timerRef.current = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(hide)();
        });
      }, 2000);
    },
    [opacity, hide],
  );

  useEffect(() => {
    _show = show;
    return () => {
      _show = null;
    };
  }, [show]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!current) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        animStyle,
        { top: insets.top + (Platform.OS === 'web' ? 16 : 56) },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.text}>{current.text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 9999,
  },
  text: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    textAlign: 'center',
  },
});
