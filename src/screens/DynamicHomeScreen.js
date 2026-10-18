import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './HomeScreen';
import HomeScreenOwner from './HomeScreenOwner';

const DynamicHomeScreen = ({ navigation }) => {
  const [userRole, setUserRole] = useState(null);

  const getUserRole = useCallback(async () => {
    try {
      const storedRole = await AsyncStorage.getItem('userRole');
      if (storedRole) {
        setUserRole(storedRole);
        return;
      }
      const rawUserData = (await AsyncStorage.getItem('userData')) || (await AsyncStorage.getItem('user_data'));
      if (rawUserData) {
        const user = JSON.parse(rawUserData);
        const role = user.role || user.userType;
        if (role) setUserRole(role);
      }
    } catch (error) {
      console.error('Error getting user role:', error);
    }
  }, []);

  useEffect(() => {
    getUserRole();
    const unsubscribe = navigation.addListener('focus', getUserRole);
    return unsubscribe;
  }, [navigation, getUserRole]);

  if (userRole === 'Owner' || userRole === 'owner') {
    return <HomeScreenOwner navigation={navigation} />;
  }

  return <HomeScreen navigation={navigation} />;
};

export default DynamicHomeScreen;