// src/constants/theme.js
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  // Brand palette
  primary: '#FDB022',
  accent: '#FDBF4D',
  primaryDark: '#D9910D',
  secondary: '#F0FFF4',
  danger: '#FF6347',
  error: '#EF4444',
  success: '#10B981',

  // Neutrals & Surfaces
  background: '#FAF8F5',       // warm off-white
  surface: '#FFFFFF',          // clean card & input background
  surfaceSubtle: '#F7FAFC',
  border: '#E2E8F0',           // subtle border
  borderFocus: '#FDB022',
  borderLight: '#EDF2F7',

  // Typography
  textDark: '#1A202C',
  text: '#2D3748',
  textSecondary: '#718096',
  textMuted: '#A0AEC0',
  white: '#FFFFFF',
  black: '#1A1A1A',

  // Gradients
  gradientStart: '#FDB022',
  gradientEnd: '#FDBF4D',
};

export const SIZES = {
  base: 8,
  font: 14,
  radius: 16,
  padding: 24,
  h1: 28,
  h2: 22,
  h3: 16,
  body4: 14,
  width,
  height,
};

export const FONTS = {
  h1: { fontFamily: 'System', fontSize: SIZES.h1, lineHeight: 36, fontWeight: 'bold' },
  h2: { fontFamily: 'System', fontSize: SIZES.h2, lineHeight: 30, fontWeight: 'bold' },
  h3: { fontFamily: 'System', fontSize: SIZES.h3, lineHeight: 22, fontWeight: '600' },
  body: { fontFamily: 'System', fontSize: SIZES.body4, lineHeight: 22, fontWeight: 'normal' },
  caption: { fontFamily: 'System', fontSize: 12, lineHeight: 18, fontWeight: '500' },
};

// Neumorphic Design Tokens (Scoped to Splash, Login, Signup)
export const NEU_COLORS = {
  background: '#EFEEE9',
  surface: '#EFEEE9',
  surfaceInset: '#E5E3DC',
  surfaceInsetFocused: '#ECEAE3',
  primary: '#FDB022',
  accent: '#FDBF4D',
  primaryDark: '#D97706',
  text: '#2D3748',
  textDark: '#1A202C',
  textSecondary: '#626B78',
  textMuted: '#94A3B8',
  lightHighlight: '#FFFFFF',
  shadowDark: '#C8C4B7',
  shadowDeep: '#1E293B',
  border: '#D8D5CB',
  borderLight: '#FFFFFF',
  borderInset: '#D3D0C6',
  borderFocus: '#FDB022',
  error: '#EF4444',
  success: '#10B981',
};

export const NEU_STYLES = {
  raisedCard: {
    backgroundColor: '#EFEEE9',
    borderRadius: 16,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: '#D8D5CB',
    borderRightColor: '#D8D5CB',
    borderWidth: 1.5,
    shadowColor: '#1E293B',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  insetField: {
    backgroundColor: '#E5E3DC',
    borderRadius: 14,
    borderTopColor: '#D3D0C6',
    borderLeftColor: '#D3D0C6',
    borderBottomColor: '#FFFFFF',
    borderRightColor: '#FFFFFF',
    borderWidth: 1.5,
  },
  primaryButton: {
    backgroundColor: '#FDB022',
    borderRadius: 14,
    borderTopColor: '#FDE68A',
    borderLeftColor: '#FDE68A',
    borderBottomColor: '#D97706',
    borderRightColor: '#D97706',
    borderWidth: 1.5,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
};

const appTheme = { COLORS, SIZES, FONTS, NEU_COLORS, NEU_STYLES };

export default appTheme;