import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  StatusBar,
  Alert,
  ActivityIndicator,
  FlatList,
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
import { getPincodeByArea } from "../utils/locationData";
import AuthFlowManager from "../utils/AuthFlowManager";
import CustomAlert from "../components/CustomAlert";
import { getStoredFCMToken, getFCMToken } from "../utils/fcmService";
import { NEU_COLORS } from "../constants/theme";

// Stable Neumorphic Searchable Dropdown Picker defined outside SignupScreen
const SearchablePicker = React.memo(({
  title,
  placeholder,
  options,
  selectedValue,
  onSelect,
  isOpen,
  setIsOpen,
  searchText,
  setSearchText,
  loading = false,
  loadingText = "Loading...",
  disabled = false,
}) => {
  const filteredOptions = (options || []).filter((opt) =>
    opt.toLowerCase().includes((searchText || "").toLowerCase())
  );

  return (
    <View style={styles.dropdownFieldWrapper}>
      <TouchableOpacity
        style={[
          styles.neuInsetInput,
          disabled && styles.neuInsetInputDisabled,
          isOpen && styles.neuInsetInputFocused,
        ]}
        onPress={() => {
          if (!disabled && !loading) {
            setIsOpen(true);
          }
        }}
        activeOpacity={0.8}
        disabled={disabled || loading}
        accessibilityRole="combobox"
        accessibilityLabel={title}
      >
        <View style={styles.inputIconLeft}>
          <Icon
            name={title.includes("State") ? "map-outline" : "business-outline"}
            size={18}
            color={selectedValue ? NEU_COLORS.primary : "#94A3B8"}
          />
        </View>

        <Text
          style={[
            styles.dropdownSelectedText,
            !selectedValue && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
          numberOfLines={1}
        >
          {loading
            ? loadingText
            : selectedValue
            ? selectedValue
            : placeholder}
        </Text>

        <View style={styles.inputIconRight}>
          {loading ? (
            <ActivityIndicator size="small" color={NEU_COLORS.primary} />
          ) : (
            <Icon
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color="#626B78"
            />
          )}
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setIsOpen(false);
          setSearchText("");
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setIsOpen(false);
            setSearchText("");
          }}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select {title}</Text>
                <Text style={styles.modalSubtitle}>
                  Choose from available locations
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setIsOpen(false);
                  setSearchText("");
                }}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={20} color="#2D3748" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <Icon
                name="search"
                size={18}
                color="#94A3B8"
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.modalSearchInput}
                placeholder={`Search ${title.toLowerCase()}...`}
                placeholderTextColor="#94A3B8"
                value={searchText}
                onChangeText={setSearchText}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {searchText ? (
                <TouchableOpacity onPress={() => setSearchText("")}>
                  <Icon name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => `${item}-${index}`}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              renderItem={({ item }) => {
                const isSelected = selectedValue === item;
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalListItem,
                      isSelected && styles.modalListItemActive,
                    ]}
                    onPress={() => {
                      onSelect(item);
                      setIsOpen(false);
                      setSearchText("");
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalListItemText,
                        isSelected && styles.modalListItemTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Icon name="checkmark-circle" size={19} color="#FDB022" />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={() => (
                <View style={styles.modalEmptyBox}>
                  <Icon name="search" size={26} color="#CBD5E1" />
                  <Text style={styles.modalEmptyText}>
                    No matching {title.toLowerCase()} found
                  </Text>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
});

const SignupScreen = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const { phoneNumber, fromOtp, email: prefilledEmail } = route?.params || {};
  const isCompleteRegistration = fromOtp && phoneNumber;

  const [form, setForm] = useState({
    fullName: "",
    email: prefilledEmail || "",
    phone: phoneNumber || "",
    password: "",
    state: "",
    city: "",
    post: "",
    street: "",
    pinCode: "",
    userType: "", // "Owner" or "Tenant"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  // Entrance and tactile button animations
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const entryTranslateY = useRef(new Animated.Value(14)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    buttons: [],
    icon: "checkmark-circle",
    iconColor: NEU_COLORS.primary,
  });

  const isTablet = width >= 600;
  const contentWidth = isTablet ? 460 : "100%";

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

  // Fetch states from backend API with fallback
  const fetchStatesFromAPI = async () => {
    try {
      setStatesLoading(true);
      const response = await fetch("https://backend.kirayedar24.com/api/location/states");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let states = [];
      if (data.success && data.data && Array.isArray(data.data)) {
        states = data.data;
      } else {
        throw new Error("Invalid API response format");
      }
      setAllStates(states);
    } catch (error) {
      console.log("⚠️ Falling back to static state data:", error.message);
      const { getAllStates } = await import("../utils/locationData");
      const states = getAllStates();
      setAllStates(states);
    } finally {
      setStatesLoading(false);
    }
  };

  // Fetch districts from backend API with fallback
  const fetchDistrictsFromAPI = async (stateName) => {
    try {
      setDistrictsLoading(true);
      const response = await fetch(`https://backend.kirayedar24.com/api/location/districts/${stateName}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let districts = [];
      if (data.success && data.data && Array.isArray(data.data)) {
        districts = data.data;
      } else {
        throw new Error("Invalid API response format");
      }
      setAvailableCities(districts);
    } catch (error) {
      console.log("⚠️ Falling back to static district data:", error.message);
      const { getCitiesByState } = await import("../utils/locationData");
      const districts = getCitiesByState(stateName);
      setAvailableCities(districts);
    } finally {
      setDistrictsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatesFromAPI();
  }, []);

  useEffect(() => {
    if (form.state) {
      fetchDistrictsFromAPI(form.state);
      setForm((prev) => ({ ...prev, city: "", post: "", street: "", pinCode: "" }));
    } else {
      setAvailableCities([]);
      setForm((prev) => ({ ...prev, city: "", post: "", street: "", pinCode: "" }));
    }
  }, [form.state]);

  useEffect(() => {
    if (form.city) {
      setForm((prev) => ({ ...prev, post: "", street: "", pinCode: "" }));
    }
  }, [form.city]);

  useEffect(() => {
    if (form.city && form.post) {
      const pincode = getPincodeByArea(form.city, form.post);
      if (pincode) {
        setForm((prev) => ({ ...prev, pinCode: pincode }));
      }
    }
  }, [form.post, form.city]);

  const showToast = (message, type = "success") => {
    Alert.alert(type === "success" ? "Success" : "Error", message);
  };

  const handleSignup = async () => {
    if (isCompleteRegistration) {
      if (!form.fullName || !form.email || !form.userType) {
        showToast("Please fill your name, email and select account type.", "error");
        return;
      }
    } else {
      if (
        !form.fullName ||
        !form.email ||
        !form.phone ||
        !form.password ||
        !form.state ||
        !form.city ||
        !form.post ||
        !form.userType
      ) {
        showToast("Please fill all required fields and select account type.", "error");
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isCompleteRegistration) {
        let fcmToken = await getStoredFCMToken();
        if (!fcmToken) {
          fcmToken = await getFCMToken();
        }

        const userData = {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: phoneNumber,
          state: form.state.trim(),
          city: form.city.trim(),
          street: form.post.trim(),
          pinCode: form.pinCode.trim(),
          role: form.userType,
          fcmToken: fcmToken || "",
        };

        const response = await authService.completeRegistration(userData);

        if (response.success) {
          const isStored = await AuthFlowManager.handleRegistrationSuccess(response);

          if (isStored) {
            showToast("Registration completed successfully! Welcome! 🎉", "success");
            setTimeout(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Home" }],
              });
            }, 1500);
          } else {
            showToast("Registration successful but data storage failed", "error");
          }
        } else {
          showToast(response.message || "Registration failed", "error");
        }
      } else {
        let fcmToken = await getStoredFCMToken();
        if (!fcmToken) {
          fcmToken = await getFCMToken();
        }

        const userData = {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          state: form.state.trim(),
          city: form.city.trim(),
          street: form.post.trim(),
          pinCode: form.pinCode.trim(),
          password: form.password,
          role: form.userType,
          fcmToken: fcmToken || "",
        };

        const response = await authService.signup(userData);

        if (response.success) {
          setAlertConfig({
            visible: true,
            title: "Registration Successful! 🎉",
            message: `Welcome ${form.fullName}!\n\nYour account has been created successfully.\n\nPlease login to continue.`,
            icon: "checkmark-circle",
            iconColor: "#10B981",
            buttons: [
              {
                text: "Login Now",
                onPress: () => {
                  navigation.navigate("LoginScreen", {
                    phone: form.phone.trim(),
                    fromSignup: true,
                  });
                },
              },
            ],
          });
        } else {
          const errorMessage =
            response.message || response.error || "Signup failed - please try again";
          showToast(errorMessage, "error");
        }
      }
    } catch (error) {
      showToast(error.message || "Something went wrong", "error");
    } finally {
      setIsLoading(false);
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
              <TouchableOpacity
                style={styles.neuBackButton}
                onPress={() => {
                  if (navigation.canGoBack()) navigation.goBack();
                  else navigation.navigate("LoginScreen");
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Go back"
              >
                <Icon name="chevron-back" size={20} color="#2D3748" />
              </TouchableOpacity>

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
              <Text style={styles.welcomeTitle}>
                {isCompleteRegistration ? "Complete Profile" : "Create an Account"}
              </Text>
              <Text style={styles.welcomeSubtitle}>
                {isCompleteRegistration
                  ? "Finish setting up your profile to continue"
                  : "Find, rent and connect with confidence."}
              </Text>
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
              {/* SECTION 1: ACCOUNT TYPE SELECTION */}
              <View style={styles.sectionBlock}>
                <Text style={styles.fieldLabel}>I am a *</Text>
                <View style={styles.roleRow}>
                  {/* Property Owner */}
                  <TouchableOpacity
                    style={[
                      styles.roleCard,
                      form.userType === "Owner" && styles.roleCardActive,
                    ]}
                    onPress={() => setForm({ ...form, userType: "Owner" })}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.roleIconCircle,
                        form.userType === "Owner" && styles.roleIconCircleActive,
                      ]}
                    >
                      <Icon
                        name="business-outline"
                        size={18}
                        color={form.userType === "Owner" ? "#D97706" : "#626B78"}
                      />
                    </View>
                    <View style={styles.roleTextWrap}>
                      <Text
                        style={[
                          styles.roleTitle,
                          form.userType === "Owner" && styles.roleTitleActive,
                        ]}
                      >
                        Property Owner
                      </Text>
                      <Text style={styles.roleSubtitle}>List properties</Text>
                    </View>
                    {form.userType === "Owner" && (
                      <Icon name="checkmark-circle" size={17} color="#FDB022" />
                    )}
                  </TouchableOpacity>

                  {/* Looking for Rent */}
                  <TouchableOpacity
                    style={[
                      styles.roleCard,
                      form.userType === "Tenant" && styles.roleCardActive,
                    ]}
                    onPress={() => setForm({ ...form, userType: "Tenant" })}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.roleIconCircle,
                        form.userType === "Tenant" && styles.roleIconCircleActive,
                      ]}
                    >
                      <Icon
                        name="search-outline"
                        size={18}
                        color={form.userType === "Tenant" ? "#D97706" : "#626B78"}
                      />
                    </View>
                    <View style={styles.roleTextWrap}>
                      <Text
                        style={[
                          styles.roleTitle,
                          form.userType === "Tenant" && styles.roleTitleActive,
                        ]}
                      >
                        Looking for Rent
                      </Text>
                      <Text style={styles.roleSubtitle}>Find homes</Text>
                    </View>
                    {form.userType === "Tenant" && (
                      <Icon name="checkmark-circle" size={17} color="#FDB022" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* SECTION 2: PERSONAL DETAILS */}
              <View style={styles.sectionBlock}>
                {/* Full Name */}
                <Text style={styles.fieldLabel}>Full Name *</Text>
                <View
                  style={[
                    styles.neuInsetInput,
                    focusedField === "fullName" && styles.neuInsetInputFocused,
                  ]}
                >
                  <Icon
                    name="person-outline"
                    size={18}
                    color={focusedField === "fullName" ? "#FDB022" : "#626B78"}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your full name"
                    placeholderTextColor="#94A3B8"
                    value={form.fullName}
                    onChangeText={(text) => setForm({ ...form, fullName: text })}
                    onFocus={() => setFocusedField("fullName")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                {/* Email Address */}
                <Text style={styles.fieldLabel}>Email address *</Text>
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
                    placeholder="name@example.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={form.email}
                    onChangeText={(text) => setForm({ ...form, email: text })}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
                {form.email.length > 3 && !/\S+@\S+\.\S+/.test(form.email) && (
                  <Text style={styles.inlineWarning}>
                    Please enter a valid email address
                  </Text>
                )}

                {/* Mobile Number */}
                <Text style={styles.fieldLabel}>Mobile number *</Text>
                <View
                  style={[
                    styles.neuInsetInput,
                    focusedField === "phone" && styles.neuInsetInputFocused,
                    isCompleteRegistration && styles.neuInsetInputDisabled,
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
                    value={form.phone}
                    onChangeText={(text) => setForm({ ...form, phone: text })}
                    editable={!isCompleteRegistration}
                    onFocus={() => setFocusedField("phone")}
                    onBlur={() => setFocusedField(null)}
                  />
                  {form.phone && form.phone.length === 10 && (
                    <Icon name="checkmark-circle" size={18} color="#10B981" />
                  )}
                </View>
                {!isCompleteRegistration && form.phone.length > 0 && form.phone.length < 10 && (
                  <Text style={styles.inlineWarning}>
                    Phone number must be 10 digits ({10 - form.phone.length} more)
                  </Text>
                )}
              </View>

              {/* SECTION 3: LOCATION DETAILS */}
              <View style={styles.sectionBlock}>
                <Text style={styles.fieldLabel}>State *</Text>
                <SearchablePicker
                  title="Select State"
                  placeholder="Select State *"
                  options={allStates}
                  selectedValue={form.state}
                  onSelect={(val) =>
                    setForm({ ...form, state: val, city: "", post: "", pinCode: "" })
                  }
                  isOpen={stateDropdownOpen}
                  setIsOpen={(val) => {
                    setStateDropdownOpen(val);
                    if (val) setCityDropdownOpen(false);
                  }}
                  searchText={stateSearch}
                  setSearchText={setStateSearch}
                  loading={statesLoading}
                  loadingText="Loading states..."
                />

                <Text style={styles.fieldLabel}>District / City *</Text>
                <SearchablePicker
                  title="Select District / City"
                  placeholder={form.state ? "Select City / District *" : "Select State first *"}
                  options={availableCities}
                  selectedValue={form.city}
                  onSelect={(val) =>
                    setForm({ ...form, city: val, post: "", pinCode: "" })
                  }
                  isOpen={cityDropdownOpen}
                  setIsOpen={(val) => {
                    setCityDropdownOpen(val);
                    if (val) setStateDropdownOpen(false);
                  }}
                  searchText={citySearch}
                  setSearchText={setCitySearch}
                  loading={districtsLoading && !!form.state}
                  loadingText="Loading districts..."
                  disabled={!form.state}
                />

                <Text style={styles.fieldLabel}>Area / Locality *</Text>
                <View
                  style={[
                    styles.neuInsetInput,
                    focusedField === "post" && styles.neuInsetInputFocused,
                    !form.city && styles.neuInsetInputDisabled,
                  ]}
                >
                  <Icon
                    name="navigate-outline"
                    size={18}
                    color={focusedField === "post" ? "#FDB022" : "#626B78"}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder={
                      form.city ? "Area / Locality / Sector *" : "Select District first"
                    }
                    placeholderTextColor="#94A3B8"
                    value={form.post}
                    onChangeText={(text) => setForm({ ...form, post: text })}
                    editable={!!form.city}
                    onFocus={() => setFocusedField("post")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <Text style={styles.fieldLabel}>PIN Code (Optional)</Text>
                <View
                  style={[
                    styles.neuInsetInput,
                    focusedField === "pinCode" && styles.neuInsetInputFocused,
                  ]}
                >
                  <Icon
                    name="pin-outline"
                    size={18}
                    color={focusedField === "pinCode" ? "#FDB022" : "#626B78"}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter 6-digit PIN code"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    maxLength={6}
                    value={form.pinCode}
                    onChangeText={(text) => {
                      const numericText = text.replace(/[^0-9]/g, "");
                      setForm({ ...form, pinCode: numericText });
                    }}
                    onFocus={() => setFocusedField("pinCode")}
                    onBlur={() => setFocusedField(null)}
                  />
                  {form.pinCode && form.pinCode.length === 6 && (
                    <Icon name="checkmark-circle" size={18} color="#10B981" />
                  )}
                </View>
                {form.city && form.post && form.pinCode && (
                  <Text style={styles.helperText}>
                    ✓ Auto-filled for {form.post}. You can edit if incorrect.
                  </Text>
                )}
                {form.pinCode && form.pinCode.length > 0 && form.pinCode.length < 6 && (
                  <Text style={styles.inlineWarning}>
                    PIN code must be 6 digits ({6 - form.pinCode.length} more)
                  </Text>
                )}
              </View>

              {/* SECTION 4: SECURITY (Only for regular signup) */}
              {!isCompleteRegistration && (
                <View style={styles.sectionBlock}>
                  <Text style={styles.fieldLabel}>Password *</Text>
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
                      placeholder="Create a strong password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      value={form.password}
                      onChangeText={(text) => setForm({ ...form, password: text })}
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
                </View>
              )}

              {/* PRIMARY SUBMIT BUTTON */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={[
                    styles.neuPrimaryButton,
                    isLoading && styles.neuButtonDisabled,
                  ]}
                  onPress={handleSignup}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  disabled={isLoading}
                  activeOpacity={0.9}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#2D3748" />
                  ) : (
                    <>
                      <Text style={styles.neuButtonText}>
                        {isCompleteRegistration ? "Complete Profile" : "Create account"}
                      </Text>
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

              {/* FOOTER LINK */}
              <View style={styles.footerLinkRow}>
                <Text style={styles.footerPrompt}>Already have an account? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("LoginScreen")}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 8, right: 12 }}
                >
                  <Text style={styles.footerHighlight}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* TRUST BADGE */}
            <View style={styles.trustBadgeContainer}>
              <View style={styles.trustPill}>
                <Icon name="shield-checkmark-outline" size={14} color="#626B78" />
                <Text style={styles.trustBadgeText}>A simpler way to find your home</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* CUSTOM ALERT */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </SafeAreaView>
  );
};

export default SignupScreen;

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
    textAlign: "center",
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
  sectionBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 6,
  },

  /* ROLE SELECTION CHIPS */
  roleRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  roleCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFEEE9",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#D3D0C6",
    borderRightColor: "#D3D0C6",
    borderWidth: 1.5,
    shadowColor: "#1E293B",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  roleCardActive: {
    borderColor: "#FDB022",
    borderTopColor: "#FDB022",
    borderLeftColor: "#FDB022",
    borderBottomColor: "#FDB022",
    borderRightColor: "#FDB022",
    borderWidth: 2,
    shadowColor: "#FDB022",
    shadowOpacity: 0.2,
    elevation: 4,
  },
  roleIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E3DC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  roleIconCircleActive: {
    backgroundColor: "#FEF3C7",
  },
  roleTextWrap: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#2D3748",
  },
  roleTitleActive: {
    color: "#D97706",
  },
  roleSubtitle: {
    fontSize: 10,
    color: "#626B78",
    marginTop: 1,
  },

  /* NEUMORPHIC INSET INPUTS */
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
  neuInsetInputDisabled: {
    opacity: 0.6,
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
  helperText: {
    fontSize: 11.5,
    color: "#10B981",
    marginTop: -9,
    marginBottom: 12,
    marginLeft: 2,
    fontWeight: "500",
  },

  /* DROPDOWN FIELD */
  dropdownFieldWrapper: {
    width: "100%",
  },
  dropdownSelectedText: {
    flex: 1,
    fontSize: 14.5,
    color: "#2D3748",
    marginLeft: 8,
  },
  dropdownValueText: {
    flex: 1,
    fontSize: 14.5,
    color: "#2D3748",
    marginLeft: 8,
  },
  placeholderText: {
    color: "#94A3B8",
  },
  dropdownPlaceholderText: {
    color: "#94A3B8",
  },
  disabledText: {
    color: "#A0AEC0",
  },

  /* MODAL PICKER */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#EFEEE9",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    maxHeight: "80%",
    minHeight: "50%",
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 20,
  },
  modalSheet: {
    backgroundColor: "#EFEEE9",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    maxHeight: "75%",
    borderTopColor: "#FFFFFF",
    borderWidth: 1.5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2DFD6",
  },
  modalSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3748",
  },
  modalSheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3748",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#626B78",
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E3DC",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E3DC",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
    borderTopColor: "#D0CDC4",
    borderLeftColor: "#D0CDC4",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
    borderWidth: 1.5,
  },
  modalSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E3DC",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
    borderTopColor: "#D0CDC4",
    borderLeftColor: "#D0CDC4",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
    borderWidth: 1.5,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: "#2D3748",
    marginLeft: 8,
    paddingVertical: 0,
  },
  modalListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2DFD6",
    backgroundColor: "#EFEEE9",
  },
  modalListItemActive: {
    backgroundColor: "#E2DFD6",
  },
  modalListItemText: {
    fontSize: 14.5,
    color: "#2D3748",
    fontWeight: "500",
  },
  modalListItemTextActive: {
    color: "#D97706",
    fontWeight: "700",
  },
  modalEmptyBox: {
    alignItems: "center",
    paddingVertical: 32,
  },
  modalEmptyText: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 8,
  },

  /* PRIMARY BUTTON */
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
    marginTop: 6,
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
