import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Modal,
  Platform,
  RefreshControl,
  Image,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import { useAuth } from '../../context/AuthContext';
import { useProperty } from '../../context/PropertyContext';
import { useNotification } from '../../context/NotificationContext';
import { useChat } from '../../context/ChatContext';
import { SectionHeading } from '../../components/common/SectionHeading';
import { PropertyCardVertical } from '../../components/property/PropertyCardVertical';
import { PropertyCardHorizontal } from '../../components/property/PropertyCardHorizontal';
import { RoleSwitchBanner } from '../../components/common/RoleSwitchBanner';
import { AppLogo } from '../../components/common/AppLogo';
import { HomeDrawer } from '../../components/common/HomeDrawer';
import { HomePromoCarousel, HomePromo } from '../../components/common/HomePromoCarousel';
import { ContactUnlockModal } from '../../components/common/ContactUnlockModal';
import { Icon } from '../../components/common/Icon';
import { Property, PropertyType } from '../../types/property';
import { propertyService } from '../../services/propertyService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BUYER_HOME_PROMOS: HomePromo[] = [
  {
    eyebrow: 'SAMPLE LISTINGS',
    title: 'Find a place that fits',
    description: 'Browse demo homes by locality. Live owner verification is not connected.',
    actionLabel: 'Browse rentals',
    icon: 'home',
  },
  {
    eyebrow: 'RENT TOOLS',
    title: 'Keep rent organised',
    description: 'Open the rent workspace for demo receipts and payment details.',
    actionLabel: 'Open rent tools',
    icon: 'credit-card',
  },
  {
    eyebrow: 'WORK & RETAIL',
    title: 'Explore commercial spaces',
    description: 'See sample offices, shops and commercial properties in one place.',
    actionLabel: 'View commercial',
    icon: 'briefcase',
  },
];

const CITIES = [
  { name: 'Bangalore', state: 'Karnataka', popular: true },
  { name: 'Mumbai', state: 'Maharashtra', popular: true },
  { name: 'Delhi NCR', state: 'Delhi & NCR', popular: true },
  { name: 'Pune', state: 'Maharashtra', popular: true },
  { name: 'Hyderabad', state: 'Telangana', popular: true },
  { name: 'Chennai', state: 'Tamil Nadu', popular: false },
  { name: 'Kolkata', state: 'West Bengal', popular: false },
  { name: 'Ahmedabad', state: 'Gujarat', popular: false },
];

const LOCALITIES: Record<string, string[]> = {
  Bangalore: ['Indiranagar', 'HSR Layout', 'Koramangala', 'Whitefield', 'Bellandur', 'Jayanagar', 'Sarjapur Road'],
  Mumbai: ['Bandra West', 'Andheri West', 'Powai', 'Juhu', 'Worli', 'Thane West'],
  'Delhi NCR': ['Golf Course Rd', 'Cyber City', 'South Extension', 'Noida Sector 62', 'Vasant Kunj'],
  Pune: ['Koregaon Park', 'Kalyani Nagar', 'Baner', 'Viman Nagar', 'Hinjewadi'],
  Hyderabad: ['Hitec City', 'Gachibowli', 'Jubilee Hills', 'Banjara Hills', 'Madhapur'],
  Chennai: ['OMR', 'Adyar', 'Anna Nagar', 'Velachery', 'Besant Nagar'],
  Kolkata: ['Salt Lake', 'New Town', 'Ballygunge', 'Alipore'],
  Ahmedabad: ['SG Highway', 'Bodakdev', 'Satellite', 'Prahlad Nagar'],
};

export const BuyerHomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, role } = useAuth();
  const {
    properties,
    shortlistedIds,
    shortlistedProperties,
    selectedCity,
    setSelectedCity,
    setSelectedLocality,
    setFilter,
    isRefreshing,
    refreshProperties,
    getCategoryCount,
  } = useProperty();
  const { unreadCount: notificationUnread } = useNotification();
  const { unreadCount: chatUnread } = useChat();

  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [contactProperty, setContactProperty] = useState<Property | null>(null);
  const [activeFilterChip, setActiveFilterChip] = useState<'all' | 'rent' | 'buy' | 'commercial' | 'new'>('all');

  const currentLocalities = LOCALITIES[selectedCity] || LOCALITIES['Bangalore'];

  // Categorized Property Subsets
  const featuredProperties = properties.filter((p) => p.isFeatured && p.status === 'published');
  const rentalProperties = properties.filter((p) => p.listingType === 'rent' && p.status === 'published');
  const buyProperties = properties.filter((p) => p.listingType === 'buy' && p.status === 'published');
  const newProperties = [...properties]
    .filter((p) => p.status === 'published')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const residentialProperties = properties.filter(
    (property) => property.status === 'published' && property.category === 'residential'
  );
  const commercialProperties = properties.filter(
    (property) => property.status === 'published' && property.category === 'commercial'
  );

  const handlePropertyContact = async (property: Property) => {
    const entitlement = await propertyService.checkContactEntitlement(property.id);
    if (!entitlement.allowed) {
      setContactProperty(property);
      return;
    }
    try {
      await Linking.openURL(`tel:${entitlement.phone}`);
    } catch {
      setContactProperty(property);
    }
  };

  // Quick category navigation
  const handleQuickCategory = (type?: 'rent' | 'buy', category?: 'residential' | 'commercial', propertyType?: PropertyType) => {
    setFilter({
      listingType: type,
      category,
      propertyTypes: propertyType ? [propertyType] : undefined,
      city: selectedCity,
    });
    navigation.navigate('SearchListings', {
      initialFilter: {
        listingType: type,
        category,
        propertyTypes: propertyType ? [propertyType] : undefined,
        city: selectedCity,
      },
    });
  };

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setSelectedLocality(null);
    setCityModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      {/* Top Luxury Dark Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          {/* Brand Logo */}
            <AppLogo width={Math.min(140, SCREEN_WIDTH * 0.35)} height={48} variant="light" style={styles.logoStyle} />

          {/* Controls: Location, Chat, Notifications */}
          <View style={styles.headerControls}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDrawerVisible(true)}
              style={styles.headerIconButton}
              accessibilityRole="button"
              accessibilityLabel="Open navigation menu"
            >
              <Icon name="list" size={19} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Chat Shortcut */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ChatList')}
              style={styles.headerIconButton}
              accessibilityRole="button"
              accessibilityLabel={`Chat with owners. ${chatUnread} unread messages.`}
            >
              <Icon name="chat" size={18} color="#FFFFFF" />
              {chatUnread > 0 && (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeText}>{chatUnread > 9 ? '9+' : chatUnread}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Notification Bell */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('NotificationList')}
              style={styles.headerIconButton}
              accessibilityRole="button"
              accessibilityLabel={`Notifications. ${notificationUnread} unread.`}
            >
              <Icon name="bell" size={18} color="#FFFFFF" />
              {notificationUnread > 0 && (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeText}>
                    {notificationUnread > 9 ? '9+' : notificationUnread}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* User Greeting */}
        <View style={styles.greetingContainer}>
          <View style={styles.greetingTopRow}>
            <Text style={styles.greetingTitle} numberOfLines={1}>
              Hi, {user?.name ? user.name.split(' ')[0] : 'Resident'}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setCityModalVisible(true)}
              style={styles.locationPill}
              accessibilityRole="button"
              accessibilityLabel={`Current city: ${selectedCity}. Tap to change city.`}
            >
              <Icon name="map-pin" size={13} color={colors.primary} />
              <Text style={styles.cityNameText} numberOfLines={1}>{selectedCity}</Text>
              <Icon name="chevron-down" size={11} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <Text style={styles.greetingSubtitle}>
            Find 100% verified homes with zero brokerage fees
          </Text>
        </View>

        {/* Hero Interactive Search Bar */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('SearchListings', { focusSearch: true })}
          style={styles.heroSearchBar}
          accessibilityRole="search"
          accessibilityLabel="Search by location, property name, or keyword"
        >
          <View style={styles.searchLeft}>
            <View style={styles.searchIconWrapper}>
              <Icon name="search" size={16} color={colors.primaryDark} />
            </View>
            <View style={styles.searchPlaceholderBox}>
              <Text style={styles.searchMainPlaceholder}>
                Search location, property or landmark
              </Text>
              <Text style={styles.searchSubPlaceholder}>
                e.g. {currentLocalities[0]}, {currentLocalities[1]}
              </Text>
            </View>
          </View>

          <View style={styles.filterButton}>
            <Icon name="filter" size={15} color="#0F172A" />
          </View>
        </TouchableOpacity>

        {/* Quick Filter Chips: All | Rent | Buy | Commercial | New */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickChipsRow}
        >
          {[
            { id: 'all', label: 'All Listings', icon: 'grid', action: () => { setActiveFilterChip('all'); handleQuickCategory(); } },
            { id: 'rent', label: 'Rent Homes', icon: 'home', action: () => { setActiveFilterChip('rent'); handleQuickCategory('rent', 'residential'); } },
            { id: 'buy', label: 'Buy Property', icon: 'building', action: () => { setActiveFilterChip('buy'); handleQuickCategory('buy', 'residential'); } },
            { id: 'commercial', label: 'Commercial', icon: 'briefcase', action: () => { setActiveFilterChip('commercial'); handleQuickCategory(undefined, 'commercial'); } },
            { id: 'new', label: 'New Launch', icon: 'sparkles', action: () => { setActiveFilterChip('new'); setFilter(p => ({ ...p, sortBy: 'newest' })); navigation.navigate('SearchListings'); } },
          ].map((chip) => {
            const active = activeFilterChip === chip.id;
            return (
              <TouchableOpacity
                key={chip.id}
                style={[styles.quickChip, active && styles.quickChipActive]}
                onPress={chip.action}
                activeOpacity={0.8}
              >
                <Icon
                  name={chip.icon as any}
                  size={12}
                  color={active ? '#0F172A' : '#CBD5E1'}
                />
                <Text style={[styles.quickChipText, active && styles.quickChipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshProperties}
            tintColor={colors.primary}
            colors={[colors.primaryDark]}
          />
        }
      >
        {/* Role Switch Banner */}
        <View style={styles.bannerWrapper}>
          <RoleSwitchBanner />
        </View>

        {/* Auto-rotating demo discovery and service promos */}
        <View style={styles.campaignBannerContainer}>
          <HomePromoCarousel
            promos={BUYER_HOME_PROMOS}
            onAction={(index) => {
              if (index === 0) handleQuickCategory('rent', 'residential');
              else if (index === 1) navigation.navigate('PayRent');
              else handleQuickCategory(undefined, 'commercial');
            }}
          />
        </View>

        {/* Property Categories Grid */}
        <View style={styles.sectionContainer}>
          <SectionHeading
            title="Browse by Property Type"
            subtitle="Apartments, standalone villas, plots and commercial spaces"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesCarousel}
            decelerationRate="fast"
          >
            {[
              { id: 'apt', name: 'Apartments', type: 'Apartment' as PropertyType, icon: 'building', count: getCategoryCount('Apartment') },
              { id: 'villa', name: 'Villas & Houses', type: 'Villa' as PropertyType, icon: 'home', count: getCategoryCount('Villa') },
              { id: 'ind', name: 'Indep. Houses', type: 'Independent House' as PropertyType, icon: 'home', count: getCategoryCount('Independent House') },
              { id: 'comm', name: 'Office Spaces', type: 'Office Space' as PropertyType, icon: 'briefcase', count: getCategoryCount('Office Space') },
              { id: 'shop', name: 'Shops / Retail', type: 'Shop / Showroom' as PropertyType, icon: 'building', count: getCategoryCount('Shop / Showroom') },
              { id: 'plot', name: 'Plots / Land', type: 'Plot / Land' as PropertyType, icon: 'square-area', count: getCategoryCount('Plot / Land') },
            ].map((cat, index) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() => handleQuickCategory(undefined, undefined, cat.type)}
                activeOpacity={0.82}
                accessibilityRole="button"
                accessibilityLabel={`${cat.name}, ${cat.count} listings. Browse category.`}
              >
                <View style={styles.categoryCardTop}>
                  <View style={styles.categoryIconCircle}>
                    <Icon name={cat.icon as any} size={20} color={colors.primaryDark} />
                  </View>
                  <Text style={styles.categoryIndex}>{String(index + 1).padStart(2, '0')}</Text>
                </View>
                <Text style={styles.categoryTitle} numberOfLines={2}>{cat.name}</Text>
                <View style={styles.categoryCardBottom}>
                  <Text style={styles.categoryCount}>{cat.count} listings</Text>
                  <Icon name="arrow-right" size={15} color={colors.primaryDark} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Properties Carousel */}
        <View style={styles.sectionContainer}>
          <SectionHeading
            title="Featured Properties"
            subtitle="Handpicked verified residences with photo audits"
            onSeeAll={() => handleQuickCategory()}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalPropertiesList}
          >
            {featuredProperties.map((prop) => (
              <PropertyCardVertical
                key={prop.id}
                property={prop}
                cardWidth={SCREEN_WIDTH * 0.76}
                onPress={() =>
                  navigation.navigate('PropertyDetail', {
                    propertyId: prop.id,
                    property: prop,
                  })
                }
                onContactPress={() => handlePropertyContact(prop)}
                style={{ marginRight: spacing.md }}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <SectionHeading
            title="Residential properties"
            subtitle="Sample homes available to rent or buy"
            onSeeAll={() => handleQuickCategory(undefined, 'residential')}
          />
          {residentialProperties.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalPropertiesList}>
              {residentialProperties.slice(0, 6).map((property) => (
                <PropertyCardVertical
                  key={`residential-${property.id}`}
                  property={property}
                  cardWidth={SCREEN_WIDTH * 0.76}
                  onPress={() => navigation.navigate('PropertyDetail', { propertyId: property.id, property })}
                  onContactPress={() => handlePropertyContact(property)}
                  style={{ marginRight: spacing.md }}
                />
              ))}
            </ScrollView>
          ) : <Text style={styles.emptyCategoryText}>No sample residential listings are available.</Text>}
        </View>

        <View style={styles.sectionContainer}>
          <SectionHeading
            title="Commercial properties"
            subtitle="Sample offices, shops and workspaces"
            onSeeAll={() => handleQuickCategory(undefined, 'commercial')}
          />
          {commercialProperties.length > 0 ? (
            <View style={styles.verticalListContainer}>
              {commercialProperties.slice(0, 3).map((property) => (
                <PropertyCardHorizontal
                  key={`commercial-${property.id}`}
                  property={property}
                  onPress={() => navigation.navigate('PropertyDetail', { propertyId: property.id, property })}
                  onContactPress={() => handlePropertyContact(property)}
                />
              ))}
            </View>
          ) : <Text style={styles.emptyCategoryText}>No sample commercial listings are available.</Text>}
        </View>

        {/* Trending Rentals */}
        <View style={styles.sectionContainer}>
          <SectionHeading
            title="Trending Rental Homes"
            subtitle="Ready to move-in flats with instant agreement support"
            onSeeAll={() => handleQuickCategory('rent', 'residential')}
          />
          <View style={styles.verticalListContainer}>
            {rentalProperties.slice(0, 4).map((prop) => (
              <PropertyCardHorizontal
                key={`rental-${prop.id}`}
                property={prop}
                onPress={() =>
                  navigation.navigate('PropertyDetail', {
                    propertyId: prop.id,
                    property: prop,
                  })
                }
                  onContactPress={() => handlePropertyContact(prop)}
              />
            ))}
          </View>
        </View>

        {/* Prime Properties to Buy */}
        <View style={styles.sectionContainer}>
          <SectionHeading
            title="Prime Investment & Buy Properties"
            subtitle="Villas, penthouses & RERA approved societies"
            onSeeAll={() => handleQuickCategory('buy', 'residential')}
          />
          <View style={styles.verticalListContainer}>
            {buyProperties.slice(0, 2).map((prop) => (
              <PropertyCardVertical
                key={`buy-${prop.id}`}
                property={prop}
                onPress={() =>
                  navigation.navigate('PropertyDetail', {
                    propertyId: prop.id,
                    property: prop,
                  })
                }
                onContactPress={() => handlePropertyContact(prop)}
                style={{ marginBottom: spacing.md }}
              />
            ))}
          </View>
        </View>

        {/* Home Services & Utilities Showcase */}
        <View style={styles.sectionContainer}>
          <SectionHeading
            title="Essential Home Services"
            subtitle="Trusted professionals for moving, cleaning & legal paperwork"
            onSeeAll={() => navigation.navigate('ServicesCatalog')}
          />
          <View style={styles.servicesGrid}>
            {[
              { id: 'agreement', title: 'Rent Agreement', sub: 'E-Stamping & Delivery', icon: 'shield-check', color: '#027A48', bg: '#ECFDF3' },
              { id: 'packers', title: 'Packers & Movers', sub: 'Safe Relocation', icon: 'truck', color: '#175CD3', bg: '#EFF8FF' },
              { id: 'clean', title: 'Deep Cleaning', sub: 'Sanitized Living', icon: 'sparkles', color: '#C11574', bg: '#FDF4FF' },
              { id: 'paint', title: 'Painting & Repair', sub: 'Expert Finish', icon: 'edit', color: '#B54708', bg: '#FEF0C7' },
            ].map((srv) => (
              <TouchableOpacity
                key={srv.id}
                style={styles.serviceItemCard}
                onPress={() => navigation.navigate('ServicesCatalog')}
                activeOpacity={0.8}
              >
                <View style={[styles.serviceIconCircle, { backgroundColor: srv.bg }]}>
                  <Icon name={srv.icon as any} size={20} color={srv.color} />
                </View>
                <Text style={styles.serviceTitle}>{srv.title}</Text>
                <Text style={styles.serviceSubtitle}>{srv.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Saved Properties Preview (if any) */}
        {shortlistedProperties.length > 0 && (
          <View style={styles.savedPreviewCard}>
            <View style={styles.savedPreviewLeft}>
              <View style={styles.savedHeartCircle}>
                <Icon name="heart-filled" size={16} color={colors.danger} />
              </View>
              <View>
                <Text style={styles.savedPreviewTitle}>
                  {shortlistedProperties.length} Saved {shortlistedProperties.length === 1 ? 'Home' : 'Homes'}
                </Text>
                <Text style={styles.savedPreviewSubtitle}>Quickly compare shortlisted properties</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.savedPreviewBtn}
              onPress={() => navigation.navigate('Shortlisted')}
            >
              <Text style={styles.savedPreviewBtnText}>View All →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Kirayedar24 Trust Metrics Footer */}
        <View style={styles.trustShieldContainer}>
          <View style={styles.trustBadge}>
            <Icon name="shield-check" size={15} color={colors.primary} />
            <Text style={styles.trustBadgeText}>THE KIRAYEDAR24 ASSURANCE</Text>
          </View>
          <Text style={styles.trustTitle}>India's Transparent Realty App</Text>
          <Text style={styles.trustSubtitle}>
            Eliminating broker fees, deceptive photos, and unexpected paperwork delays.
          </Text>

          <View style={styles.trustStatsGrid}>
            <View style={styles.trustStatCard}>
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Owner Direct</Text>
            </View>
            <View style={styles.trustStatCard}>
              <Text style={styles.statValue}>₹0</Text>
              <Text style={styles.statLabel}>Brokerage Paid</Text>
            </View>
            <View style={styles.trustStatCard}>
              <Text style={styles.statValue}>24/7</Text>
              <Text style={styles.statLabel}>Support Care</Text>
            </View>
            <View style={styles.trustStatCard}>
              <Text style={styles.statValue}>4.9 ★</Text>
              <Text style={styles.statLabel}>User Rating</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* City & Location Selector Modal */}
      <Modal
        visible={cityModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCityModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCityModalVisible(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Your City</Text>
                <Text style={styles.modalSubtitle}>Discover properties & services nearby</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setCityModalVisible(false)}
              >
                <Icon name="close" size={16} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              <Text style={styles.modalSectionLabel}>Popular Cities</Text>
              <View style={styles.cityGrid}>
                {CITIES.map((c) => {
                  const selected = selectedCity.toLowerCase() === c.name.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={c.name}
                      style={[styles.cityPill, selected && styles.cityPillActive]}
                      onPress={() => handleCitySelect(c.name)}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name="map-pin"
                        size={13}
                        color={selected ? '#0F172A' : colors.primaryDark}
                      />
                      <Text style={[styles.cityName, selected && styles.cityNameActive]}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <HomeDrawer
        visible={drawerVisible}
        role={role}
        navigation={navigation}
        onClose={() => setDrawerVisible(false)}
      />
      {contactProperty && (
        <ContactUnlockModal
          visible
          onClose={() => setContactProperty(null)}
          ownerName={contactProperty.owner.name}
          propertyTitle={contactProperty.title}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    backgroundColor: '#0B0F19',
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  logoStyle: {
    marginLeft: -4,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationPill: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    backgroundColor: 'rgba(253, 176, 34, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.25)',
    gap: 5,
  },
  cityNameText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    maxWidth: 90,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeCount: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#0B0F19',
  },
  badgeText: {
    ...typography.badge,
    fontSize: 9,
    color: '#0F172A',
    fontWeight: '800',
  },
  greetingContainer: {
    marginBottom: 8,
  },
  greetingTitle: {
    flex: 1,
    ...typography.h2,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  greetingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  greetingSubtitle: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  heroSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  searchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  searchIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchPlaceholderBox: {
    flex: 1,
  },
  searchMainPlaceholder: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  searchSubPlaceholder: {
    ...typography.caption,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChipsRow: {
    gap: 8,
    paddingVertical: 0,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  quickChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  quickChipText: {
    ...typography.caption,
    color: '#CBD5E1',
    fontWeight: '600',
    fontSize: 11,
  },
  quickChipTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  campaignBannerContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  campaignBanner: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.25)',
  },
  campaignLeft: {
    flex: 1,
    paddingRight: 10,
  },
  campaignPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: 'rgba(253, 176, 34, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.3)',
  },
  campaignPillText: {
    ...typography.badge,
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  campaignTitle: {
    ...typography.subtitle,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  campaignDesc: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  campaignCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  campaignCTAText: {
    ...typography.badge,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 11,
  },
  campaignIconWrapper: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContainer: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  categoriesCarousel: {
    gap: 12,
    paddingHorizontal: 1,
    paddingVertical: 5,
  },
  categoryCard: {
    width: Math.min(224, Math.max(196, SCREEN_WIDTH * 0.54)),
    minHeight: 154,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E4E9F0',
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  categoryCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF5D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIndex: {
    ...typography.badge,
    color: '#9AA4B2',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryTitle: {
    ...typography.subtitle,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#0F172A',
    minHeight: 40,
    textAlign: 'left',
    marginBottom: 8,
  },
  categoryCardBottom: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEF1F5',
    paddingTop: 7,
  },
  categoryCount: {
    ...typography.caption,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  horizontalPropertiesList: {
    paddingVertical: 4,
  },
  verticalListContainer: {
    marginTop: 4,
  },
  emptyCategoryText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceItemCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  serviceIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceTitle: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  serviceSubtitle: {
    ...typography.caption,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  savedPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF1F2',
    marginHorizontal: 16,
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  savedPreviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  savedHeartCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedPreviewTitle: {
    ...typography.subtitle,
    fontSize: 14,
    fontWeight: '700',
    color: '#9F1239',
  },
  savedPreviewSubtitle: {
    ...typography.caption,
    color: '#BE123C',
    fontSize: 11,
  },
  savedPreviewBtn: {
    backgroundColor: '#9F1239',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  savedPreviewBtnText: {
    ...typography.badge,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  trustShieldContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 22,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    marginBottom: 8,
  },
  trustBadgeText: {
    ...typography.badge,
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '800',
  },
  trustTitle: {
    ...typography.h3,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '800',
    marginBottom: 4,
  },
  trustSubtitle: {
    ...typography.caption,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  trustStatsGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  trustStatCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.h3,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    ...typography.caption,
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    ...typography.h3,
    fontSize: 18,
    color: '#0F172A',
  },
  modalSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSectionLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cityPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  cityName: {
    ...typography.bodySmall,
    color: '#334155',
    fontWeight: '600',
  },
  cityNameActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
});
