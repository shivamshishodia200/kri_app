import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  View,
} from 'react-native';
import { NEU_COLORS } from '../../constants/theme';

export default function NeuButton({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon = null,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...props
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryContainer;
      case 'ghost':
        return styles.ghostContainer;
      case 'danger':
        return styles.dangerContainer;
      case 'primary':
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'ghost':
        return styles.ghostText;
      case 'danger':
        return styles.dangerText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'lg':
        return styles.sizeLg;
      case 'md':
      default:
        return styles.sizeMd;
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.base,
          getSizeStyle(),
          getContainerStyle(),
          disabled && styles.disabledContainer,
        ]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? '#FFFFFF' : NEU_COLORS.primary}
          />
        ) : (
          <View style={styles.contentRow}>
            {icon && iconPosition === 'left' && (
              <View style={styles.iconLeft}>{icon}</View>
            )}
            {title && (
              <Text
                style={[
                  styles.baseText,
                  getTextStyle(),
                  disabled && styles.disabledText,
                  textStyle,
                ]}
              >
                {title}
              </Text>
            )}
            {icon && iconPosition === 'right' && (
              <View style={styles.iconRight}>{icon}</View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 38,
    borderRadius: 10,
  },
  sizeMd: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 50,
    borderRadius: 14,
  },
  sizeLg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
    borderRadius: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  primaryContainer: {
    backgroundColor: '#FDB022',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopColor: '#FDE68A',
    borderLeftColor: '#FDE68A',
    borderBottomColor: '#D97706',
    borderRightColor: '#D97706',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  secondaryContainer: {
    backgroundColor: '#EFEEE9',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: '#D8D5CB',
    borderRightColor: '#D8D5CB',
    shadowColor: '#1E293B',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D8D5CB',
  },
  dangerContainer: {
    backgroundColor: '#EF4444',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopColor: '#FCA5A5',
    borderLeftColor: '#FCA5A5',
    borderBottomColor: '#B91C1C',
    borderRightColor: '#B91C1C',
    shadowColor: '#B91C1C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledContainer: {
    opacity: 0.55,
  },
  baseText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#2D3748',
  },
  ghostText: {
    color: '#626B78',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#94A3B8',
  },
});
