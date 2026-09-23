import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ListingStatus } from '../../types/property';
import { Icon } from './Icon';

export type BadgeType =
  | ListingStatus
  | 'verified'
  | 'featured'
  | 'rent'
  | 'buy'
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'in_progress';

interface StatusBadgeProps {
  type: BadgeType;
  label?: string;
  style?: ViewStyle;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  label,
  style,
  showIcon = true,
}) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'verified':
        return {
          bg: colors.successTint,
          text: colors.successDark,
          borderColor: colors.success,
          title: label || 'Verified',
          icon: <Icon name="shield-check" size={12} color={colors.successDark} strokeWidth={2.5} />,
        };
      case 'featured':
        return {
          bg: colors.warningTint,
          text: colors.primaryDark,
          borderColor: colors.primary,
          title: label || 'Featured',
          icon: <Icon name="sparkles" size={12} color={colors.primaryDark} strokeWidth={2.5} />,
        };
      case 'published':
        return {
          bg: colors.successTint,
          text: colors.successDark,
          borderColor: colors.success,
          title: label || 'Active Listing',
          icon: <Icon name="check-circle" size={12} color={colors.successDark} strokeWidth={2.5} />,
        };
      case 'under_review':
        return {
          bg: colors.warningTint,
          text: colors.warning,
          borderColor: colors.warning,
          title: label || 'Under Review',
          icon: <Icon name="clock" size={12} color={colors.warning} strokeWidth={2.5} />,
        };
      case 'draft':
        return {
          bg: colors.surfaceSubtle,
          text: colors.textSecondary,
          borderColor: colors.borderDark,
          title: label || 'Draft',
          icon: <Icon name="edit" size={12} color={colors.textSecondary} strokeWidth={2.5} />,
        };
      case 'rented_sold':
        return {
          bg: colors.dangerTint,
          text: colors.dangerDark,
          borderColor: colors.danger,
          title: label || 'Rented / Sold',
          icon: null,
        };
      case 'rent':
        return {
          bg: colors.primaryMuted,
          text: colors.primaryDark,
          borderColor: colors.primary,
          title: label || 'For Rent',
          icon: null,
        };
      case 'buy':
        return {
          bg: colors.infoTint,
          text: colors.info,
          borderColor: colors.info,
          title: label || 'For Sale',
          icon: null,
        };
      case 'scheduled':
      case 'in_progress':
        return {
          bg: colors.infoTint,
          text: colors.info,
          borderColor: colors.info,
          title: label || (type === 'scheduled' ? 'Scheduled' : 'In Progress'),
          icon: <Icon name="clock" size={12} color={colors.info} strokeWidth={2.5} />,
        };
      case 'completed':
        return {
          bg: colors.successTint,
          text: colors.successDark,
          borderColor: colors.success,
          title: label || 'Completed',
          icon: <Icon name="check" size={12} color={colors.successDark} strokeWidth={2.5} />,
        };
      case 'cancelled':
        return {
          bg: colors.dangerTint,
          text: colors.dangerDark,
          borderColor: colors.danger,
          title: label || 'Cancelled',
          icon: <Icon name="close" size={12} color={colors.dangerDark} strokeWidth={2.5} />,
        };
      default:
        return {
          bg: colors.surfaceSubtle,
          text: colors.textSecondary,
          borderColor: colors.border,
          title: label || type,
          icon: null,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg, borderColor: config.borderColor },
        style,
      ]}
    >
      {showIcon && config.icon && <View style={styles.iconContainer}>{config.icon}</View>}
      <Text style={[styles.text, { color: config.text }]}>{config.title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radii.round,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    ...typography.badge,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
