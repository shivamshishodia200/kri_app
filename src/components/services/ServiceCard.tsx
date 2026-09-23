import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import { ServiceItem } from '../../types/booking';
import { formatIndianCurrency } from '../common/PriceDisplay';
import { Icon } from '../common/Icon';

interface ServiceCardProps {
  service: ServiceItem;
  onBookPress: () => void;
  style?: ViewStyle;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onBookPress,
  style,
}) => {
  const getCategoryIcon = () => {
    switch (service.category) {
      case 'Packers & Movers':
        return 'truck';
      case 'Deep Cleaning':
        return 'sparkles';
      case 'Rent Agreement & Legal':
        return 'shield-check';
      case 'Home Painting':
        return 'edit';
      case 'Electrician & Plumber':
        return 'settings';
      default:
        return 'briefcase';
    }
  };

  return (
    <View style={[styles.card, style]}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <Icon name={getCategoryIcon() as any} size={24} color={colors.primaryDark} />
        </View>

        <View style={styles.headerInfo}>
          {service.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{service.badge}</Text>
            </View>
          )}
          <Text style={styles.title}>{service.title}</Text>
          <View style={styles.ratingRow}>
            <Icon name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingText}>
              {service.rating} ({service.reviewsCount} reviews)
            </Text>
            <Text style={styles.durationText}>• ⏱️ {service.duration}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {service.description}
      </Text>

      {/* Feature check list */}
      <View style={styles.featuresList}>
        {service.features.slice(0, 3).map((feat, i) => (
          <View key={i} style={styles.featureItem}>
            <Icon name="check" size={13} color={colors.success} strokeWidth={2.5} />
            <Text style={styles.featureText}>{feat}</Text>
          </View>
        ))}
      </View>

      {/* Bottom price + CTA */}
      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.startsAt}>Starting at</Text>
          <Text style={styles.price}>{formatIndianCurrency(service.priceStartingAt)}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onBookPress}
          style={styles.bookButton}
        >
          <Text style={styles.bookButtonText}>Book Slot</Text>
          <Icon name="arrow-right" size={14} color={colors.darkText} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md + 2,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  headerInfo: {
    flex: 1,
  },
  badge: {
    backgroundColor: colors.primaryMuted,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    marginBottom: 4,
  },
  badgeText: {
    ...typography.badge,
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  title: {
    ...typography.subtitle,
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  durationText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  featuresList: {
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    gap: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  startsAt: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  price: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.round,
    gap: 4,
    ...shadows.sm,
  },
  bookButtonText: {
    ...typography.button,
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
  },
});
