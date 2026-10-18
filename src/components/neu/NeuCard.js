import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NEU_COLORS } from '../../constants/theme';

export default function NeuCard({
  children,
  style,
  variant = 'raised', // 'raised' | 'inset' | 'accent' | 'flat'
  borderRadius = 16,
  padding = 16,
  ...props
}) {
  const getVariantStyle = () => {
    switch (variant) {
      case 'inset':
        return styles.inset;
      case 'accent':
        return styles.accent;
      case 'flat':
        return styles.flat;
      case 'raised':
      default:
        return styles.raised;
    }
  };

  return (
    <View
      style={[
        styles.base,
        { borderRadius, padding },
        getVariantStyle(),
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: NEU_COLORS.background,
  },
  raised: {
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
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  inset: {
    backgroundColor: '#E5E3DC',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopColor: '#D3D0C6',
    borderLeftColor: '#D3D0C6',
    borderBottomColor: '#FFFFFF',
    borderRightColor: '#FFFFFF',
  },
  accent: {
    backgroundColor: '#EFEEE9',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: '#FDE68A',
    borderLeftColor: '#FDE68A',
    borderBottomColor: '#D97706',
    borderRightColor: '#D97706',
    shadowColor: '#FDB022',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  flat: {
    backgroundColor: '#EAE8E2',
    borderWidth: 1,
    borderColor: '#D8D5CB',
  },
});
