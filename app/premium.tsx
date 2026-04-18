import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { purchaseProduct, restorePurchases, PRODUCT_IDS } from '../src/lib/iap';
import { radius, useThemeColors } from '../src/lib/theme';
import { useCardStore } from '../src/store/useCardStore';
import { usePremiumStore } from '../src/store/usePremiumStore';

const BENEFITS_KO = [
  { icon: '✏️', text: '무제한 카드 만들기' },
  { icon: '🎙️', text: '무제한 음성 녹음' },
  { icon: '🧩', text: '무제한 퀴즈' },
  { icon: '🚫', text: '광고 없음' },
  { icon: '💖', text: '앱 개발 응원하기' },
];

const BENEFITS_EN = [
  { icon: '✏️', text: 'Unlimited card creation' },
  { icon: '🎙️', text: 'Unlimited voice recordings' },
  { icon: '🧩', text: 'Unlimited quizzes' },
  { icon: '🚫', text: 'No ads' },
  { icon: '💖', text: 'Support development' },
];

export default function PremiumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const lang = useCardStore((s) => s.lang);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const [purchasing, setPurchasing] = useState(false);

  const benefits = lang === 'ko' ? BENEFITS_KO : BENEFITS_EN;

  const handlePurchase = async (productId: string) => {
    if (purchasing) return;
    setPurchasing(true);
    try {
      const ok = await purchaseProduct(productId);
      if (ok) {
        if (Platform.OS === 'web') {
          window.alert(lang === 'ko' ? '프리미엄이 활성화되었습니다!' : 'Premium activated!');
        } else {
          Alert.alert(lang === 'ko' ? '감사합니다!' : 'Thank you!', lang === 'ko' ? '프리미엄이 활성화되었습니다.' : 'Premium has been activated.');
        }
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (purchasing) return;
    setPurchasing(true);
    try {
      const restored = await restorePurchases();
      const msg = restored
        ? (lang === 'ko' ? '구매가 복원되었습니다!' : 'Purchase restored!')
        : (lang === 'ko' ? '복원할 구매가 없습니다.' : 'No purchases to restore.');
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert(msg);
      }
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: colors.surface },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.backText, { color: colors.text }]}>
            ← {lang === 'ko' ? '돌아가기' : 'Back'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.starEmoji}>⭐</Text>
      <Text style={[styles.title, { color: colors.text }]}>
        {lang === 'ko' ? '낱말 카드 프리미엄' : 'Word Card Premium'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {lang === 'ko'
          ? '모든 기능을 제한 없이 사용하세요'
          : 'Unlock all features without limits'}
      </Text>

      <View style={[styles.benefitCard, { backgroundColor: colors.surface }]}>
        {benefits.map((b, i) => (
          <View key={i} style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>{b.icon}</Text>
            <Text style={[styles.benefitText, { color: colors.text }]}>{b.text}</Text>
          </View>
        ))}
      </View>

      {isPremium ? (
        <View style={[styles.activeCard, { backgroundColor: '#d4edda' }]}>
          <Text style={styles.activeEmoji}>✅</Text>
          <Text style={styles.activeText}>
            {lang === 'ko' ? '프리미엄 활성화됨' : 'Premium Active'}
          </Text>
        </View>
      ) : (
        <View style={[styles.purchaseArea, purchasing && { opacity: 0.5 }]}>
          {/* Yearly subscription */}
          <Pressable
            onPress={() => handlePurchase(PRODUCT_IDS.YEARLY)}
            disabled={purchasing}
            style={({ pressed }) => [
              styles.purchaseBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.purchaseBtnTitle}>
              {lang === 'ko' ? '연간 구독' : 'Yearly'}
            </Text>
            <Text style={styles.purchaseBtnPrice}>
              {lang === 'ko' ? '₩9,900 / 년' : '$6.99 / year'}
            </Text>
            <View style={styles.bestBadge}>
              <Text style={styles.bestBadgeText}>BEST</Text>
            </View>
          </Pressable>

          {/* Monthly subscription */}
          <Pressable
            onPress={() => handlePurchase(PRODUCT_IDS.MONTHLY)}
            disabled={purchasing}
            style={({ pressed }) => [
              styles.purchaseBtn,
              { backgroundColor: colors.surface },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.purchaseBtnTitle, { color: colors.text }]}>
              {lang === 'ko' ? '월간 구독' : 'Monthly'}
            </Text>
            <Text style={[styles.purchaseBtnPrice, { color: colors.textMuted }]}>
              {lang === 'ko' ? '₩1,900 / 월' : '$1.49 / month'}
            </Text>
          </Pressable>

          {/* Permanent purchase */}
          <Pressable
            onPress={() => handlePurchase(PRODUCT_IDS.LIFETIME)}
            disabled={purchasing}
            style={({ pressed }) => [
              styles.purchaseBtn,
              { backgroundColor: colors.surface },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.purchaseBtnTitle, { color: colors.text }]}>
              {lang === 'ko' ? '영구 구매' : 'Lifetime'}
            </Text>
            <Text style={[styles.purchaseBtnPrice, { color: colors.textMuted }]}>
              {lang === 'ko' ? '₩19,900' : '$14.99'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Restore */}
      <Pressable
        onPress={handleRestore}
        disabled={purchasing}
        style={({ pressed }) => [
          styles.restoreBtn,
          pressed && { opacity: 0.6 },
        ]}
      >
        <Text style={[styles.restoreText, { color: colors.primary }]}>
          {lang === 'ko' ? '구매 복원' : 'Restore Purchase'}
        </Text>
      </Pressable>

      <Text style={[styles.terms, { color: colors.textMuted }]}>
        {lang === 'ko'
          ? '구독은 기간 종료 전 취소하지 않으면 자동 갱신됩니다.\n구매 후 설정에서 관리할 수 있습니다.'
          : 'Subscriptions auto-renew unless cancelled before the end of the period.\nManage subscriptions in device settings.'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, gap: 8 },
  header: { marginBottom: 16 },
  backBtn: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md },
  backText: { fontSize: 18, fontWeight: '700' },
  starEmoji: { fontSize: 64, textAlign: 'center' },
  title: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  subtitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 24 },
  benefitCard: { borderRadius: 20, padding: 20, gap: 16 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  benefitIcon: { fontSize: 28 },
  benefitText: { fontSize: 18, fontWeight: '700', flex: 1 },
  activeCard: { borderRadius: 20, padding: 24, alignItems: 'center', gap: 8, marginTop: 24 },
  activeEmoji: { fontSize: 40 },
  activeText: { fontSize: 20, fontWeight: '800', color: '#155724' },
  purchaseArea: { gap: 12, marginTop: 24 },
  purchaseBtn: { borderRadius: 20, padding: 20, alignItems: 'center', position: 'relative' as const },
  purchaseBtnTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  purchaseBtnPrice: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  bestBadge: { position: 'absolute' as const, top: -8, right: 16, backgroundColor: '#FF6B6B', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  bestBadgeText: { fontSize: 12, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  restoreBtn: { paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  restoreText: { fontSize: 16, fontWeight: '700' },
  terms: { fontSize: 12, fontWeight: '500', textAlign: 'center', lineHeight: 18, marginTop: 8, paddingHorizontal: 16 },
});
