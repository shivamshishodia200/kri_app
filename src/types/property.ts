export type ListingType = 'rent' | 'buy' | 'sell';
export type PropertyCategory = 'residential' | 'commercial';
export type PropertyType = 
  | 'Apartment'
  | 'Villa'
  | 'Independent House'
  | 'Studio'
  | 'Office Space'
  | 'Shop / Showroom'
  | 'Warehouse';

export type FurnishingStatus = 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
export type ListingStatus = 'published' | 'under_review' | 'draft' | 'rented_sold';

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface PropertyOwner {
  id: string;
  name: string;
  phone: string;
  role: 'Owner' | 'Verified Agent' | 'Builder';
  avatarUrl?: string;
  rating: number;
  responseRate: string;
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
  bedrooms: number; // BHK
  bathrooms: number;
  areaSqFt: number;
  furnishing: FurnishingStatus;
  floor: string;
  facing?: string;
  parking: string;
  location: {
    address: string;
    locality: string;
    city: string;
    landmark?: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
  };
  images: string[];
  amenities: string[];
  owner: PropertyOwner;
  isFeatured?: boolean;
  isVerified?: boolean;
  status: ListingStatus;
  createdAt: string;
  viewsCount?: number;
  inquiriesCount?: number;
}

export interface PropertyFilter {
  query?: string;
  listingType?: ListingType;
  category?: PropertyCategory;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number[];
  furnishing?: FurnishingStatus[];
  propertyTypes?: PropertyType[];
  amenities?: string[];
  verifiedOnly?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}
