import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Property, PropertyFilter, ListingStatus } from '../types/property';
import { INITIAL_PROPERTIES } from '../mock/propertiesData';

interface PropertyContextType {
  properties: Property[];
  shortlistedIds: string[];
  shortlistedProperties: Property[];
  filter: PropertyFilter;
  setFilter: React.Dispatch<React.SetStateAction<PropertyFilter>>;
  resetFilter: () => void;
  filteredProperties: Property[];
  isShortlisted: (id: string) => boolean;
  toggleShortlist: (id: string) => void;
  getPropertyById: (id: string) => Property | undefined;
  myProperties: Property[];
  addProperty: (propertyData: Omit<Property, 'id' | 'createdAt' | 'owner' | 'status'>) => Promise<Property>;
  updateProperty: (id: string, propertyData: Partial<Property>) => void;
  updatePropertyStatus: (id: string, status: ListingStatus) => void;
  deleteProperty: (id: string) => void;
  sendInquiry: (propertyId: string, message: string, phone: string) => Promise<boolean>;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
}

const DEFAULT_FILTER: PropertyFilter = {
  query: '',
  listingType: 'rent',
  category: 'residential',
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
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [shortlistedIds, setShortlistedIds] = useState<string[]>(['prop-1', 'prop-3']);
  const [filter, setFilter] = useState<PropertyFilter>(DEFAULT_FILTER);
  const [selectedCity, setSelectedCity] = useState<string>('Bangalore');

  const isShortlisted = (id: string) => shortlistedIds.includes(id);

  const toggleShortlist = (id: string) => {
    setShortlistedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const shortlistedProperties = properties.filter((p) => shortlistedIds.includes(p.id));

  const resetFilter = () => {
    setFilter(DEFAULT_FILTER);
  };

  const getPropertyById = (id: string) => {
    return properties.find((p) => p.id === id);
  };

  // Owner properties (can filter by owner ID or status)
  const myProperties = properties.filter((p) => p.owner.id === 'owner-101' || p.owner.id === 'usr-current-user');

  const addProperty = async (
    propertyData: Omit<Property, 'id' | 'createdAt' | 'owner' | 'status'>
  ): Promise<Property> => {
    const newProperty: Property = {
      ...propertyData,
      id: `prop-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'under_review',
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
    setProperties((prev) => [newProperty, ...prev]);
    return newProperty;
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const updatePropertyStatus = (id: string, status: ListingStatus) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  const deleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    setShortlistedIds((prev) => prev.filter((item) => item !== id));
  };

  const sendInquiry = async (propertyId: string, message: string, phone: string): Promise<boolean> => {
    // Increment inquiry count for that property
    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId ? { ...p, inquiriesCount: (p.inquiriesCount || 0) + 1 } : p
      )
    );
    return true;
  };

  // Compute filtered list
  const filteredProperties = properties.filter((p) => {
    // City match
    if (p.location.city.toLowerCase() !== selectedCity.toLowerCase()) {
      // allow fallback if looking across
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
        selectedCity,
        setSelectedCity,
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
