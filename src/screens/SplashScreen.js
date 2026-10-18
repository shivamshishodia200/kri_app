import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  StatusBar,
  useWindowDimensions,
  AccessibilityInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import AuthFlowManager from "../utils/AuthFlowManager";
import { useSubscription } from "../context/SubscriptionContext";
import { NEU_COLORS } from "../constants/theme";

const SplashScreen = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const { loadActiveSubscription } = useSubscription();

  // Neumorphic subtle entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  const isSmallDevice = height < 700;

  useEffect(() => {
    let animMounted = true;

    // Check accessibility reduced-motion preference
    AccessibilityInfo.isReduceMotionEnabled()
      .then((isReduced) => {
        if (!animMounted) return;
        if (isReduced) {
          fadeAnim.setValue(1);
          scaleAnim.setValue(1);
          progressAnim.setValue(1);
        } else {
          // Lightweight 250ms coordinated entrance animation
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 8,
              tension: 50,
              useNativeDriver: true,
            }),
            Animated.timing(progressAnim, {
              toValue: 1,
              duration: 2400,
              useNativeDriver: false, // width interpolation
            }),
          ]).start();

          // Subtle pulse on status caption
          Animated.loop(
            Animated.sequence([
              Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(pulseAnim, {
                toValue: 0.5,
                duration: 800,
                useNativeDriver: true,
              }),
            ])
          ).start();
        }
      })
      .catch(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.timing(progressAnim, { toValue: 1, duration: 2400, useNativeDriver: false }),
        ]).start();
      });

    // Exact auth verification and routing timer (2800ms)
    const timer = setTimeout(async () => {
      try {
        const isLoggedIn = await AuthFlowManager.isUserAuthenticated();

        if (isLoggedIn) {
          console.log("✅ User is logged in - Going to Home");
          await loadActiveSubscription();
          navigation.replace("Home");
        } else {
          console.log("❌ User not logged in - Going to Login");
          navigation.replace("LoginScreen");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        navigation.replace("LoginScreen");
      }
    }, 2800);

    return () => {
      animMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["4%", "100%"],
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <StatusBar backgroundColor="#EFEEE9" barStyle="dark-content" />

      {/* Main Centered Composition */}
      <View style={styles.centerContainer}>
        <Animated.View
          style={[
            styles.contentWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Soft Raised Neumorphic Circular Motif */}
          <View style={[styles.neuCircleContainer, isSmallDevice && { width: 170, height: 170, borderRadius: 85 }]}>
            {/* Embossed Architectural Ring Accent */}
            <View style={styles.embossedInnerRing}>
              {/* Authentic Kirayedar24 Logo */}
              <Image
                source={require("../assets/Kirayedar_logo.png")}
                style={[styles.logoImage, isSmallDevice && { width: 130, height: 36 }]}
                resizeMode="contain"
                accessible={true}
                accessibilityLabel="Kirayedar24 Logo"
              />
            </View>
          </View>

          {/* Subtitle & Brand Tag */}
          <View style={styles.textContainer}>
            <Text style={styles.brandSubtitle}>Your next home starts here.</Text>
            
            {/* Amber Accent Indicator */}
            <View style={styles.amberPillLine} />
          </View>

          {/* Neumorphic Inset Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.insetProgressTrack}>
              <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
            </View>

            <Animated.View style={[styles.statusRow, { opacity: pulseAnim }]}>
              <Icon name="sparkles" size={12} color="#FDB022" />
              <Text style={styles.statusText}>Connecting to Kirayedar24...</Text>
            </Animated.View>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Neumorphic Trust Badge */}
      <View style={styles.trustBadgeWrapper}>
        <View style={styles.trustPill}>
          <Icon name="shield-checkmark-outline" size={14} color="#626B78" />
          <Text style={styles.trustBadgeText}>A simpler way to find your home</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EFEEE9", // Neumorphic background
    justifyContent: "space-between",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  contentWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  /* SOFT RAISED NEUMORPHIC CIRCULAR EMBOSSED MOTIF */
  neuCircleContainer: {
    width: 196,
    height: 196,
    borderRadius: 98,
    backgroundColor: "#EFEEE9",
    alignItems: "center",
    justifyContent: "center",
    // Bevel highlighting: Light top-left, darker bottom-right
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#D3D0C6",
    borderRightColor: "#D3D0C6",
    borderWidth: 2,
    // Soft dual shadow
    shadowColor: "#1E293B",
    shadowOffset: { width: 5, height: 7 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 28,
  },
  embossedInnerRing: {
    width: "82%",
    height: "82%",
    borderRadius: 80,
    backgroundColor: "#EFEEE9",
    alignItems: "center",
    justifyContent: "center",
    borderTopColor: "#D8D5CB",
    borderLeftColor: "#D8D5CB",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
    borderWidth: 1.5,
    paddingHorizontal: 12,
  },
  logoImage: {
    width: 148,
    height: 42,
  },

  /* TEXT DETAILS */
  textContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  brandSubtitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2D3748",
    letterSpacing: -0.2,
    textAlign: "center",
  },
  amberPillLine: {
    width: 36,
    height: 3.5,
    backgroundColor: "#FDB022",
    borderRadius: 2,
    marginTop: 10,
  },

  /* NEUMORPHIC INSET PROGRESS BAR */
  progressSection: {
    width: "100%",
    maxWidth: 220,
    alignItems: "center",
  },
  insetProgressTrack: {
    width: "100%",
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#E5E3DC",
    borderTopColor: "#D0CDC4",
    borderLeftColor: "#D0CDC4",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FDB022",
    borderRadius: 3.5,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#626B78",
  },

  /* BOTTOM NEUMORPHIC TRUST BADGE */
  trustBadgeWrapper: {
    alignItems: "center",
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  trustPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#EFEEE9",
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#D8D5CB",
    borderRightColor: "#D8D5CB",
    borderWidth: 1,
    shadowColor: "#1E293B",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  trustBadgeText: {
    fontSize: 12,
    color: "#626B78",
    fontWeight: "500",
  },
});
