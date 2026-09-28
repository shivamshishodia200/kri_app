import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';

// Buyer / Common Screens
import { SearchListingsScreen } from '../screens/buyer/SearchListingsScreen';
import { PropertyDetailScreen } from '../screens/buyer/PropertyDetailScreen';
import { ShortlistedScreen } from '../screens/buyer/ShortlistedScreen';

// Owner Screens
import { MyPropertiesScreen } from '../screens/owner/MyPropertiesScreen';
import { AddEditPropertyScreen } from '../screens/owner/AddEditPropertyScreen';
import { PropertyInquiriesScreen } from '../screens/owner/PropertyInquiriesScreen';

// Services & Transactions
import { ServicesCatalogScreen } from '../screens/services/ServicesCatalogScreen';
import { BookingConfirmationScreen } from '../screens/services/BookingConfirmationScreen';
import { MyBookingsScreen } from '../screens/services/MyBookingsScreen';
import { PayRentScreen } from '../screens/services/PayRentScreen';
import { PayBillsScreen } from '../screens/services/PayBillsScreen';
import { SubscriptionScreen } from '../screens/services/SubscriptionScreen';


// Communication
import { ChatListScreen } from '../screens/communication/ChatListScreen';
import { ChatDetailScreen } from '../screens/communication/ChatDetailScreen';
import { NotificationListScreen } from '../screens/communication/NotificationListScreen';

// Profile & Settings
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { PrivacySecurityScreen } from '../screens/profile/PrivacySecurityScreen';
import { HelpFaqScreen } from '../screens/profile/HelpFaqScreen';
import { AboutScreen } from '../screens/profile/AboutScreen';
import { ContactUsScreen } from '../screens/profile/ContactUsScreen';
import { ReferralScreen } from '../screens/profile/ReferralScreen';
import { TermsAndConditionsScreen } from '../screens/auth/TermsAndConditionsScreen';
import { PrivacyPolicyScreen } from '../screens/auth/PrivacyPolicyScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />

          {/* Buyer / Common Stacks */}
          <Stack.Screen name="SearchListings" component={SearchListingsScreen} />
          <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
          <Stack.Screen name="Shortlisted" component={ShortlistedScreen} />

          {/* Owner Stacks */}
          <Stack.Screen name="MyProperties" component={MyPropertiesScreen} />
          <Stack.Screen name="AddEditProperty" component={AddEditPropertyScreen} />
          <Stack.Screen name="PropertyInquiries" component={PropertyInquiriesScreen} />

          {/* Services & Payments */}
          <Stack.Screen name="ServicesCatalog" component={ServicesCatalogScreen} />
          <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
          <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
          <Stack.Screen name="PayRent" component={PayRentScreen} />
          <Stack.Screen name="PayBills" component={PayBillsScreen} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />


          {/* Communication */}
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
          <Stack.Screen name="NotificationList" component={NotificationListScreen} />

          {/* Profile & Settings */}
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
          <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="HelpFaq" component={HelpFaqScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="ContactUs" component={ContactUsScreen} />
          <Stack.Screen name="Referral" component={ReferralScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

