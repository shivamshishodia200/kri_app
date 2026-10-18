/**
 * HomeScreenOwner.js
 * Redesigned Owner Home Screen matching the visual reference image
 * Neumorphic UI with Photo-First Rental Carousel and Horizontal Featured Cards
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
  KeyboardAvoidingView,
  Keyboard,
  Linking,
  useWindowDimensions,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";

// Services & Helpers
import {
  getRecentProperties,
  getResidentialProperties,
  getCommercialProperties,
} from "../services/propertyService";
import { propertyService } from "../services/propertyapi";
import { getNotificationCount } from "../utils/notificationManager";
import { fetchAndProcessNotifications } from "../services/backgroundNotificationService";
import { getCurrentUserProfile } from "../services/userapi";
import { IMAGE_BASE_URL } from "../config/api.config";
import { useSubscription } from "../context/SubscriptionContext";

// Components
import DrawerMenu from "../components/DrawerMenu";
import SubscriptionModal from "../components/SubscriptionModal";

// --- Theme Tokens ---
const COLORS = {
  primary: "#FDB022",
  primaryDark: "#D97706",
  primaryLight: "#FFF8EB",
  background: "#EFEEE9",
  cardBg: "#EFEEE9",
  white: "#FFFFFF",
  textDark: "#2D3748",
  textMuted: "#626B78",
  borderHighlight: "#FFFFFF",
  borderShadow: "#D8D5CB",
  inputBg: "#E5E3DC",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  badgeYellow: "#FDB022",
};

const FALLBACK_IMAGE_URI =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=center";

// Sample properties fallback to ensure UI looks complete and matches screenshot exactly
const SAMPLE_PROPERTIES = [
  {
    _id: "sample_1",
    title: "3 BHK Apartment",
    description: "3 BHK Luxury Apartment with Balcony",
    propertyLocation: "Sector 75, Noida",
    price: 24000,
    bedrooms: 3,
    bathrooms: 2,
    area: "1,450",
    propertyType: "Apartment",
    photos: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"],
  },
  {
    _id: "sample_2",
    title: "2 BHK Apartment",
    description: "2 BHK Furnished Modern Apartment",
    propertyLocation: "Greater Noida",
    price: 18000,
    bedrooms: 2,
    bathrooms: 2,
    area: "1,150",
    propertyType: "Apartment",
    photos: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"],
  },
  {
    _id: "sample_3",
    title: "4 BHK Villa",
    description: "4 BHK Luxury Villa with Private Pool",
    propertyLocation: "Greater Noida",
    price: 12500000,
    bedrooms: 4,
    bathrooms: 4,
    area: "3,200",
    propertyType: "Villa",
    photos: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800"],
  },
  {
    _id: "sample_4",
    title: "Office Space",
    description: "Modern Commercial Office Space",
    propertyLocation: "Sector 62, Noida",
    price: 65000,
    bedrooms: null,
    bathrooms: null,
    area: "2,500",
    propertyType: "Commercial",
    photos: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"],
  },
];

const formatImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const baseUrl = IMAGE_BASE_URL || "https://backend.kirayedar24.com";
  if (url.startsWith("uploads/")) return `${baseUrl}/${url}`;
  return url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
};

const formatPrice = (price) => {
  if (!price && price !== 0) return "₹ N/A";
  if (typeof price === "number") {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString("en-IN")}`;
  }
  return `₹ ${price}`;
};

const getDisplayLocation = (property) => {
  if (!property) return "Greater Noida";
  if (property.address && typeof property.address === "object") {
    const { locality, city, district } = property.address;
    const parts = [locality, city || district].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
  }
  if (property.locality || property.city) {
    return [property.locality, property.city].filter(Boolean).join(", ");
  }
  if (property.propertyLocation) return property.propertyLocation;
  if (property.location) {
    if (typeof property.location === "string") return property.location;
    if (typeof property.location === "object") {
      return [property.location.locality, property.location.city].filter(Boolean).join(", ") || "Greater Noida";
    }
  }
  return "Greater Noida";
};

const getFirstImageUrl = (photosAndVideo) => {
  if (!photosAndVideo || photosAndVideo.length === 0) return null;
  const firstImage = photosAndVideo.find((media) => {
    const mediaPath = media?.uri || media;
    return (
      typeof mediaPath === "string" &&
      (mediaPath.includes(".jpg") ||
        mediaPath.includes(".jpeg") ||
        mediaPath.includes(".png") ||
        mediaPath.includes(".webp") ||
        mediaPath.includes(".gif"))
    );
  });
  if (firstImage) return firstImage.uri || firstImage;
  return photosAndVideo[0]?.uri || photosAndVideo[0];
};

const getPropertySpecs = (property) => {
  let beds = property.bedrooms || property.bhk || null;
  let baths = property.bathrooms || property.baths || null;
  let area = property.area || property.carpetArea || property.superBuiltUpArea || property.size || null;

  const title = (property.title || property.description || "").toLowerCase();
  if (!beds) {
    if (title.includes("1 bhk") || title.includes("1 bed")) beds = 1;
    else if (title.includes("2 bhk") || title.includes("2 bed")) beds = 2;
    else if (title.includes("3 bhk") || title.includes("3 bed")) beds = 3;
    else if (title.includes("4 bhk") || title.includes("4 bed")) beds = 4;
  }
  if (!baths && beds) {
    baths = Math.max(1, beds - 1);
  }

  const isCommercial =
    (property.propertyType || property.mainCategory || "").toLowerCase() === "commercial" ||
    title.includes("office") ||
    title.includes("shop") ||
    title.includes("commercial");

  return {
    beds: beds ? `${beds} Beds` : isCommercial ? "Workstations" : null,
    baths: baths ? `${baths} Baths` : null,
    area: area ? `${area} sq ft` : null,
    isCommercial,
  };
};

const HomeScreenOwner = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const { userHasPackage, setPropertyForSubscription, loadActiveSubscription } = useSubscription();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // User Profile & Location
  const [userName, setUserName] = useState("Shivam");
  const [userLocation, setUserLocation] = useState("Greater Noida");

  // State Management
  const [favorites, setFavorites] = useState([]);
  const [loadingSaveProperty, setLoadingSaveProperty] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeRentalFilter, setActiveRentalFilter] = useState("Apartments");

  // Banner auto-scroll state
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef(null);
  const bannerWidth = Math.max(width - 32, 280);

  const BANNER_SLIDES = useMemo(() => [
    {
      id: "1",
      title: "Find a place\nto call home",
      btnText: "Explore",
      image: require("../assets/auth_header_villa.jpg"),
      screen: "AllPropertiesScreen",
    },
    {
      id: "2",
      title: "Post your property\nfor zero brokerage",
      btnText: "Post Free",
      image: require("../assets/banner3.png"),
      screen: "AddSell",
    },
    {
      id: "3",
      title: "Pay Rent on time &\nearn cashbacks",
      btnText: "Pay Rent",
      image: require("../assets/banner1.jpeg"),
      screen: "PayRentScreen",
    },
  ], []);

  // Safe Auto-scroll timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % BANNER_SLIDES.length;
        try {
          bannerScrollRef.current?.scrollToOffset({
            offset: nextIndex * bannerWidth,
            animated: true,
          });
        } catch (e) {}
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [BANNER_SLIDES, bannerWidth]);

  const handleBannerScroll = (event) => {
    try {
      const slideSize = event.nativeEvent.layoutMeasurement.width;
      const offset = event.nativeEvent.contentOffset.x;
      if (slideSize > 0) {
        const index = Math.round(offset / slideSize);
        if (index >= 0 && index < BANNER_SLIDES.length && index !== currentBannerIndex) {
          setCurrentBannerIndex(index);
        }
      }
    } catch (e) {}
  };

  // API Data States
  const [recentProperties, setRecentProperties] = useState([]);
  const [residentialProperties, setResidentialProperties] = useState([]);
  const [commercialProperties, setCommercialProperties] = useState([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);

  // UI States
  const [notificationCount, setNotificationCount] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const rentalCardWidth = Math.min(width * 0.72, 290);

  // Load User Profile
  const loadUserProfile = useCallback(async () => {
    try {
      const response = await getCurrentUserProfile();
      if (response && response.success && response.user) {
        const full = response.user.fullName || response.user.name || "";
        const firstName = full.split(" ")[0];
        if (firstName) setUserName(firstName);
        if (response.user.city) setUserLocation(response.user.city);
      } else {
        const stored = await AsyncStorage.getItem("userData");
        if (stored) {
          const u = JSON.parse(stored);
          const full = u.fullName || u.name || "";
          const firstName = full.split(" ")[0];
          if (firstName) setUserName(firstName);
          if (u.city) setUserLocation(u.city);
        }
      }
    } catch (e) {
      console.log("Could not load user name for greeting:", e);
    }
  }, []);

  // Load properties from API
  const loadProperties = useCallback(async () => {
    setIsLoadingProperties(true);
    try {
      const [recentRes, resRes, comRes] = await Promise.allSettled([
        getRecentProperties(),
        getResidentialProperties(),
        getCommercialProperties(),
      ]);

      if (recentRes.status === "fulfilled" && recentRes.value && recentRes.value.success) {
        const data = recentRes.value.data || recentRes.value.properties || [];
        const approved = data.filter(
          (p) => p && (p.status === "approved" || p.approvalStatus === "Approved" || !p.status)
        );
        setRecentProperties(approved);
      }

      if (resRes.status === "fulfilled" && resRes.value && resRes.value.success) {
        const data = resRes.value.data || resRes.value.properties || [];
        const approved = data.filter(
          (p) => p && (p.status === "approved" || p.approvalStatus === "Approved" || !p.status)
        );
        setResidentialProperties(approved);
      }

      if (comRes.status === "fulfilled" && comRes.value && comRes.value.success) {
        const data = comRes.value.data || comRes.value.properties || [];
        const approved = data.filter(
          (p) => p && (p.status === "approved" || p.approvalStatus === "Approved" || !p.status)
        );
        setCommercialProperties(approved);
      }
    } catch (error) {
      console.error("Error loading properties in HomeScreenOwner:", error);
    } finally {
      setIsLoadingProperties(false);
    }
  }, []);

  // Load saved properties
  const loadSavedProperties = useCallback(async () => {
    try {
      const response = await propertyService.getSavedProperties();
      let list = [];
      if (response && response.savedProperties && Array.isArray(response.savedProperties)) {
        list = response.savedProperties;
      } else if (response && Array.isArray(response.data)) {
        list = response.data;
      } else if (Array.isArray(response)) {
        list = response;
      }
      const savedIds = list.filter(Boolean).map((p) => p._id || p.id).filter(Boolean);
      setFavorites(savedIds);
    } catch (error) {
      console.error("Error loading saved properties:", error);
    }
  }, []);

  // Load notification count
  const loadNotificationCount = useCallback(async () => {
    try {
      const count = await getNotificationCount();
      setNotificationCount(count || 0);
      const res = await fetchAndProcessNotifications(false);
      if (res && typeof res.count === "number") {
        setNotificationCount(res.count);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    loadUserProfile();
    loadProperties();
    loadSavedProperties();
    loadNotificationCount();
    try {
      loadActiveSubscription();
    } catch (e) {}
  }, [loadUserProfile, loadProperties, loadSavedProperties, loadNotificationCount, loadActiveSubscription]);

  // Listen for savedList updates
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("savedListUpdated", (payload) => {
      if (payload && payload.propertyId) {
        if (payload.action === "removed" || payload.isSaved === false) {
          setFavorites((prev) => prev.filter((id) => id !== payload.propertyId));
        } else if (payload.action === "added" || payload.isSaved === true) {
          setFavorites((prev) => [...prev, payload.propertyId]);
        }
      } else {
        loadSavedProperties();
      }
    });
    return () => sub.remove();
  }, [loadSavedProperties]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([loadProperties(), loadSavedProperties(), loadUserProfile()]);
    setIsRefreshing(false);
  }, [loadProperties, loadSavedProperties, loadUserProfile]);

  const toggleFavorite = async (propertyId) => {
    if (!propertyId || loadingSaveProperty === propertyId) return;
    const isCurrentlySaved = favorites.includes(propertyId);
    setLoadingSaveProperty(propertyId);

    try {
      if (isCurrentlySaved) {
        setFavorites((prev) => prev.filter((id) => id !== propertyId));
        await propertyService.removeSavedProperty(propertyId);
        DeviceEventEmitter.emit("savedListUpdated", { propertyId, isSaved: false, action: "removed" });
      } else {
        setFavorites((prev) => [...prev, propertyId]);
        await propertyService.saveProperty(propertyId);
        DeviceEventEmitter.emit("savedListUpdated", { propertyId, isSaved: true, action: "added" });
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      if (isCurrentlySaved) {
        setFavorites((prev) => [...prev, propertyId]);
      } else {
        setFavorites((prev) => prev.filter((id) => id !== propertyId));
      }
    } finally {
      setLoadingSaveProperty(null);
    }
  };

  const openProperty = (item) => {
    navigation.navigate("PropertyDetailsScreen", {
      propertyId: item._id || item.id,
      property: item,
    });
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigation.navigate("Services", { query: searchQuery.trim() });
      Keyboard.dismiss();
    }
  };

  // Merge loaded properties with sample fallback
  const allPropertiesList = useMemo(() => {
    const raw = recentProperties.length > 0 ? recentProperties : residentialProperties;
    if (raw.length > 0) return raw;
    return SAMPLE_PROPERTIES;
  }, [recentProperties, residentialProperties]);

  const filteredRentalProperties = useMemo(() => {
    if (activeRentalFilter === "All") return allPropertiesList;
    if (activeRentalFilter === "Apartments") {
      const filtered = allPropertiesList.filter((p) => {
        const str = ((p.title || "") + " " + (p.description || "") + " " + (p.propertyType || "")).toLowerCase();
        return str.includes("apartment") || str.includes("bhk") || str.includes("flat") || str.includes("residential");
      });
      return filtered.length > 0 ? filtered : allPropertiesList;
    }
    if (activeRentalFilter === "Villas") {
      const filtered = allPropertiesList.filter((p) => {
        const str = ((p.title || "") + " " + (p.description || "") + " " + (p.propertyType || "")).toLowerCase();
        return str.includes("villa") || str.includes("house") || str.includes("bungalow") || str.includes("independent");
      });
      return filtered.length > 0 ? filtered : allPropertiesList;
    }
    if (activeRentalFilter === "Commercial") {
      const filtered = commercialProperties.length > 0
        ? commercialProperties
        : allPropertiesList.filter((p) => {
            const str = ((p.title || "") + " " + (p.description || "") + " " + (p.propertyType || "")).toLowerCase();
            return str.includes("commercial") || str.includes("office") || str.includes("shop");
          });
      return filtered.length > 0 ? filtered : allPropertiesList;
    }
    return allPropertiesList;
  }, [allPropertiesList, commercialProperties, activeRentalFilter]);

  const featuredList = useMemo(() => {
    if (residentialProperties.length > 0) return residentialProperties;
    return SAMPLE_PROPERTIES;
  }, [residentialProperties]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} translucent={false} />

      {/* Top Header */}
      <View style={styles.headerRow}>
        {/* Hamburger Menu */}
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => setDrawerVisible(true)}
          activeOpacity={0.75}
        >
          <Icon name="menu-outline" size={24} color={COLORS.textDark} />
        </TouchableOpacity>

        {/* Kirayedar24 Logo */}
        <View style={styles.logoWrapper}>
          <Image
            source={require("../assets/Kirayedar_logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Notifications & Chat Buttons */}
        <View style={styles.headerRightGroup}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate("NotificationList")}
            activeOpacity={0.75}
          >
            <Icon name="notifications-outline" size={21} color={COLORS.textDark} />
            {notificationCount > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerIconButton, { marginLeft: 8 }]}
            onPress={() => navigation.navigate("Chat")}
            activeOpacity={0.75}
          >
            <Icon name="chatbubble-ellipses-outline" size={20} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Greeting & Location Row */}
          <View style={styles.greetingSection}>
            <Text style={styles.greetingTitle}>Hello, {userName}</Text>
            <TouchableOpacity
              style={styles.locationSelector}
              onPress={() => navigation.navigate("AllPropertiesScreen")}
              activeOpacity={0.75}
            >
              <Icon name="location-sharp" size={15} color={COLORS.textDark} style={{ marginRight: 4 }} />
              <Text style={styles.locationText}>{userLocation}</Text>
              <Icon name="chevron-down" size={14} color={COLORS.textDark} style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          </View>

          {/* Inset Search Field */}
          <View style={styles.searchBarContainer}>
            <Icon name="search-outline" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search location or property"
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.filterIconButton}
              onPress={() => navigation.navigate("AllPropertiesScreen")}
              activeOpacity={0.7}
            >
              <Icon name="options-outline" size={19} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          {/* Quick Actions (Add Property, Pay Bill, Pay Rent) */}
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("AddSell")}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconCircle}>
                <Icon name="add" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Add Property</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("PayBillScreen")}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconCircle}>
                <Icon name="document-text" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Pay Bill</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("PayRentScreen")}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconCircle}>
                <Icon name="wallet" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.actionLabel}>Pay Rent</Text>
            </TouchableOpacity>
          </View>

          {/* Hero Banner: Auto-scrollable with Dots */}
          <View style={styles.bannerWrapper}>
            <FlatList
              ref={bannerScrollRef}
              data={BANNER_SLIDES}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              onMomentumScrollEnd={handleBannerScroll}
              getItemLayout={(data, index) => ({
                length: bannerWidth,
                offset: bannerWidth * index,
                index,
              })}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.heroBannerCard, { width: bannerWidth }]}
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={item.image}
                    style={styles.heroBannerBgImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["rgba(239, 238, 233, 0.95)", "rgba(239, 238, 233, 0.8)", "rgba(239, 238, 233, 0.15)"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.heroBannerGradient}
                  >
                    <View style={styles.heroBannerContent}>
                      <Text style={styles.heroBannerTitle}>{item.title}</Text>
                      <View style={styles.heroExploreButton}>
                        <Text style={styles.heroExploreText}>{item.btnText}</Text>
                        <Icon name="arrow-forward" size={14} color="#1E293B" style={{ marginLeft: 4 }} />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            />

            {/* Banner Dot Indicators */}
            <View style={styles.bannerDotsContainer}>
              {BANNER_SLIDES.map((_, idx) => (
                <View
                  key={`dot_${idx}`}
                  style={[
                    styles.bannerDot,
                    currentBannerIndex === idx && styles.bannerDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Section: Rental Properties (Photo-First Carousel) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rental Properties</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AllPropertiesScreen", { category: "Rental" })}
              activeOpacity={0.8}
            >
              <Text style={styles.seeAllText}>See all →</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Chips */}
          <View style={styles.filterChipsRow}>
            {["Apartments", "Villas", "Commercial", "All"].map((chip) => {
              const isSelected = activeRentalFilter === chip;
              return (
                <TouchableOpacity
                  key={chip}
                  style={[styles.chipButton, isSelected && styles.chipButtonActive]}
                  onPress={() => setActiveRentalFilter(chip)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {chip}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Photo-First Horizontal Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            snapToInterval={rentalCardWidth + 14}
            decelerationRate="fast"
          >
            {filteredRentalProperties.slice(0, 10).map((item, index) => {
              const photos = item.photos || item.photosAndVideo || item.images || [];
              const first = getFirstImageUrl(photos);
              const imageUrl = formatImageUrl(first) || FALLBACK_IMAGE_URI;
              const isSaved = favorites.includes(item._id || item.id);
              const specs = getPropertySpecs(item);

              return (
                <TouchableOpacity
                  key={`rental_${item._id || index}`}
                  style={[styles.rentalCard, { width: rentalCardWidth }]}
                  onPress={() => openProperty(item)}
                  activeOpacity={0.9}
                >
                  {/* Top Image */}
                  <View style={styles.rentalImageWrapper}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.rentalImage}
                      defaultSource={{ uri: FALLBACK_IMAGE_URI }}
                      resizeMode="cover"
                    />
                    {/* FOR RENT Badge */}
                    <View style={styles.forRentBadge}>
                      <Text style={styles.forRentBadgeText}>FOR RENT</Text>
                    </View>

                    {/* Favorite Heart Button */}
                    <TouchableOpacity
                      style={styles.rentalHeartBtn}
                      onPress={() => toggleFavorite(item._id || item.id)}
                      activeOpacity={0.7}
                      disabled={loadingSaveProperty === (item._id || item.id)}
                    >
                      {loadingSaveProperty === (item._id || item.id) ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Icon
                          name={isSaved ? "heart" : "heart-outline"}
                          size={18}
                          color={isSaved ? COLORS.danger : "#FFFFFF"}
                        />
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Property Details Below Image */}
                  <View style={styles.rentalDetails}>
                    <Text style={styles.rentalTitle} numberOfLines={1}>
                      {item.title || item.description || "Apartment / Home"}
                    </Text>

                    <View style={styles.locationRow}>
                      <Icon name="location-sharp" size={12} color={COLORS.textMuted} style={{ marginRight: 3 }} />
                      <Text style={styles.locationSubText} numberOfLines={1}>
                        {getDisplayLocation(item)}
                      </Text>
                    </View>

                    {/* Price Row */}
                    <View style={styles.rentalPriceRow}>
                      <Text style={styles.rentalPriceText}>
                        {formatPrice(item.price || item.rentPrice || 24000)}
                      </Text>
                      <Text style={styles.rentalPerMonthText}> / month</Text>
                    </View>

                    {/* Specs Row (Beds, Baths, Sq ft) */}
                    <View style={styles.specsRow}>
                      {specs.beds ? (
                        <View style={styles.specItem}>
                          <Icon name="bed-outline" size={13} color={COLORS.textMuted} style={{ marginRight: 3 }} />
                          <Text style={styles.specText}>{specs.beds}</Text>
                        </View>
                      ) : null}

                      {specs.baths ? (
                        <>
                          <Text style={styles.specDot}>•</Text>
                          <View style={styles.specItem}>
                            <Icon name="water-outline" size={13} color={COLORS.textMuted} style={{ marginRight: 3 }} />
                            <Text style={styles.specText}>{specs.baths}</Text>
                          </View>
                        </>
                      ) : null}

                      {specs.area ? (
                        <>
                          <Text style={styles.specDot}>•</Text>
                          <View style={styles.specItem}>
                            <Icon name="scan-outline" size={12} color={COLORS.textMuted} style={{ marginRight: 3 }} />
                            <Text style={styles.specText}>{specs.area}</Text>
                          </View>
                        </>
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Section: Featured Properties (Horizontal Row Cards) */}
          <View style={[styles.sectionHeader, { marginTop: 22 }]}>
            <Text style={styles.sectionTitle}>Featured Properties</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AllPropertiesScreen", { category: "Featured" })}
              activeOpacity={0.8}
            >
              <Text style={styles.seeAllText}>See all →</Text>
            </TouchableOpacity>
          </View>

          {/* Vertically Stacked Horizontal Row Cards */}
          <View style={styles.featuredRowsContainer}>
            {featuredList.slice(0, 6).map((item, index) => {
              const photos = item.photos || item.photosAndVideo || item.images || [];
              const first = getFirstImageUrl(photos);
              const imageUrl = formatImageUrl(first) || FALLBACK_IMAGE_URI;
              const isSaved = favorites.includes(item._id || item.id);
              const specs = getPropertySpecs(item);

              return (
                <TouchableOpacity
                  key={`featured_${item._id || index}`}
                  style={styles.featuredRowCard}
                  onPress={() => openProperty(item)}
                  activeOpacity={0.9}
                >
                  {/* Photo on LEFT */}
                  <View style={styles.featuredThumbnailWrapper}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.featuredThumbnail}
                      defaultSource={{ uri: FALLBACK_IMAGE_URI }}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Details on RIGHT */}
                  <View style={styles.featuredRightDetails}>
                    <View style={styles.featuredTopRow}>
                      <Text style={styles.featuredRowTitle} numberOfLines={1}>
                        {item.title || item.description || "Property"}
                      </Text>

                      {/* Heart Icon Top Right */}
                      <TouchableOpacity
                        style={styles.featuredHeartBtn}
                        onPress={() => toggleFavorite(item._id || item.id)}
                        activeOpacity={0.7}
                        disabled={loadingSaveProperty === (item._id || item.id)}
                      >
                        <Icon
                          name={isSaved ? "heart" : "heart-outline"}
                          size={18}
                          color={isSaved ? COLORS.danger : COLORS.textMuted}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.locationRow}>
                      <Icon name="location-sharp" size={11} color={COLORS.textMuted} style={{ marginRight: 2 }} />
                      <Text style={styles.locationSubText} numberOfLines={1}>
                        {getDisplayLocation(item)}
                      </Text>
                    </View>

                    {/* Price */}
                    <Text style={styles.featuredRowPrice}>
                      {formatPrice(item.price || 35000)}
                    </Text>

                    {/* Specs Row */}
                    <View style={styles.specsRow}>
                      {specs.beds ? (
                        <View style={styles.specItem}>
                          <Icon name="bed-outline" size={12} color={COLORS.textMuted} style={{ marginRight: 2 }} />
                          <Text style={styles.specText}>{specs.beds}</Text>
                        </View>
                      ) : null}

                      {specs.baths ? (
                        <>
                          <Text style={styles.specDot}>•</Text>
                          <View style={styles.specItem}>
                            <Icon name="water-outline" size={12} color={COLORS.textMuted} style={{ marginRight: 2 }} />
                            <Text style={styles.specText}>{specs.baths}</Text>
                          </View>
                        </>
                      ) : null}

                      {specs.area ? (
                        <>
                          <Text style={styles.specDot}>•</Text>
                          <View style={styles.specItem}>
                            <Icon name="scan-outline" size={11} color={COLORS.textMuted} style={{ marginRight: 2 }} />
                            <Text style={styles.specText}>{specs.area}</Text>
                          </View>
                        </>
                      ) : null}
                    </View>

                    {/* View Details Link */}
                    <TouchableOpacity
                      style={styles.viewDetailsRow}
                      onPress={() => openProperty(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.viewDetailsLink}>View details →</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Drawer Menu Modal */}
      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onLogout={() => {
          setDrawerVisible(false);
          AsyncStorage.multiRemove(["authToken", "userId", "userData", "userRole"]);
          navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
        }}
        navigation={navigation}
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSuccess={() => {
          setShowSubscriptionModal(false);
          loadActiveSubscription();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Header Row
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderTopColor: COLORS.borderHighlight,
    borderLeftColor: COLORS.borderHighlight,
    borderBottomColor: COLORS.borderShadow,
    borderRightColor: COLORS.borderShadow,
    elevation: 2,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  logoWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  logoImage: {
    width: 140,
    height: 38,
  },
  headerRightGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.badgeYellow,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },

  // Greeting Section
  greetingSection: {
    marginTop: 6,
    marginBottom: 12,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textDark,
    letterSpacing: -0.4,
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textDark,
  },

  // Inset Search Field
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopColor: "#D0CDC4",
    borderLeftColor: "#D0CDC4",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: "500",
    padding: 0,
  },
  filterIconButton: {
    padding: 4,
    marginLeft: 6,
  },

  // Quick Actions (3 buttons in a row)
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderTopColor: COLORS.borderHighlight,
    borderLeftColor: COLORS.borderHighlight,
    borderBottomColor: COLORS.borderShadow,
    borderRightColor: COLORS.borderShadow,
    elevation: 2,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    elevation: 2,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textDark,
  },

  // Hero Banner: "Find a place to call home"
  bannerWrapper: {
    marginBottom: 20,
  },
  heroBannerCard: {
    height: 140,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E2E0D8",
    borderWidth: 1.5,
    borderTopColor: COLORS.borderHighlight,
    borderLeftColor: COLORS.borderHighlight,
    borderBottomColor: COLORS.borderShadow,
    borderRightColor: COLORS.borderShadow,
    elevation: 3,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerDotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D0CDC4",
  },
  bannerDotActive: {
    width: 18,
    backgroundColor: COLORS.primary,
  },
  heroBannerBgImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    right: 0,
    top: 0,
  },
  heroBannerGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  heroBannerContent: {
    maxWidth: "60%",
  },
  heroBannerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textDark,
    lineHeight: 22,
    marginBottom: 10,
  },
  heroExploreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    elevation: 2,
  },
  heroExploreText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1E293B",
  },

  // Section Headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textDark,
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },

  // Filter Chips Row
  filterChipsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  chipButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1.5,
    borderTopColor: COLORS.borderHighlight,
    borderLeftColor: COLORS.borderHighlight,
    borderBottomColor: COLORS.borderShadow,
    borderRightColor: COLORS.borderShadow,
  },
  chipButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  chipTextActive: {
    fontWeight: "800",
    color: "#1E293B",
  },

  // Rental Carousel (Photo-First Cards)
  carouselContainer: {
    paddingRight: 16,
    gap: 14,
  },
  rentalCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1.5,
    borderTopColor: COLORS.borderHighlight,
    borderLeftColor: COLORS.borderHighlight,
    borderBottomColor: COLORS.borderShadow,
    borderRightColor: COLORS.borderShadow,
    elevation: 3,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    overflow: "hidden",
  },
  rentalImageWrapper: {
    width: "100%",
    height: 155,
    position: "relative",
    backgroundColor: "#E2E0D8",
  },
  rentalImage: {
    width: "100%",
    height: "100%",
  },
  forRentBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: COLORS.badgeYellow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    elevation: 2,
  },
  forRentBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: 0.3,
  },
  rentalHeartBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  rentalDetails: {
    padding: 12,
  },
  rentalTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textDark,
    marginBottom: 3,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  locationSubText: {
    fontSize: 12,
    color: COLORS.textMuted,
    flex: 1,
  },
  rentalPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 6,
  },
  rentalPriceText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },
  rentalPerMonthText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  specsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 2,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  specText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  specDot: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginHorizontal: 5,
  },

  // Featured Properties (Left-Photo / Right-Details Row Cards)
  featuredRowsContainer: {
    gap: 12,
  },
  featuredRowCard: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    padding: 10,
    borderWidth: 1.5,
    borderTopColor: COLORS.borderHighlight,
    borderLeftColor: COLORS.borderHighlight,
    borderBottomColor: COLORS.borderShadow,
    borderRightColor: COLORS.borderShadow,
    elevation: 2,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  featuredThumbnailWrapper: {
    width: 115,
    height: 95,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#E2E0D8",
  },
  featuredThumbnail: {
    width: "100%",
    height: "100%",
  },
  featuredRightDetails: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "space-between",
  },
  featuredTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  featuredRowTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textDark,
    marginRight: 6,
  },
  featuredHeartBtn: {
    padding: 2,
  },
  featuredRowPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginVertical: 2,
  },
  viewDetailsRow: {
    alignSelf: "flex-start",
    marginTop: 2,
  },
  viewDetailsLink: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
});

export default HomeScreenOwner;
