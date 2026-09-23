import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { AppLogo } from '../../components/common/AppLogo';
import { Icon } from '../../components/common/Icon';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.75)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(20)).current;
  const badgesOpacity = useRef(new Animated.Value(0)).current;
  const badgesSlide = useRef(new Animated.Value(15)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const haloPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Entrance choreography
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(350),
        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(contentSlide, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(badgesOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(badgesSlide, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
      // Smooth progress line
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: false,
      }),
    ]).start();

    // 2. Ambient breathing halo pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(haloPulse, {
          toValue: 1.15,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(haloPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Navigation transition
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2600);

    return () => clearTimeout(timer);
  }, [navigation, logoOpacity, logoScale, contentOpacity, contentSlide, badgesOpacity, badgesSlide, progressAnim, haloPulse]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" translucent={false} />

      {/* Ambient background glow orbs */}
      <Animated.View
        style={[
          styles.ambientGlowPrimary,
          {
            transform: [{ scale: haloPulse }],
          },
        ]}
      />
      <View style={styles.ambientGlowSecondary} />

      {/* Central Hero Block */}
      <View style={styles.centerBlock}>
        {/* Animated Glow Halo behind Logo */}
        <Animated.View
          style={[
            styles.haloRing,
            {
              transform: [{ scale: haloPulse }],
            },
          ]}
        />

        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <AppLogo width={250} height={145} />
        </Animated.View>

        {/* Tagline & Subtitle */}
        <Animated.View
          style={[
            styles.textWrapper,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}
        >
          <Text style={styles.titleGradient}>KIRAYEDAR 24</Text>
          <Text style={styles.tagline}>The Smarter Way to Buy, Rent & Manage</Text>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDot} />
            <View style={styles.dividerLine} />
          </View>
        </Animated.View>

        {/* Highlight Feature Badges */}
        <Animated.View
          style={[
            styles.badgesRow,
            {
              opacity: badgesOpacity,
              transform: [{ translateY: badgesSlide }],
            },
          ]}
        >
          <View style={styles.featureBadge}>
            <Icon name="shield-check" size={14} color={colors.primary} />
            <Text style={styles.badgeLabel}>100% Verified</Text>
          </View>

          <View style={styles.featureBadge}>
            <Icon name="building" size={14} color={colors.primary} />
            <Text style={styles.badgeLabel}>Direct Owner</Text>
          </View>

          <View style={styles.featureBadge}>
            <Icon name="sparkles" size={14} color={colors.primary} />
            <Text style={styles.badgeLabel}>0% Brokerage</Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Progress & Branding Section */}
      <View style={styles.bottomSection}>
        {/* Sleek Gold Loading Indicator */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>

        <Text style={styles.loadingText}>Initializing Realty Experience...</Text>

        <View style={styles.footerNote}>
          <Icon name="check-circle" size={12} color="#64748B" />
          <Text style={styles.footerText}>Verified Real Estate Ecosystem • v1.0</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  ambientGlowPrimary: {
    position: 'absolute',
    top: '25%',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(253, 176, 34, 0.08)',
  },
  ambientGlowSecondary: {
    position: 'absolute',
    bottom: 80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(232, 158, 15, 0.05)',
  },
  haloRing: {
    position: 'absolute',
    top: -15,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: 'rgba(253, 176, 34, 0.18)',
    backgroundColor: 'rgba(253, 176, 34, 0.03)',
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  textWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  titleGradient: {
    ...typography.h3,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 3,
    fontSize: 20,
  },
  tagline: {
    ...typography.bodyMedium,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
    width: 140,
    justifyContent: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(253, 176, 34, 0.3)',
  },
  dividerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginHorizontal: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.25)',
    gap: 6,
  },
  badgeLabel: {
    ...typography.badge,
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 8,
  },
  progressTrack: {
    width: width * 0.55,
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  loadingText: {
    ...typography.caption,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 16,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    ...typography.caption,
    color: '#475569',
    fontSize: 11,
    fontWeight: '500',
  },
});
