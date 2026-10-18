import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { checkAutoLogin } from "../utils/authManager";

const { width } = Dimensions.get("window");

const WebSplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: false,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: false,
      }),
    ]).start();

    // Check login status after animations complete
    const timer = setTimeout(() => {
      console.log("🚀 WebSplashScreen: Starting auto-login check...");
      checkAutoLogin(navigation);
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.centerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Image
          source={require("../assets/Kirayedar_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.welcomeLabel}>WELCOME HOME</Text>
        <Text style={styles.title}>Your next chapter starts here.</Text>
        <View style={styles.amberLine} />
        <Text style={styles.subtitle}>Find, rent and connect with confidence.</Text>
      </Animated.View>

      {/* Progress Bar */}
      <View style={styles.bottomContainer}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.loadingText}>A simpler way to find your home</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFEEE9",
    alignItems: "center",
    justifyContent: "center",
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 55,
    marginBottom: 20,
  },
  welcomeLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#94A3B8",
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    color: "#1E293B",
    fontWeight: "800",
    letterSpacing: -0.4,
    textAlign: "center",
  },
  amberLine: {
    width: 44,
    height: 3.5,
    backgroundColor: "#FDB022",
    borderRadius: 2,
    marginVertical: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 50,
    alignItems: "center",
    width: Math.min(width * 0.75, 340),
  },
  progressBackground: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FDB022",
    borderRadius: 3,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
});

export default WebSplashScreen;