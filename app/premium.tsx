import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { purchaseProduct, restorePurchases, PRODUCT_IDS } from '../src/lib/iap';
import { radius, useThemeColors } from '../src/lib/theme';
import { useCardStore } from '../src/store/useCardStore';
import { usePremiumStore } from '../src/store/usePremiumStore';
import { ui } from '../src/data/ui';

export default function PremiumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const lang = useCardStore((s) => s.lang);
  const isPremium = usePremiumStore((s) => s.isPremium);
  const aiCredits = usePremiumStore((s) => s.aiCredits);
  const [purchasing, setPurchasing] = useState(false);

  const benefits = [
    { icon: '✏️', text: ui('unlimitedCards', lang) },
    { icon: '🎙️', text: ui('unlimitedRecordings', lang) },
    { icon: '🧩', text: ui('unlimitedQuiz', lang) },
    { icon: '🚫', text: ui('noAds', lang) },
    { icon: '🤖', text: `100 ${ui('aiCredits', lang)}` },
    { icon: '💖', text: ui('supportDev', lang) },
  ];

  const notify = (msg: string) => {
    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      Alert.alert(msg);
    }
  };

  const handlePurchase = async (productId: string) => {
    if (purchasing) return;
    setPurchasing(true);
    try {
      const ok = await purchaseProduct(productId);
      if (ok) {
        const isCredit = [PRODUCT_IDS.CREDITS_50, PRODUCT_IDS.CREDITS_150, PRODUCT_IDS.CREDITS_500].includes(productId as any);
        notify(isCredit ? ui('aiCredits', lang) + ' +' : ui('premiumActivated', lang));
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (purchasing) return;
    setPurchasing(true);
    try {
      const result = await restorePurchases();
      const msg = result === 'restored'
        ? ui('purchaseRestored', lang)
        : result === 'error'
        ? ui('networkError', lang)
        : ui('noPurchase', lang);
      notify(msg);
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
            {`← ${ui('back', lang)}`}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.starEmoji}>{'⭐'}</Text>
      <Text style={[styles.title, { color: colors.text }]}>
        {ui('wordCardPremium', lang)}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {ui('unlockAll', lang)}
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
          <Text style={styles.activeEmoji}>{'✅'}</Text>
          <Text style={styles.activeText}>
            {ui('premiumActive', lang)}
          </Text>
        </View>
      ) : (
        <View style={[styles.purchaseArea, purchasing && { opacity: 0.5 }]}>
          <Pressable
            onPress={() => handlePurchase(PRODUCT_IDS.LIFETIME)}
            disabled={purchasing}
            style={({ pressed }) => [
              styles.purchaseBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.purchaseBtnTitle}>
              {ui('lifetime', lang)}
            </Text>
            <Text style={styles.purchaseBtnPrice}>$14.99</Text>
            <View style={styles.bestBadge}>
              <Text style={styles.bestBadgeText}>BEST</Text>
            </View>
          </Pressable>
        </View>
      )}

      {/* AI Credit Packs */}
      <Text style={[styles.creditSectionTitle, { color: colors.text }]}>
        {`🤖 ${ui('aiCredits', lang)}`}
      </Text>
      <Text style={[styles.creditBalance, { color: colors.textMuted }]}>
        {ui('aiCredits', lang)}: {aiCredits}
      </Text>

      <View style={[styles.creditGrid, purchasing && { opacity: 0.5 }]}>
        <Pressable
          onPress={() => handlePurchase(PRODUCT_IDS.CREDITS_50)}
          disabled={purchasing}
          style={({ pressed }) => [
            styles.creditBtn,
            { backgroundColor: colors.surface },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.creditAmount, { color: colors.text }]}>50</Text>
          <Text style={[styles.creditLabel, { color: colors.textMuted }]}>{ui('aiCredits', lang)}</Text>
          <Text style={[styles.creditPrice, { color: colors.primary }]}>$1.99</Text>
        </Pressable>

        <Pressable
          onPress={() => handlePurchase(PRODUCT_IDS.CREDITS_150)}
          disabled={purchasing}
          style={({ pressed }) => [
            styles.creditBtn,
            { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary },
            pressed && { opacity: 0.7 },
          ]}
        >
          <View style={styles.saveBadge}>
            <Text style={styles.saveBadgeText}>SAVE 11%</Text>
          </View>
          <Text style={[styles.creditAmount, { color: colors.text }]}>150</Text>
          <Text style={[styles.creditLabel, { color: colors.textMuted }]}>{ui('aiCredits', lang)}</Text>
          <Text style={[styles.creditPrice, { color: colors.primary }]}>$3.99</Text>
        </Pressable>

        <Pressable
          onPress={() => handlePurchase(PRODUCT_IDS.CREDITS_500)}
          disabled={purchasing}
          style={({ pressed }) => [
            styles.creditBtn,
            { backgroundColor: colors.surface },
            pressed && { opacity: 0.7 },
          ]}
        >
          <View style={styles.saveBadge}>
            <Text style={styles.saveBadgeText}>SAVE 50%</Text>
          </View>
          <Text style={[styles.creditAmount, { color: colors.text }]}>500</Text>
          <Text style={[styles.creditLabel, { color: colors.textMuted }]}>{ui('aiCredits', lang)}</Text>
          <Text style={[styles.creditPrice, { color: colors.primary }]}>$9.99</Text>
        </Pressable>
      </View>

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
          {ui('purchaseRestore', lang)}
        </Text>
      </Pressable>
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
  purchaseBtnPrice: { fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 4 },
  bestBadge: { position: 'absolute' as const, top: -8, right: 16, backgroundColor: '#FF6B6B', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  bestBadgeText: { fontSize: 12, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  creditSectionTitle: { fontSize: 22, fontWeight: '800', marginTop: 32, marginBottom: 4 },
  creditBalance: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  creditGrid: { flexDirection: 'row', gap: 10 },
  creditBtn: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', gap: 4, position: 'relative' as const },
  creditAmount: { fontSize: 28, fontWeight: '900' },
  creditLabel: { fontSize: 11, fontWeight: '600' },
  creditPrice: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  saveBadge: { position: 'absolute' as const, top: -8, right: -4, backgroundColor: '#FF6B6B', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  saveBadgeText: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  restoreBtn: { paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  restoreText: { fontSize: 16, fontWeight: '700' },
});
