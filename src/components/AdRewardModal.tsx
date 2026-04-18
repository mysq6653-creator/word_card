import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../lib/theme';
import { useCardStore } from '../store/useCardStore';

type Props = {
  visible: boolean;
  onReward: () => void;
  onClose: () => void;
};

const AD_DURATION = 3;

export function AdRewardModal({ visible, onReward, onClose }: Props) {
  const colors = useThemeColors();
  const lang = useCardStore((s) => s.lang);
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!visible) {
      setCountdown(AD_DURATION);
      setDone(false);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          setDone(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [visible]);

  const handleCollect = useCallback(() => {
    onReward();
    onClose();
  }, [onReward, onClose]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={styles.adLabel}>AD</Text>

          <View style={styles.adBox}>
            <Text style={styles.adEmoji}>📺</Text>
            <Text style={[styles.adText, { color: colors.textMuted }]}>
              {lang === 'ko' ? '광고 영역' : 'Ad Space'}
            </Text>
          </View>

          {done ? (
            <Pressable
              onPress={handleCollect}
              style={({ pressed }) => [
                styles.rewardBtn,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.rewardBtnText}>
                🎁 {lang === 'ko' ? '보상 받기' : 'Collect Reward'}
              </Text>
            </Pressable>
          ) : (
            <Text style={[styles.countdownText, { color: colors.textMuted }]}>
              {lang === 'ko' ? `${countdown}초 후 보상 받기` : `Reward in ${countdown}s`}
            </Text>
          )}

          {done && (
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>
                {lang === 'ko' ? '닫기' : 'Close'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  adLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 2,
  },
  adBox: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  adEmoji: { fontSize: 48 },
  adText: { fontSize: 14, fontWeight: '600' },
  rewardBtn: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 999,
  },
  rewardBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  countdownText: {
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 16,
  },
  closeBtn: { paddingVertical: 8 },
  closeBtnText: { fontSize: 14, fontWeight: '600' },
});
