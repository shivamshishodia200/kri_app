import React, { createContext, useContext, useMemo, useRef, useState, ReactNode } from 'react';
import { Property, PropertyFilter, ListingStatus } from '../types/property';
import { INITIAL_PROPERTIES } from '../mock/propertiesData';
import { ownerVisibleStatus, persistFavoriteToggle, propertyService, redactPropertyContact } from '../services/propertyService';

interface PropertyContextType {
  properties: Property[];
  shortlistedIds: string[];
  shortlistedProperties: Property[];
  recentlyViewedIds: string[];
  recentlyViewedProperties: Property[];
  recordRecentlyViewed: (id: string) => void;
  filter: PropertyFilter;
  setFilter: React.Dispatch<React.SetStateAction<PropertyFilter>>;
  resetFilter: () => void;
  filteredProperties: Property[];
  isShortlisted: (id: string) => boolean;
  toggleShortlist: (id: string) => Promise<boolean>;
  getPropertyById: (id: string) => Property | undefined;
  myProperties: Property[];
  addProperty: (propertyData: Omit<Property, 'id' | 'createdAt' | 'owner' | 'status'>) => Promise<Property>;
  updateProperty: (id: string, propertyData: Partial<Property>) => void;
  updatePropertyStatus: (id: string, status: ListingStatus) => void;
  deleteProperty: (id: string) => void;
  sendInquiry: (propertyId: string, message: string, phone: string) => Promise<boolean>;
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedLocality: string | null;
  setSelectedLocality: (locality: string | null) => void;
  isRefreshing: boolean;
  refreshProperties: () => Promise<void>;
  getCategoryCount: (typeOrCategory: string) => number;
}

const DEFAULT_FILTER: PropertyFilter = {
  query: '',
  listingType: 'rent',
  category: 'residential',
  state: '',
  city: '',
  locality: '',
  minPrice: 0,
  maxPrice: 500000,
  bedrooms: [],
  furnishing: [],
  propertyTypes: [],
  amenities: [],
  verifiedOnly: false,
  sortBy: 'popular',
};

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(() => INITIAL_PROPERTIES.map(redactPropertyContact));
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(['prop-1', 'prop-3', 'prop-5']);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(['prop-2', 'prop-1', 'prop-4']);
  const [filter, setFilter] = useState<PropertyFilter>(DEFAULT_FILTER);
  const [selectedState, setSelectedState] = useState<string>('Delhi NCR');
  const [selectedCity, setSelectedCity] = useState<string>('New Delhi');
  const [selectedLocality, setSelectedLocality] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const pendingFavoriteIds = useRef(new Set<string>());

  const isShortlisted = (id: string) => shortlistedIds.includes(id);

  const toggleShortlist = async (id: string): Promise<boolean> => {
    if (pendingFavoriteIds.current.has(id)) return false;
    pendingFavoriteIds.current.add(id);
    const wasSaved = shortlistedIds.includes(id);
    try {
      return await persistFavoriteToggle(id, wasSaved, (saved) => {
        setShortlistedIds((current) => {
          const currentlySaved = current.includes(id);
          if (saved && !currentlySaved) return [...current, id];
          if (!saved && currentlySaved) return current.filter((item) => item !== id);
          return current;
        });
      });
    } finally {
      pendingFavoriteIds.current.delete(id);
    }
  };

  const recordRecentlyViewed = (id: string) => {
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((item) => item !== id);
      return [id, ...filtered].slice(0, 10);
    });
  };

  const shortlistedProperties = properties.filter((p) => shortlistedIds.includes(p.id));
  const recentlyViewedProperties = recentlyViewedIds
    .map((id) => properties.find((p) => p.id === id))
    .filter((p): p is Property => p !== undefined);

  const resetFilter = () => {
    setFilter(DEFAULT_FILTER);
    setSelectedLocality(null);
  };

  const getPropertyById = (id: string) => {
    return properties.find((p) => p.id === id);
  };

  const refreshProperties = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await propertyService.getProperties();
      const fixtureIds = new Set(INITIAL_PROPERTIES.map((property) => property.id));
      setProperties((current) => [
        ...current.filter((property) => !fixtureIds.has(property.id)),
        ...refreshed,
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getCategoryCount = (typeOrCategory: string): number => {
    const lower = typeOrCategory.toLowerCase();
    return properties.filter((p) => {
      if (lower === 'commercial') return p.category === 'commercial';
      if (lower === 'residential') return p.category === 'residential';
      return (
        p.propertyType.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower)
      );
    }).length;
  };

  // Owner properties (owned by current user or demo owner)
  const myProperties = useMemo(
    () => properties
      .filter((p) => p.owner.id === 'owner-101' || p.owner.id === 'usr-current-user')
      .map((property) => ({ ...property, status: ownerVisibleStatus(property) })),
    [properties]
  );

  const addProperty = async (
    propertyData: Omit<Property, 'id' | 'createdAt' | 'owner' | 'status'>
  ): Promise<Property> => {
    const newProperty: Property = {
      ...propertyData,
      id: `prop-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'under_review', // Listings must go through verification/admin review
      isVerified: false,
      isFeatured: false,
      viewsCount: 0,
      inquiriesCount: 0,
      owner: {
        id: 'usr-current-user',
        name: 'Rajesh Sharma',
        phone: '+91 98765 01234',
        role: 'Owner',
        rating: 5.0,
        responseRate: 'Within 15 mins',
      },
    };
    const safeProperty = redactPropertyContact(newProperty);
    setProperties((prev) => [safeProperty, ...prev]);
    return safeProperty;
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        // Never allow owner to self-publish
        if (updates.status === 'published') {
          updates.status = 'under_review';
        }
        return { ...p, ...updates };
      })
    );
  };

  const updatePropertyStatus = (id: string, status: ListingStatus) => {
    // Owner can draft, expire, or submit for review, but cannot self-approve to published
    const safeStatus = status === 'published' ? 'under_review' : status;
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: safeStatus } : p))
    );
  };

  const deleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    setShortlistedIds((prev) => prev.filter((item) => item !== id));
    setRecentlyViewedIds((prev) => prev.filter((item) => item !== id));
  };

  const sendInquiry = async (propertyId: string, message: string, phone: string): Promise<boolean> => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId ? { ...p, inquiriesCount: (p.inquiriesCount || 0) + 1 } : p
      )
    );
    return true;
  };

  // Compute filtered list
  const filteredProperties = properties.filter((p) => {
    // State match
    if (filter.state && p.location.state && p.location.state.toLowerCase() !== filter.state.toLowerCase()) {
      return false;
    }

    // City match
    if (filter.city && p.location.city.toLowerCase() !== filter.city.toLowerCase()) {
      return false;
    }

    // Locality match
    if (selectedLocality && p.location.locality.toLowerCase() !== selectedLocality.toLowerCase()) {
      return false;
    }
    if (filter.locality && p.location.locality.toLowerCase() !== filter.locality.toLowerCase()) {
      return false;
    }

    // Listing type match (rent/buy/sell)
    if (filter.listingType && p.listingType !== filter.listingType) {
      return false;
    }

    // Category match (residential/commercial)
    if (filter.category && p.category !== filter.category) {
      return false;
    }

    // Search query
    if (filter.query && filter.query.trim().length > 0) {
      const q = filter.query.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchLocality = p.location.locality.toLowerCase().includes(q);
      const matchAddress = p.location.address.toLowerCase().includes(q);
      const matchType = p.propertyType.toLowerCase().includes(q);
      if (!matchTitle && !matchLocality && !matchAddress && !matchType) {
        return false;
      }
    }

    // Price range
    if (filter.minPrice !== undefined && p.price < filter.minPrice) {
      return false;
    }
    if (filter.maxPrice !== undefined && p.price > filter.maxPrice && filter.maxPrice < 500000) {
      return false;
    }

    // Bedrooms (BHK)
    if (filter.bedrooms && filter.bedrooms.length > 0) {
      if (!filter.bedrooms.includes(p.bedrooms)) {
        return false;
      }
    }

    // Furnishing
    if (filter.furnishing && filter.furnishing.length > 0) {
      if (!filter.furnishing.includes(p.furnishing)) {
        return false;
      }
    }

    // Property Types
    if (filter.propertyTypes && filter.propertyTypes.length > 0) {
      if (!filter.propertyTypes.includes(p.propertyType)) {
        return false;
      }
    }

    // Verified Only
    if (filter.verifiedOnly && !p.isVerified) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (filter.sortBy === 'price_asc') return a.price - b.price;
    if (filter.sortBy === 'price_desc') return b.price - a.price;
    if (filter.sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    // Default popular
    return (b.viewsCount || 0) - (a.viewsCount || 0);
  });

  return (
    <PropertyContext.Provider
      value={{
        properties,
        shortlistedIds,
        shortlistedProperties,
        recentlyViewedIds,
        recentlyViewedProperties,
        recordRecentlyViewed,
        filter,
        setFilter,
        resetFilter,
        filteredProperties,
        isShortlisted,
        toggleShortlist,
        getPropertyById,
        myProperties,
        addProperty,
        updateProperty,
        updatePropertyStatus,
        deleteProperty,
        sendInquiry,
        selectedState,
        setSelectedState,
        selectedCity,
        setSelectedCity,
        selectedLocality,
        setSelectedLocality,
        isRefreshing,
        refreshProperties,
        getCategoryCount,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = (): PropertyContextType => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};

