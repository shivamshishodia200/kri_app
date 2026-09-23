import React from 'react';
import { View, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { ListingType } from '../../types/property';

interface PriceDisplayProps {
  price: number;
  listingType?: ListingType;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const formatIndianCurrency = (num: number): string => {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} Lac`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
};

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  listingType = 'rent',
  size = 'md',
  style,
  textStyle,
}) => {
  const isRent = listingType === 'rent';

  const getSizeStyle = (): TextStyle => {
    switch (size) {
      case 'sm':
        return { fontSize: 14, fontWeight: '700' };
      case 'lg':
        return { fontSize: 20, fontWeight: '800' };
      case 'hero':
        return { fontSize: 24, fontWeight: '800' };
      case 'md':
      default:
        return { fontSize: 17, fontWeight: '700' };
    }
  };

  const getSuffixSize = (): TextStyle => {
    switch (size) {
      case 'sm':
        return { fontSize: 11, fontWeight: '500' };
      case 'lg':
      case 'hero':
        return { fontSize: 13, fontWeight: '500' };
      case 'md':
      default:
        return { fontSize: 12, fontWeight: '500' };
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.priceText, getSizeStyle(), textStyle]}>
        {formatIndianCurrency(price)}
      </Text>
      {isRent && (
        <Text style={[styles.suffixText, getSuffixSize()]}> / month</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    ...typography.h3,
    color: colors.darkText,
  },
  suffixText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: 2,
  },
});
