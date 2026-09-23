import React from 'react';
import { Image, StyleSheet, ViewStyle, ImageStyle, View } from 'react-native';

interface AppLogoProps {
  width?: number;
  height?: number;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  variant?: 'light' | 'dark'; // 'light' is for dark backgrounds (white text), 'dark' is for light backgrounds (slate text)
}

export const AppLogo: React.FC<AppLogoProps> = ({
  width = 160,
  height = 90,
  style,
  imageStyle,
  resizeMode = 'contain',
  variant = 'light',
}) => {
  const source =
    variant === 'dark'
      ? require('../../assets/kri_logo_dark.png')
      : require('../../assets/kri_logo.png');

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Image
        source={source}
        style={[styles.image, imageStyle]}
        resizeMode={resizeMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
