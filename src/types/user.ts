export type UserRole = 'buyer' | 'owner';

export interface UserLegalConsent {
  termsAccepted: boolean;
  termsVersion: string;
  privacyAccepted: boolean;
  privacyVersion: string;
  acceptedAt: string; // Server-authoritative ISO-8601 timestamp
  marketingOptIn: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: UserRole;
  isVerified: boolean;
  city: string;
  referralCode: string;
  legalConsent?: UserLegalConsent;
  stats?: {
    propertiesListed?: number;
    inquiriesReceived?: number;
    savedProperties?: number;
    activeBookings?: number;
  };
}

