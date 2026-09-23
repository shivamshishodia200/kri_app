import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/common/AppHeader';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'Referral'>;

export const ReferralScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const code = user?.referralCode || 'KIRAYE24RAJ';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Use my invite code "${code}" on Kirayedar24 to get ₹500 off on home shifting, rent agreements & verified listings! Download: https://kirayedar24.app`,
      });
    } catch (e) {
      // Ignored
    }
  };

  const handleCopy = () => {
    Alert.alert('Code Copied! 📋', `Referral code "${code}" copied to clipboard.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Refer & Earn" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Gift Icon */}
        <View style={styles.giftCircle}>
          <Icon name="sparkles" size={48} color={colors.darkText} strokeWidth={2} />
        </View>

        <Text style={styles.heroTitle}>Earn ₹500 for Every Friend</Text>
        <Text style={styles.heroSubtitle}>
          Invite property owners or tenants to Kirayedar24. When they book a service or list a property, both of you earn ₹500 in wallet cash!
        </Text>

        {/* Code Box */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>YOUR UNIQUE INVITE CODE</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{code}</Text>
            <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
              <Text style={styles.copyBtnText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How it works steps */}
        <Text style={styles.stepsTitle}>How It Works</Text>
        <View style={styles.stepsList}>
          {[
            {
              num: '1',
              title: 'Share your invite code',
              desc: 'Send your code via WhatsApp, SMS or Social Media to friends & landlords.',
            },
            {
              num: '2',
              title: 'Friend signs up or lists',
              desc: 'They get ₹500 discount on their first service booking or verification.',
            },
            {
              num: '3',
              title: 'You receive ₹500 reward',
              desc: 'Reward cash is credited directly to your bank account or Kirayedar24 wallet.',
            },
          ].map((s) => (
            <View key={s.num} style={styles.stepItem}>
              <View style={styles.stepNumCircle}>
                <Text style={styles.stepNumText}>{s.num}</Text>
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepItemTitle}>{s.title}</Text>
                <Text style={styles.stepItemDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <Button
          title="Share Invite Code Now"
          variant="primary"
          size="lg"
          onPress={handleShare}
          icon={<Icon name="share" size={18} color={colors.darkText} />}
          fullWidth
          style={styles.shareBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    alignItems: 'center',
    paddingBottom: spacing.xxxl,
  },
  giftCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  heroTitle: {
    ...typography.h2,
    fontSize: 22,
    color: colors.darkText,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  codeCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primaryMuted,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  codeLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primarySubtle,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    width: '100%',
  },
  codeText: {
    ...typography.h3,
    fontSize: 20,
    color: colors.darkText,
    fontWeight: '800',
    letterSpacing: 2,
  },
  copyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  copyBtnText: {
    ...typography.button,
    fontSize: 12,
    fontWeight: '700',
    color: colors.darkText,
  },
  stepsTitle: {
    ...typography.subtitle,
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  stepsList: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  stepNumCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.darkText,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepItemTitle: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: 2,
  },
  stepItemDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  shareBtn: {
    width: '100%',
  },
});
