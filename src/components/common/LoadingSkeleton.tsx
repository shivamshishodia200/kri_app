import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonBox: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = radii.md,
  style,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

export const PropertyCardSkeleton: React.FC = () => {
  return (
    <View style={styles.cardContainer}>
      <SkeletonBox height={180} borderRadius={radii.lg} style={{ marginBottom: spacing.md }} />
      <SkeletonBox width="60%" height={22} style={{ marginBottom: spacing.xs }} />
      <SkeletonBox width="90%" height={16} style={{ marginBottom: spacing.md }} />
      <View style={styles.row}>
        <SkeletonBox width="30%" height={14} />
        <SkeletonBox width="30%" height={14} />
        <SkeletonBox width="30%" height={14} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#EAEFF5',
  },
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
});
