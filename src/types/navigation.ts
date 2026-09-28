import { NavigatorScreenParams } from '@react-navigation/native';
import { Property, PropertyFilter } from './property';
import { ServiceItem } from './booking';

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: { defaultRole?: 'buyer' | 'owner' } | undefined;
  ForgotPassword: undefined;
  OtpVerification: {
    phoneOrEmail: string;
    mode: 'signup' | 'reset';
    role?: 'buyer' | 'owner';
    name?: string;
  };
  TermsAndConditions: undefined;
  PrivacyPolicy: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  ShortlistedTab: undefined;
  ChatTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;

  // Buyer/Common Stacks
  SearchListings: { initialFilter?: Partial<PropertyFilter>; focusSearch?: boolean } | undefined;
  PropertyDetail: { propertyId: string; property?: Property };
  Shortlisted: undefined;

  // Owner Stacks
  MyProperties: { filterStatus?: string } | undefined;
  AddEditProperty: { propertyId?: string; isEditing?: boolean } | undefined;
  PropertyInquiries: { propertyId?: string } | undefined;

  // Services & Payments
  ServicesCatalog: { selectedCategory?: string } | undefined;
  BookService: { service: ServiceItem };
  BookingConfirmation: { bookingId: string };
  MyBookings: undefined;
  PayRent: { propertyId?: string } | undefined;
  PayBills: undefined;
  Subscription: undefined;


  // Communication
  ChatList: undefined;
  ChatDetail: { threadId: string; title?: string; participantName?: string };
  NotificationList: undefined;

  // Profile & Settings
  EditProfile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
  PrivacySecurity: undefined;
  TermsAndConditions: undefined;
  PrivacyPolicy: undefined;
  HelpFaq: undefined;
  About: undefined;
  ContactUs: undefined;
  Referral: undefined;
};

