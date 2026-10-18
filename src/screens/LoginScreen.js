import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  AccessibilityInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { authService } from "../services/authApi";
import AuthFlowManager from "../utils/AuthFlowManager";
import CustomAlert from "../components/CustomAlert";
import { getStoredFCMToken, getFCMToken, checkPendingTokenSync } from "../utils/fcmService";
import { sendFCMTokenToBackend } from "../services/api";
import { NEU_COLORS } from "../constants/theme";

const LoginScreen = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const prefilledPhone = route?.params?.phone || "";

  const [loginMethod, setLoginMethod] = useState("email"); // Default to email
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(prefilledPhone);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Entrance and button scale animations
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const entryTranslateY = useRef(new Animated.Value(14)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    buttons: [],
    icon: "alert-circle",
    iconColor: NEU_COLORS.primary,
  });
  const [otpSuccessAlert, setOtpSuccessAlert] = useState({ visible: false });

  const isTablet = width >= 600;
  const contentWidth = isTablet ? 440 : "100%";

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((isReduced) => {
        if (!isMounted) return;
        if (isReduced) {
          entryOpacity.setValue(1);
          entryTranslateY.setValue(0);
        } else {
          Animated.parallel([
            Animated.timing(entryOpacity, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(entryTranslateY, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
          ]).start();
        }
      })
      .catch(() => {
        Animated.parallel([
          Animated.timing(entryOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.timing(entryTranslateY, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start();
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const showToast = (message, type = "success") => {
    Alert.alert(type === "success" ? "Success" : "Error", message);
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showToast("Please fill all fields", "error");
      return;
    }

    if (!acceptedTerms) {
      showToast("Please accept Terms & Conditions to continue", "error");
      return;
    }

    try {
      setLoading(true);
      console.log("🔐 Attempting email login for:", email.trim());

      let fcmToken = null;
      try {
        fcmToken = await getStoredFCMToken();
        if (!fcmToken) {
          fcmToken = await getFCMToken();
        }
      } catch (fcmError) {
        console.log("ℹ️ FCM token not available:", fcmError.message);
      }

      const response = await authService.login(email.trim(), password, fcmToken);

      if (response.success && response.token) {
        const isStored = await AuthFlowManager.handleLoginSuccess(response);

        if (isStored) {
          try {
            let userFcmToken = await getStoredFCMToken();
            if (!userFcmToken) {
              userFcmToken = await getFCMToken();
            }
            const userId = response.user.id || response.user._id;
            if (userFcmToken && userId) {
              await sendFCMTokenToBackend(userId, userFcmToken);
              await checkPendingTokenSync();
            }
          } catch (fcmError) {
            console.log("ℹ️ FCM token sync skipped:", fcmError.message || fcmError);
          }

          showToast("Login successful! Welcome back! 🎉", "success");
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            });
          }, 1500);
        } else {
          showToast("Login successful but data storage failed", "error");
        }
      } else {
        if (
          response.message &&
          (response.message.toLowerCase().includes("not found") ||
            response.message.toLowerCase().includes("not exist") ||
            response.message.toLowerCase().includes("not registered"))
        ) {
          setAlertConfig({
            visible: true,
            title: "User Not Registered",
            message: `The email ${email.trim()} is not registered yet.\n\nWould you like to create a new account?`,
            icon: "lock-closed",
            iconColor: "#FDB022",
            buttons: [
              {
                text: "Register Now",
                onPress: () => {
                  navigation.navigate("SignupScreen", { email: email.trim() });
                },
              },
              {
                text: "Cancel",
                style: "cancel",
              },
            ],
          });
        } else {
          showToast(response.message || "Invalid credentials", "error");
        }
      }
    } catch (error) {
      showToast(error.message || "Login failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async () => {
    if (!phone.trim()) {
      showToast("Please enter phone number", "error");
      return;
    }

    if (phone.length < 10) {
      showToast("Please enter valid phone number", "error");
      return;
    }

    if (!acceptedTerms) {
      showToast("Please accept Terms & Conditions to continue", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await authService.sendPhoneOtp(phone);

      if (response.success) {
        setOtpSuccessAlert({
          visible: true,
          title: "OTP Sent!",
          message: `OTP has been sent to ${phone} successfully! 📱`,
          icon: "checkmark-circle",
          iconColor: "#10B981",
          buttons: [
            {
              text: "OK",
              onPress: () => {
                setOtpSuccessAlert({ visible: false });
                navigation.navigate("OtpScreen", {
                  phone: phone,
                  mode: "phone_login",
                  fromLogin: true,
                });
              },
            },
          ],
        });
      } else {
        showToast(response.message || "Failed to send OTP", "error");
      }
    } catch (error) {
      console.error("❌ Error in handlePhoneLogin:", error);
      showToast(error.message || "Failed to process request", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <StatusBar backgroundColor="#EFEEE9" barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.centerWrapper, { maxWidth: contentWidth }]}>
            {/* NEUMORPHIC COMPACT HEADER */}
            <View style={styles.headerRow}>
              {navigation.canGoBack() && (
                <TouchableOpacity
                  style={styles.neuBackButton}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="Go back"
                >
                  <Icon name="chevron-back" size={20} color="#2D3748" />
                </TouchableOpacity>
              )}

              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/Kirayedar_logo.png")}
                  style={styles.brandLogo}
                  resizeMode="contain"
                  accessible={true}
                  accessibilityLabel="Kirayedar24 Logo"
                />
              </View>
            </View>

            {/* WELCOME HEADLINE */}
            <View style={styles.welcomeBlock}>
              <Text style={styles.welcomeTitle}>Welcome Back</Text>
              <Text style={styles.welcomeSubtitle}>Sign in to your Kirayedar24 account</Text>
            </View>

            {/* NEUMORPHIC RAISED CARD */}
            <Animated.View
              style={[
                styles.neuCard,
                {
                  opacity: entryOpacity,
                  transform: [{ translateY: entryTranslateY }],
                },
              ]}
            >
              {/* NEUMORPHIC INSET TAB SELECTOR (Email | Phone) */}
              <View style={styles.tabTrack}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    loginMethod === "email" && styles.tabButtonActive,
                  ]}
                  onPress={() => setLoginMethod("email")}
                  activeOpacity={0.8}
                >
                  <Icon
                    name="mail-outline"
                    size={16}
                    color={loginMethod === "email" ? "#D97706" : "#626B78"}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      loginMethod === "email" && styles.tabTextActive,
                    ]}
                  >
                    Email
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    loginMethod === "phone" && styles.tabButtonActive,
                  ]}
                  onPress={() => setLoginMethod("phone")}
                  activeOpacity={0.8}
                >
                  <Icon
                    name="call-outline"
                    size={16}
                    color={loginMethod === "phone" ? "#D97706" : "#626B78"}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      loginMethod === "phone" && styles.tabTextActive,
                    ]}
                  >
                    Phone
                  </Text>
                </TouchableOpacity>
              </View>

              {/* FORM FIELDS */}
              {loginMethod === "email" ? (
                <View style={styles.formContainer}>
                  {/* Email Field */}
                  <Text style={styles.fieldLabel}>Email address</Text>
                  <View
                    style={[
                      styles.neuInsetInput,
                      focusedField === "email" && styles.neuInsetInputFocused,
                    ]}
                  >
                    <Icon
                      name="mail-outline"
                      size={18}
                      color={focusedField === "email" ? "#FDB022" : "#626B78"}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your email"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                  {email.length > 3 && !/\S+@\S+\.\S+/.test(email) && (
                    <Text style={styles.inlineWarning}>
                      Please enter a valid email address
                    </Text>
                  )}

                  {/* Password Field */}
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View
                    style={[
                      styles.neuInsetInput,
                      focusedField === "password" && styles.neuInsetInputFocused,
                    ]}
                  >
                    <Icon
                      name="lock-closed-outline"
                      size={18}
                      color={focusedField === "password" ? "#FDB022" : "#626B78"}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="••••••••••"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    >
                      <Icon
                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                        size={19}
                        color="#626B78"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Remember Me & Forgot Password Row */}
                  <View style={styles.rememberForgotRow}>
                    <TouchableOpacity
                      style={styles.checkboxTouch}
                      onPress={() => setRememberMe(!rememberMe)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.neuCheckbox,
                          rememberMe && styles.neuCheckboxChecked,
                        ]}
                      >
                        {rememberMe && (
                          <Icon name="checkmark" size={13} color="#2D3748" />
                        )}
                      </View>
                      <Text style={styles.rememberText}>Remember me</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        try {
                          navigation.navigate("ForgotPasswordScreen");
                        } catch {
                          navigation.navigate("ForgotPassword");
                        }
                      }}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Terms and Privacy Policy Consent */}
                  <View style={styles.termsRow}>
                    <TouchableOpacity
                      style={styles.checkboxTouch}
                      onPress={() => setAcceptedTerms(!acceptedTerms)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 15, bottom: 15, left: 15, right: 25 }}
                    >
                      <View
                        style={[
                          styles.neuCheckbox,
                          acceptedTerms && styles.neuCheckboxChecked,
                        ]}
                      >
                        {acceptedTerms && (
                          <Icon name="checkmark" size={13} color="#2D3748" />
                        )}
                      </View>
                    </TouchableOpacity>
                    <View style={styles.termsTextWrapper}>
                      <Text style={styles.termsText}>
                        I accept the{" "}
                        <Text
                          style={styles.termsLink}
                          onPress={() => navigation.navigate("TermsScreen")}
                        >
                          Terms & Conditions
                        </Text>{" "}
                        and{" "}
                        <Text
                          style={styles.termsLink}
                          onPress={() => navigation.navigate("TermsScreen")}
                        >
                          Privacy Policy
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {/* Primary Amber Login Button */}
                  <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <TouchableOpacity
                      style={[
                        styles.neuPrimaryButton,
                        (!acceptedTerms || loading) && styles.neuButtonDisabled,
                      ]}
                      onPress={handleEmailLogin}
                      onPressIn={handlePressIn}
                      onPressOut={handlePressOut}
                      disabled={loading || !acceptedTerms}
                      activeOpacity={0.9}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#2D3748" />
                      ) : (
                        <>
                          <Text style={styles.neuButtonText}>Log in</Text>
                          <Icon
                            name="arrow-forward"
                            size={18}
                            color="#2D3748"
                            style={{ marginLeft: 8 }}
                          />
                        </>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              ) : (
                <View style={styles.formContainer}>
                  {/* Phone Field */}
                  <Text style={styles.fieldLabel}>Mobile number</Text>
                  <View
                    style={[
                      styles.neuInsetInput,
                      focusedField === "phone" && styles.neuInsetInputFocused,
                    ]}
                  >
                    <View style={styles.phonePrefixBox}>
                      <Icon name="call-outline" size={17} color="#626B78" />
                      <Text style={styles.phonePrefixText}>+91</Text>
                      <View style={styles.phoneDivider} />
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter 10-digit number"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={phone}
                      onChangeText={setPhone}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                    />
                    {phone.length === 10 && (
                      <Icon name="checkmark-circle" size={19} color="#10B981" />
                    )}
                  </View>
                  {phone.length > 0 && phone.length < 10 && (
                    <Text style={styles.inlineWarning}>
                      Phone number must be 10 digits ({10 - phone.length} more)
                    </Text>
                  )}

                  {/* Terms and Conditions Consent */}
                  <View style={styles.termsRow}>
                    <TouchableOpacity
                      style={styles.checkboxTouch}
                      onPress={() => setAcceptedTerms(!acceptedTerms)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 15, bottom: 15, left: 15, right: 25 }}
                    >
                      <View
                        style={[
                          styles.neuCheckbox,
                          acceptedTerms && styles.neuCheckboxChecked,
                        ]}
                      >
                        {acceptedTerms && (
                          <Icon name="checkmark" size={13} color="#2D3748" />
                        )}
                      </View>
                    </TouchableOpacity>
                    <View style={styles.termsTextWrapper}>
                      <Text style={styles.termsText}>
                        I accept the{" "}
                        <Text
                          style={styles.termsLink}
                          onPress={() => navigation.navigate("TermsScreen")}
                        >
                          Terms & Conditions
                        </Text>{" "}
                        and{" "}
                        <Text
                          style={styles.termsLink}
                          onPress={() => navigation.navigate("TermsScreen")}
                        >
                          Privacy Policy
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {/* Primary Amber Send OTP Button */}
                  <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <TouchableOpacity
                      style={[
                        styles.neuPrimaryButton,
                        (!acceptedTerms || loading) && styles.neuButtonDisabled,
                      ]}
                      onPress={handlePhoneLogin}
                      onPressIn={handlePressIn}
                      onPressOut={handlePressOut}
                      disabled={loading || !acceptedTerms}
                      activeOpacity={0.9}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#2D3748" />
                      ) : (
                        <>
                          <Text style={styles.neuButtonText}>Send OTP</Text>
                          <Icon
                            name="arrow-forward"
                            size={18}
                            color="#2D3748"
                            style={{ marginLeft: 8 }}
                          />
                        </>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              )}

              {/* Bottom Signup Navigation */}
              <View style={styles.footerLinkRow}>
                <Text style={styles.footerPrompt}>New to Kirayedar24? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("SignupScreen")}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 8, right: 12 }}
                >
                  <Text style={styles.footerHighlight}>Create account</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Trust Badge */}
            <View style={styles.trustBadgeContainer}>
              <View style={styles.trustPill}>
                <Icon name="shield-checkmark-outline" size={14} color="#626B78" />
                <Text style={styles.trustBadgeText}>A simpler way to find your home</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        onDismiss={() => setAlertConfig({ ...alertConfig, visible: false })}
      />

      {/* OTP Success Alert */}
      <CustomAlert
        visible={otpSuccessAlert.visible}
        title={otpSuccessAlert.title}
        message={otpSuccessAlert.message}
        buttons={otpSuccessAlert.buttons}
        icon={otpSuccessAlert.icon}
        iconColor={otpSuccessAlert.iconColor}
        onDismiss={() => setOtpSuccessAlert({ ...otpSuccessAlert, visible: false })}
      />
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EFEEE9", // Neumorphic background
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  centerWrapper: {
    width: "100%",
    alignSelf: "center",
  },

  /* HEADER & LOGO */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  neuBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFEEE9",
    justifyContent: "center",
    alignItems: "center",
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#D3D0C6",
    borderRightColor: "#D3D0C6",
    borderWidth: 1.5,
    shadowColor: "#1E293B",
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 12,
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    marginRight: 40, // Balance back button
  },
  brandLogo: {
    width: 140,
    height: 38,
  },

  /* WELCOME HEADLINE */
  welcomeBlock: {
    marginBottom: 20,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2D3748",
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 13.5,
    color: "#626B78",
    marginTop: 4,
    fontWeight: "500",
  },

  /* NEUMORPHIC RAISED CARD */
  neuCard: {
    backgroundColor: "#EFEEE9",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#D3D0C6",
    borderRightColor: "#D3D0C6",
    borderWidth: 1.5,
    shadowColor: "#1E293B",
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  /* NEUMORPHIC INSET TAB SELECTOR */
  tabTrack: {
    flexDirection: "row",
    backgroundColor: "#E5E3DC",
    borderRadius: 13,
    padding: 4,
    borderTopColor: "#D0CDC4",
    borderLeftColor: "#D0CDC4",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
    borderWidth: 1.5,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: "#EFEEE9",
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#D3D0C6",
    borderRightColor: "#D3D0C6",
    borderWidth: 1,
    shadowColor: "#1E293B",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#626B78",
  },
  tabTextActive: {
    color: "#D97706",
    fontWeight: "700",
  },

  /* FORM BODY */
  formContainer: {
    width: "100%",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 6,
  },
  neuInsetInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E3DC",
    borderRadius: 13,
    paddingHorizontal: 13,
    height: 48,
    marginBottom: 13,
    borderTopColor: "#D0CDC4",
    borderLeftColor: "#D0CDC4",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
    borderWidth: 1.5,
  },
  neuInsetInputFocused: {
    borderTopColor: "#FDB022",
    borderLeftColor: "#FDB022",
    borderBottomColor: "#FDB022",
    borderRightColor: "#FDB022",
    backgroundColor: "#ECEAE3",
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    color: "#2D3748",
    marginLeft: 8,
    paddingVertical: 0,
  },
  phonePrefixBox: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 6,
  },
  phonePrefixText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3748",
    marginLeft: 5,
  },
  phoneDivider: {
    width: 1,
    height: 18,
    backgroundColor: "#C5C2B7",
    marginLeft: 8,
  },
  inlineWarning: {
    fontSize: 11.5,
    color: "#EF4444",
    marginTop: -9,
    marginBottom: 12,
    marginLeft: 2,
    fontWeight: "500",
  },

  /* REMEMBER ME & FORGOT PASSWORD */
  rememberForgotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 14,
  },
  checkboxTouch: {
    flexDirection: "row",
    alignItems: "center",
  },
  neuCheckbox: {
    width: 19,
    height: 19,
    borderRadius: 5,
    backgroundColor: "#E5E3DC",
    borderTopColor: "#D0CDC4",
    borderLeftColor: "#D0CDC4",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  neuCheckboxChecked: {
    backgroundColor: "#FDB022",
    borderTopColor: "#FDB022",
    borderLeftColor: "#FDB022",
    borderBottomColor: "#D97706",
    borderRightColor: "#D97706",
  },
  rememberText: {
    fontSize: 13,
    color: "#626B78",
    marginLeft: 8,
    fontWeight: "500",
  },
  forgotText: {
    fontSize: 13,
    color: "#D97706",
    fontWeight: "600",
  },

  /* TERMS & PRIVACY */
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  termsTextWrapper: {
    flex: 1,
    marginLeft: 8,
  },
  termsText: {
    fontSize: 12,
    color: "#626B78",
    lineHeight: 18,
  },
  termsLink: {
    color: "#D97706",
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  /* PRIMARY AMBER BUTTON */
  neuPrimaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDB022",
    height: 50,
    borderRadius: 14,
    borderTopColor: "#FDE68A",
    borderLeftColor: "#FDE68A",
    borderBottomColor: "#D97706",
    borderRightColor: "#D97706",
    borderWidth: 1.5,
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  neuButtonDisabled: {
    backgroundColor: "#D5D2C8",
    borderTopColor: "#E2DFD6",
    borderLeftColor: "#E2DFD6",
    borderBottomColor: "#BCB9AE",
    borderRightColor: "#BCB9AE",
    elevation: 0,
    shadowOpacity: 0,
  },
  neuButtonText: {
    fontSize: 15.5,
    fontWeight: "700",
    color: "#2D3748",
  },

  /* FOOTER */
  footerLinkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  footerPrompt: {
    fontSize: 13.5,
    color: "#626B78",
  },
  footerHighlight: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#D97706",
  },

  /* TRUST BADGE */
  trustBadgeContainer: {
    alignItems: "center",
    marginTop: 24,
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
    fontSize: 11.5,
    color: "#626B78",
    fontWeight: "500",
  },
});
