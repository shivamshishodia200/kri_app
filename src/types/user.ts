export type UserRole = 'buyer' | 'owner';

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
  stats?: {
    propertiesListed?: number;
    inquiriesReceived?: number;
    savedProperties?: number;
    activeBookings?: number;
  };
}
