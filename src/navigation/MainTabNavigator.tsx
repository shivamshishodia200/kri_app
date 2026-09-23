import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useProperty } from '../context/PropertyContext';
import { BuyerHomeScreen } from '../screens/buyer/BuyerHomeScreen';
import { OwnerHomeScreen } from '../screens/owner/OwnerHomeScreen';
import { ShortlistedScreen } from '../screens/buyer/ShortlistedScreen';
import { ChatListScreen } from '../screens/communication/ChatListScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { Icon, IconName } from '../components/common/Icon';

const Tab = createBottomTabNavigator<MainTabParamList>();

const HomeTabScreen: React.FC = () => {
  const { role } = useAuth();
  return role === 'owner' ? <OwnerHomeScreen /> : <BuyerHomeScreen />;
};

export const MainTabNavigator: React.FC = () => {
  const { unreadCount: chatUnreadCount } = useChat();
  const { shortlistedIds } = useProperty();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          ...typography.caption,
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: IconName = 'home';
          let badgeCount = 0;

          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'ShortlistedTab') {
            iconName = focused ? 'heart-filled' : 'heart';
            badgeCount = shortlistedIds.length;
          } else if (route.name === 'ChatTab') {
            iconName = 'chat';
            badgeCount = chatUnreadCount;
          } else if (route.name === 'ProfileTab') {
            iconName = 'user';
          }

          return (
            <View style={styles.iconContainer}>
              <Icon
                name={iconName}
                size={22}
                color={focused ? colors.primaryDark : colors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
              />
              {badgeCount > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeTabScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="ShortlistedTab"
        component={ShortlistedScreen}
        options={{ tabBarLabel: 'Shortlisted' }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatListScreen}
        options={{ tabBarLabel: 'Chat' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabBadge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  tabBadgeText: {
    ...typography.badge,
    fontSize: 9,
    color: colors.darkText,
    fontWeight: '800',
  },
});
