export type ListingType = 'rent' | 'buy' | 'sell';
export type PropertyCategory = 'residential' | 'commercial';
export type PropertyType =
  | 'Apartment'
  | 'Villa'
  | 'Independent House'
  | 'Penthouse'
  | 'Studio'
  | 'Room'
  | 'Flat'
  | 'PG'
  | 'Office Space'
  | 'Shop / Showroom'
  | 'Plot / Land'
  | 'Warehouse'
  | 'Commercial Space';

export type FurnishingStatus = 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
export type ListingStatus =
  | 'published'
  | 'under_review'
  | 'draft'
  | 'rejected'
  | 'expired'
  | 'rented_sold';

export type KitchenType = 'Modular' | 'Simple / Standard' | 'Semi-Modular';
export type TenantPreference = 'Family' | 'Bachelors (Boys)' | 'Bachelors (Girls)' | 'Students' | 'Any / All';
export type FoodPreference = 'Vegetarian Only' | 'Any (Veg & Non-Veg)';

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface PropertyOwner {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  role: 'Owner' | 'Verified Agent' | 'Builder';
  avatarUrl?: string;
  rating: number;
  responseRate: string;
}

export interface PropertyLocation {
  address: string;
  locality: string;
  city: string;
  state?: string;
  landmark?: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  listingType: ListingType;
  category: PropertyCategory;
  propertyType: PropertyType;
  price: number; // monthly rent or total sale price
  maintenancePrice?: number;
  securityDeposit?: number;
  isNegotiable?: boolean;
  electricityIncluded?: boolean;
  waterIncluded?: boolean;
  bedrooms: number; // BHK
  bathrooms: number;
  areaSqFt: number;
  furnishing: FurnishingStatus;
  furnishingItems?: string[];
  kitchenType?: KitchenType;
  floor: string;
  facing?: string;
  parking: string;
  location: PropertyLocation;
  images: string[];
  amenities: string[];
  preferredTenants?: TenantPreference[];
  foodPreference?: FoodPreference;
  availableFrom?: string;
  contactChannels?: {
    phone?: boolean;
    whatsapp?: boolean;
    email?: boolean;
  };
  owner: PropertyOwner;
  isFeatured?: boolean;
  isVerified?: boolean;
  isContactUnlocked?: boolean; // Client unlock state
  status: ListingStatus;
  rejectionReason?: string;
  subscriptionPlanId?: string;
  subscriptionExpiresAt?: string;
  approvalSource?: 'backend' | 'mock';
  createdAt: string;
  viewsCount?: number;
  inquiriesCount?: number;
}

export interface PropertyFilter {
  query?: string;
  listingType?: ListingType;
  category?: PropertyCategory;
  state?: string;
  city?: string;
  locality?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number[];
  furnishing?: FurnishingStatus[];
  propertyTypes?: PropertyType[];
  amenities?: string[];
  verifiedOnly?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

