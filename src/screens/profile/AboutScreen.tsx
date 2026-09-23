import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppHeader } from '../../components/common/AppHeader';
import { Icon } from '../../components/common/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

export const AboutScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="About Kirayedar24" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Icon name="home" size={40} color={colors.primaryDark} strokeWidth={2.5} />
          </View>
          <Text style={styles.appName}>Kirayedar24</Text>
          <Text style={styles.versionText}>Version 1.0.0 (Production Release)</Text>
        </View>

        <Text style={styles.sectionHeading}>Our Mission</Text>
        <Text style={styles.paragraph}>
          Kirayedar24 is India’s next-generation property ecosystem built with a single goal: creating transparency, convenience, and trust in real estate. Whether renting a home, buying a commercial space, or finding professional shifting services, we eliminate middleman friction.
        </Text>

        <Text style={styles.sectionHeading}>Our Pillars of Trust</Text>
        <View style={styles.pillarsGrid}>
          <View style={styles.pillarItem}>
            <Icon name="shield-check" size={24} color={colors.primaryDark} />
            <Text style={styles.pillarTitle}>100% Physical Audit</Text>
            <Text style={styles.pillarDesc}>Every listing is vetted with geolocation and document audit.</Text>
          </View>

          <View style={styles.pillarItem}>
            <Icon name="award" size={24} color={colors.primaryDark} />
            <Text style={styles.pillarTitle}>Zero Brokerage</Text>
            <Text style={styles.pillarDesc}>Direct owner connections save tenants thousands in commissions.</Text>
          </View>

          <View style={styles.pillarItem}>
            <Icon name="truck" size={24} color={colors.primaryDark} />
            <Text style={styles.pillarTitle}>End-to-End Services</Text>
            <Text style={styles.pillarDesc}>From legal rent agreements to Packers & Movers under one roof.</Text>
          </View>
        </View>

        <Text style={styles.copyrightText}>
          © 2026 Kirayedar24 Technologies Pvt. Ltd. All rights reserved.
        </Text>
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
    paddingBottom: spacing.xxxl,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1.5,
    borderColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    ...typography.h2,
    fontSize: 24,
    color: colors.darkText,
    marginBottom: 2,
  },
  versionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionHeading: {
    ...typography.subtitle,
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkText,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  paragraph: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  pillarsGrid: {
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  pillarItem: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillarTitle: {
    ...typography.subtitle,
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkText,
    marginTop: spacing.xs,
    marginBottom: 2,
  },
  pillarDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  copyrightText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
