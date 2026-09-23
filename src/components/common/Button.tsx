import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconRight,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radii.lg,
      opacity: disabled ? 0.55 : 1,
    };

    if (fullWidth) {
      base.width = '100%';
    }

    // Size
    switch (size) {
      case 'sm':
        base.paddingVertical = spacing.xs + 2;
        base.paddingHorizontal = spacing.md;
        break;
      case 'lg':
        base.paddingVertical = spacing.lg - 2;
        base.paddingHorizontal = spacing.xxl;
        break;
      case 'md':
      default:
        base.paddingVertical = spacing.md;
        base.paddingHorizontal = spacing.xl;
        break;
    }

    // Variant
    switch (variant) {
      case 'secondary':
        base.backgroundColor = colors.primaryMuted;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = colors.primary;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      case 'danger':
        base.backgroundColor = colors.danger;
        break;
      case 'primary':
      default:
        base.backgroundColor = colors.primary;
        Object.assign(base, shadows.sm);
        break;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    let baseText: TextStyle = {
      ...typography.button,
    };

    switch (size) {
      case 'sm':
        baseText.fontSize = 13;
        break;
      case 'lg':
        baseText.fontSize = 16;
        break;
      case 'md':
      default:
        baseText.fontSize = 15;
        break;
    }

    switch (variant) {
      case 'secondary':
        baseText.color = colors.primaryDark;
        baseText.fontWeight = '700';
        break;
      case 'outline':
        baseText.color = colors.primaryDark;
        baseText.fontWeight = '700';
        break;
      case 'ghost':
        baseText.color = colors.textPrimary;
        break;
      case 'danger':
        baseText.color = colors.textLight;
        break;
      case 'primary':
      default:
        baseText.color = colors.darkText;
        baseText.fontWeight = '700';
        break;
    }

    return baseText;
  };

  const spinnerColor = variant === 'danger' ? colors.textLight : colors.darkText;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <>
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconLeft: {
    marginRight: spacing.xs + 2,
  },
  iconRight: {
    marginLeft: spacing.xs + 2,
  },
});
