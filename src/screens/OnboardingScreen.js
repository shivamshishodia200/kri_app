import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from "react-native-vector-icons/Ionicons";
import { NEU_COLORS } from "../constants/theme";

const slides = [
  {
    id: "1",
    image: require("../assets/onboard1.webp"),
    title: "Discover Tranquility,\nRedefine Living",
    subtitle: "Find your ideal rental home with authentic listings and transparent pricing.",
  },
  {
    id: "2",
    image: require("../assets/onboard2.webp"),
    title: "Verified Properties,\nZero Brokerage",
    subtitle: "Browse detailed floor plans, high-res photos and direct contact with owners.",
  },
  {
    id: "3",
    image: require("../assets/onboard3.png"),
    title: "Fast Agreements &\nSmart Payments",
    subtitle: "Complete bookings, rent payments, and legal agreements seamlessly in-app.",
  },
];

const OnboardingScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    animateContent();
  }, [currentIndex]);

  const animateContent = () => {
    fadeAnim.setValue(0);
    slideUpAnim.setValue(30);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      goToLogin();
    }
  };

  const goToLogin = () => {
    try {
      navigation.replace("LoginScreen");
    } catch (e) {
      navigation.navigate("LoginScreen");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ImageBackground source={item.image} style={[styles.bgImage, { width }]}>
            {/* Dark gradient vignette over photo */}
            <View style={styles.gradientOverlay} />

            {/* Skip Button */}
            {currentIndex < slides.length - 1 && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={goToLogin}
                activeOpacity={0.7}
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}

            {/* Neumorphic Bottom Floating Sheet */}
            <Animated.View
              style={[
                styles.bottomCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideUpAnim }],
                },
              ]}
            >
              {/* Inset Stepper Dots */}
              <View style={styles.dotsInsetContainer}>
                {slides.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      idx === currentIndex && styles.activeDot,
                    ]}
                  />
                ))}
              </View>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleNext}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryButtonText}>
                    {currentIndex === slides.length - 1 ? "Get Started" : "Continue"}
                  </Text>
                  <Icon name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={goToLogin}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryButtonText}>
                    Already have an account? <Text style={styles.boldText}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ImageBackground>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A202C",
  },
  bgImage: {
    height: "100%",
    justifyContent: "flex-end",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.42)",
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(239, 238, 233, 0.22)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  bottomCard: {
    backgroundColor: "#EFEEE9",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 38,
    borderTopWidth: 2,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderRightColor: "#D8D5CB",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  dotsInsetContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "#E5E3DC",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: "#D3D0C6",
    borderLeftColor: "#D3D0C6",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#94A3B8",
    marginHorizontal: 4,
  },
  activeDot: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FDB022",
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#2D3748",
    marginBottom: 10,
    lineHeight: 32,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#626B78",
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 26,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#FDB022",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopColor: "#FDE68A",
    borderLeftColor: "#FDE68A",
    borderBottomColor: "#D97706",
    borderRightColor: "#D97706",
    elevation: 4,
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    minHeight: 50,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    paddingVertical: 8,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#626B78",
    fontSize: 13,
    fontWeight: "500",
  },
  boldText: {
    fontWeight: "700",
    color: "#D97706",
  },
});

export default OnboardingScreen;
