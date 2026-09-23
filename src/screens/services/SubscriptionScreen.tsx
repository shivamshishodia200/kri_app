import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useBooking } from '../../context/BookingContext';
import { SUBSCRIPTION_PLANS } from '../../mock/servicesData';
import { SubscriptionPlan } from '../../types/booking';
import { AppHeader } from '../../components/common/AppHeader';
import { Button } from '../../components/common/Button';
import { formatIndianCurrency } from '../../components/common/PriceDisplay';
import { Icon } from '../../components/common/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'Subscription'>;

export const SubscriptionScreen: React.FC<Props> = ({ navigation }) => {
  const { activeSubscription, changeSubscription } = useBooking();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(activeSubscription);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    Alert.alert(
      'Upgrade Subscription',
      `Upgrade your owner plan to "${plan.name}" at ${formatIndianCurrency(plan.price)}/${plan.billingPeriod}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Upgrade',
          onPress: () => {
            changeSubscription(plan);
            Alert.alert('Plan Activated', `You are now on ${plan.name} plan!`);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Landlord & Owner Plans" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Boost Your Rental Revenue</Text>
          <Text style={styles.heroSubtitle}>
            Get up to 5x more verified inquiries, top search spotlight & zero brokerage tenants.
          </Text>
        </View>

        {/* Plan Cards */}
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isActive = activeSubscription.id === plan.id;
          const isSelected = selectedPlan.id === plan.id;

          return (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                plan.isPopular && styles.planCardPopular,
                isActive && styles.planCardActive,
              ]}
            >
              {plan.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>⭐ MOST POPULAR</Text>
                </View>
              )}

              {isActive && (
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>CURRENT ACTIVE PLAN</Text>
                </View>
              )}

              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planTagline}>{plan.tagline}</Text>

              <View style={styles.priceRow}>
                <Text style={styles.priceVal}>{formatIndianCurrency(plan.price)}</Text>
                <Text style={styles.billingPeriod}> / {plan.billingPeriod}</Text>
              </View>

              {/* Feature Checklist */}
              <View style={styles.featuresList}>
                {plan.features.map((feat, i) => (
                  <View key={i} style={styles.featureItem}>
                    <Icon name="check" size={14} color={colors.success} strokeWidth={3} />
                    <Text style={styles.featureText}>{feat}</Text>
                  </View>
                ))}
              </View>

              <Button
                title={isActive ? 'Current Plan' : `Choose ${plan.name}`}
                variant={isActive ? 'outline' : plan.isPopular ? 'primary' : 'secondary'}
                size="md"
                disabled={isActive}
                onPress={() => handleSelectPlan(plan)}
                fullWidth
              />
            </View>
          );
        })}
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
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
    paddingHorizontal: spacing.sm,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    position: 'relative',
  },
  planCardPopular: {
    borderColor: colors.primaryDark,
    backgroundColor: '#FFFAEB',
  },
  planCardActive: {
    borderColor: colors.success,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radii.round,
  },
  popularBadgeText: {
    ...typography.badge,
    fontSize: 10,
    color: colors.textLight,
  },
  activeTag: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radii.round,
  },
  activeTagText: {
    ...typography.badge,
    fontSize: 10,
    color: colors.textLight,
  },
  planName: {
    ...typography.h3,
    fontSize: 18,
    color: colors.darkText,
    marginTop: spacing.xs,
    marginBottom: 2,
  },
  planTagline: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  priceVal: {
    ...typography.h1,
    fontSize: 28,
    color: colors.darkText,
    fontWeight: '800',
  },
  billingPeriod: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  featuresList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
});
