// ForgotPasswordScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { NEU_COLORS } from "../constants/theme";
import { NeuCard, NeuButton, NeuInput } from "../components/neu";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const handleReset = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your registered email or phone number.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        "Reset Link Sent",
        "If an account exists with this credential, a password reset link has been dispatched.",
        [{ text: "OK", onPress: () => navigation.navigate("LoginScreen") }]
      );
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <StatusBar backgroundColor="#EFEEE9" barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <View style={[styles.contentContainer, isTablet && styles.tabletContainer]}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.neuBackBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={20} color="#2D3748" />
          </TouchableOpacity>

          <NeuCard style={styles.card} variant="raised" padding={24}>
            {/* Header Icon */}
            <View style={styles.iconCircle}>
              <Icon name="key-outline" size={32} color="#FDB022" />
            </View>

            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your registered email address or phone number and we’ll send instructions to reset your password.
            </Text>

            {/* Inset input */}
            <NeuInput
              label="Email or Phone Number"
              placeholder="e.g. name@example.com or 9876543210"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Icon name="mail-outline" size={18} color="#626B78 Gamboge" />}
              containerStyle={{ marginBottom: 20 }}
            />

            {/* Reset Button */}
            <NeuButton
              title="Send Reset Instructions"
              variant="primary"
              onPress={handleReset}
              loading={isLoading}
              style={styles.resetBtn}
            />

            {/* Back to Login */}
            <TouchableOpacity
              onPress={() => navigation.navigate("LoginScreen")}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.backText}>Return to Log In</Text>
            </TouchableOpacity>
          </NeuCard>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EFEEE9",
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: "center",
  },
  contentContainer: {
    paddingHorizontal: 20,
    width: "100%",
  },
  tabletContainer: {
    maxWidth: 460,
    alignSelf: "center",
  },
  neuBackBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFEEE9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#D8D5CB",
    borderRightColor: "#D8D5CB",
    shadowColor: "#1E293B",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  card: {
    borderRadius: 22,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#EFEEE9",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#D8D5CB",
    borderRightColor: "#D8D5CB",
    shadowColor: "#1E293B",
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2D3748",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#626B78",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  resetBtn: {
    marginTop: 4,
  },
  backBtn: {
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#D97706",
  },
});

export default ForgotPasswordScreen;
