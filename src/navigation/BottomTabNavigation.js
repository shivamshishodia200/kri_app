/**
 * BottomTabNavigation.js
 * Redesigned Compact Floating Pill Neumorphic Bottom Navigation Bar
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  Animated,
  DeviceEventEmitter,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";

import DynamicHomeScreen from "../screens/DynamicHomeScreen";
import ChatListScreen from "../screens/ChatListScreen";
import SavedScreen from "../screens/SavedScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { getUserChats } from "../services/chatApi";

const Tab = createBottomTabNavigator();

const COLORS = {
  primary: "#FDB022",
  primaryDark: "#D97706",
  primaryText: "#854D0E",
  activePillBg: "#FFF1D6",
  inactiveText: "#4A5568",
  inactiveIcon: "#2D3748",
  barBg: "#EFEEE9",
  white: "#FFFFFF",
  borderHighlight: "#FFFFFF",
  borderShadow: "#D8D5CB",
  badgeBg: "#FDB022",
};

// Animated Single Tab Item
const TabItem = ({
  route,
  isFocused,
  options,
  onPress,
  unreadCount,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1.03 : 1,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [isFocused, scaleAnim]);

  // Icon mapping
  let iconName = "home-outline";
  if (route.name === "Home") {
    iconName = isFocused ? "home" : "home-outline";
  } else if (route.name === "Shortlisted") {
    iconName = isFocused ? "heart" : "heart-outline";
  } else if (route.name === "Chat") {
    iconName = isFocused ? "chatbubble" : "chatbubble-outline";
  } else if (route.name === "Profile") {
    iconName = isFocused ? "person" : "person-outline";
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.tabItemTouchable}
      activeOpacity={0.8}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={route.name}
    >
      <Animated.View
        style={[
          styles.tabContentWrapper,
          isFocused && styles.activeTabPill,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Icon with optional Badge */}
        <View style={styles.iconContainer}>
          <Icon
            name={iconName}
            size={isFocused ? 20 : 19}
            color={isFocused ? COLORS.primary : COLORS.inactiveIcon}
          />
          {route.name === "Chat" && unreadCount > 0 && (
            <View style={styles.badgeCircle}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>

        {/* Label */}
        <Text
          style={[
            styles.tabLabel,
            isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}
          numberOfLines={1}
        >
          {route.name}
        </Text>

        {/* Active Amber Indicator Underneath Label */}
        {isFocused && <View style={styles.activeIndicatorLine} />}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Custom Floating Pill Tab Bar
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Fetch real unread chats
  const fetchUnreadCount = async () => {
    try {
      const res = await getUserChats();
      if (res && res.success && Array.isArray(res.chats)) {
        const total = res.chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
        setUnreadChatCount(total);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchUnreadCount();
    const sub = DeviceEventEmitter.addListener("chatMessageSent", fetchUnreadCount);
    const sub2 = DeviceEventEmitter.addListener("chatListUpdated", fetchUnreadCount);
    return () => {
      sub.remove();
      sub2.remove();
    };
  }, []);

  const bottomMargin = insets.bottom > 0 ? Math.max(insets.bottom - 6, 6) : Platform.OS === "ios" ? 8 : 6;

  return (
    <View style={[styles.tabBarWrapper, { bottom: bottomMargin }]} pointerEvents="box-none">
      <View style={styles.pillContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              options={options}
              onPress={onPress}
              unreadCount={unreadChatCount}
            />
          );
        })}
      </View>
    </View>
  );
};

// Main Tab Navigator
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        lazy: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={DynamicHomeScreen}
        options={{ tabBarIconName: "home-outline" }}
      />
      <Tab.Screen
        name="Shortlisted"
        component={SavedScreen}
        options={{ tabBarIconName: "heart-outline" }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatListScreen}
        options={{ tabBarIconName: "chatbox-outline" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIconName: "person-outline" }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "absolute",
    left: 14,
    right: 14,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  pillContainer: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: COLORS.barBg,
    borderRadius: 30,
    paddingVertical: 3,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderTopColor: COLORS.borderHighlight,
    borderLeftColor: COLORS.borderHighlight,
    borderBottomColor: COLORS.borderShadow,
    borderRightColor: COLORS.borderShadow,
    elevation: 6,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  tabItemTouchable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  tabContentWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 22,
    width: "100%",
  },
  activeTabPill: {
    backgroundColor: COLORS.activePillBg,
    borderWidth: 1,
    borderColor: "rgba(253, 176, 34, 0.4)",
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
  badgeCircle: {
    position: "absolute",
    top: -3,
    right: -7,
    backgroundColor: COLORS.badgeBg,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    borderWidth: 1.2,
    borderColor: "#FFFFFF",
    elevation: 2,
  },
  badgeText: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 0.5,
  },
  tabLabelActive: {
    fontWeight: "800",
    color: COLORS.primaryText,
  },
  tabLabelInactive: {
    fontWeight: "600",
    color: COLORS.inactiveText,
  },
  activeIndicatorLine: {
    width: 14,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: COLORS.primary,
    marginTop: 1.5,
  },
});

export default BottomTabNavigator;
