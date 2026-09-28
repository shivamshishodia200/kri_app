import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AppHeader } from '../../components/common/AppHeader';
import { Icon } from '../../components/common/Icon';
import { policyService } from '../../services/policyService';
import { LegalPolicyDocument } from '../../data/legalPolicies';

export const TermsAndConditionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [policy, setPolicy] = useState<LegalPolicyDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      setError(null);
      const doc = await policyService.getTermsAndConditions();
      setPolicy(doc);
    } catch (e) {
      setError('Unable to fetch the latest policy online. Showing cached policy.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <AppHeader
        title="Terms & Conditions"
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryDark} />
          <Text style={styles.loadingText}>Loading Terms & Conditions...</Text>
        </View>
      ) : error && !policy ? (
        <View style={styles.centerContainer}>
          <Icon name="alert-circle" size={36} color={colors.danger} />
          <Text style={styles.errorTitle}>Failed to Load Policy</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPolicy}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Metadata Card Header */}
          <View style={styles.metaCard}>
            <View style={styles.badgeRow}>
              <View style={styles.versionBadge}>
                <Icon name="shield-check" size={12} color={colors.primaryDark} />
                <Text style={styles.versionBadgeText}>Version {policy?.version || '2.4.0'}</Text>
              </View>
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>
                  Effective: {policy?.effectiveDate || 'September 1, 2026'}
                </Text>
              </View>
            </View>

            <Text style={styles.policyTitle}>Platform Terms of Service</Text>
            <Text style={styles.policySummary}>
              {policy?.summary ||
                'These terms govern your use of Kirayedar24 property marketplace, tenancy agreements, and direct owner listings.'}
            </Text>

            {/* Legal Notice Banner */}
            {policy?.legalReviewNotice && (
              <View style={styles.reviewBanner}>
                <Icon name="info" size={14} color="#D97706" />
                <Text style={styles.reviewBannerText}>{policy.legalReviewNotice}</Text>
              </View>
            )}
          </View>

          {/* Policy Sections */}
          {policy?.sections.map((section, sIndex) => (
            <View key={section.id || sIndex} style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionIconCircle}>
                  <Text style={styles.sectionNumber}>{sIndex + 1}</Text>
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>

              <View style={styles.sectionBody}>
                {section.content.map((paragraph, pIndex) => (
                  <View key={pIndex} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.paragraphText}>{paragraph}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Bottom Acknowledgment / Back Button */}
          <View style={styles.bottomBlock}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
            >
              <Text style={styles.closeButtonText}>Back to Registration</Text>
              <Icon name="arrow-right" size={16} color="#0F172A" />
            </TouchableOpacity>

            <Text style={styles.lastUpdatedFooter}>
              Last revised on {policy?.lastUpdated || 'September 24, 2026'} • Kirayedar24 Legal Compliance
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.darkText,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  errorSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  retryButtonText: {
    ...typography.subtitle,
    color: colors.darkText,
    fontWeight: '700',
  },
  metaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  versionBadgeText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 11,
  },
  dateBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateBadgeText: {
    ...typography.caption,
    color: '#64748B',
    fontWeight: '600',
    fontSize: 11,
  },
  policyTitle: {
    ...typography.h2,
    fontSize: 20,
    color: '#0F172A',
    fontWeight: '800',
    marginBottom: 6,
  },
  policySummary: {
    ...typography.bodyMedium,
    color: '#475569',
    lineHeight: 20,
    fontSize: 13,
  },
  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  reviewBannerText: {
    ...typography.caption,
    color: '#92400E',
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.sm,
  },
  sectionIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  sectionNumber: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 11,
  },
  sectionTitle: {
    ...typography.subtitle,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  sectionBody: {
    gap: 8,
    paddingLeft: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primaryDark,
    marginTop: 7,
  },
  paragraphText: {
    ...typography.bodyMedium,
    color: '#475569',
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  bottomBlock: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  closeButtonText: {
    ...typography.subtitle,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 14,
  },
  lastUpdatedFooter: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 14,
    textAlign: 'center',
  },
});
