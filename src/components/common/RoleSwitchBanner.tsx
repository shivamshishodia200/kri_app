import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import { Icon } from './Icon';

interface RoleSwitchBannerProps {
  style?: ViewStyle;
}

export const RoleSwitchBanner: React.FC<RoleSwitchBannerProps> = ({ style }) => {
  const { role, toggleRole } = useAuth();
  const isOwner = role === 'owner';

  return (
    <View style={[styles.container, isOwner ? styles.ownerContainer : styles.buyerContainer, style]}>
      <View style={styles.leftContent}>
        <View style={[styles.iconCircle, isOwner ? styles.ownerIconCircle : styles.buyerIconCircle]}>
          <Icon
            name={isOwner ? 'building' : 'home'}
            size={18}
            color={isOwner ? '#B54708' : '#027A48'}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isOwner ? 'Owner & Landlord Mode' : 'Buyer & Tenant Mode'}
          </Text>
          <Text style={styles.subtitle}>
            {isOwner
              ? 'Managing listings, tenant leads & rent collection'
              : 'Browsing verified rentals, buying & booking services'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.75}
        onPress={toggleRole}
        style={[styles.switchButton, isOwner ? styles.ownerButton : styles.buyerButton]}
      >
        <Icon name="switch" size={14} color={colors.darkText} />
        <Text style={styles.switchButtonText}>
          {isOwner ? 'Switch to Buyer' : 'Switch to Owner'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radii.xl,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderWidth: 1,
  },
  buyerContainer: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  ownerContainer: {
    backgroundColor: '#FFFAEB',
    borderColor: '#FEDF89',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  buyerIconCircle: {
    backgroundColor: '#DCFCE7',
  },
  ownerIconCircle: {
    backgroundColor: '#FEF0C7',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    backgroundColor: colors.primary,
  },
  buyerButton: {
    backgroundColor: colors.primary,
  },
  ownerButton: {
    backgroundColor: colors.primary,
  },
  switchButtonText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.darkText,
  },
});
