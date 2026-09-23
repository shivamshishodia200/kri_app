import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import { useProperty } from '../../context/PropertyContext';
import { useNotification } from '../../context/NotificationContext';
import { SectionHeading } from '../../components/common/SectionHeading';
import { PropertyCardVertical } from '../../components/property/PropertyCardVertical';
import { PropertyCardHorizontal } from '../../components/property/PropertyCardHorizontal';
import { RoleSwitchBanner } from '../../components/common/RoleSwitchBanner';
import { AppLogo } from '../../components/common/AppLogo';
import { Icon } from '../../components/common/Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  Bangalore: ['Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield', 'Bellandur', 'Electronic City'],
  Mumbai: ['Bandra West', 'Andheri West', 'Powai', 'Juhu', 'Worli', 'Thane West'],
  'Delhi NCR': ['Cyber City', 'Golf Course Rd', 'South Extension', 'Noida Sector 62', 'Vasant Kunj'],
  Pune: ['Koregaon Park', 'Kalyani Nagar', 'Baner', 'Viman Nagar', 'Hinjewadi'],
  Hyderabad: ['Hitec City', 'Gachibowli', 'Jubilee Hills', 'Banjara Hills', 'Madhapur'],
  Chennai: ['OMR', 'Adyar', 'Anna Nagar', 'Velachery', 'Besant Nagar'],
};

export const BuyerHomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { properties, selectedCity, setSelectedCity, setFilter } = useProperty();
  const { unreadCount } = useNotification();

  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'rent' | 'buy' | 'commercial'>('rent');

  const featuredProperties = properties.filter((p) => p.isFeatured);
  const rentalProperties = properties.filter((p) => p.listingType === 'rent');
  const buyProperties = properties.filter((p) => p.listingType === 'buy');

  const currentLocalities = LOCALITIES[selectedCity] || LOCALITIES['Bangalore'];

  const handleQuickCategory = (type: 'rent' | 'buy', category: 'residential' | 'commercial' = 'residential') => {
    setActiveTab(type === 'buy' ? 'buy' : category === 'commercial' ? 'commercial' : 'rent');
    setFilter((prev) => ({
      ...prev,
      listingType: type,
      category,
    }));
    navigation.navigate('SearchListings', {
      initialFilter: { listingType: type, category },
    });
  };

  const handleLocalityPress = (locality: string) => {
    setFilter((prev) => ({
      ...prev,
      query: locality,
      city: selectedCity,
    }));
    navigation.navigate('SearchListings', {
      initialFilter: { query: locality, city: selectedCity },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      {/* Top Luxury Midnight Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          {/* Brand Logo */}
          <AppLogo width={140} height={55} variant="light" style={styles.logoStyle} />

          {/* Location & Notification Controls */}
          <View style={styles.headerControls}>
            {/* City Selector Pill */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setCityModalVisible(true)}
              style={styles.locationPill}
            >
              <Icon name="map-pin" size={13} color={colors.primary} />
              <Text style={styles.cityNameText} numberOfLines={1}>
                {selectedCity}
              </Text>
              <Icon name="chevron-down" size={11} color="#94A3B8" />
            </TouchableOpacity>

            {/* Notification Bell */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('NotificationList')}
              style={styles.notificationButton}
            >
              <Icon name="bell" size={19} color="#FFFFFF" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* User Greeting and Slogan */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTitle}>
            Hi, {user?.name ? user.name.split(' ')[0] : 'Resident'} 👋
          </Text>
          <Text style={styles.greetingSubtitle}>
            Explore 100% verified homes with zero brokerage fees
          </Text>
        </View>

        {/* Hero Interactive Search Bar */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('SearchListings', { focusSearch: true })}
          style={styles.heroSearchBar}
        >
          <View style={styles.searchLeft}>
            <View style={styles.searchIconWrapper}>
              <Icon name="search" size={17} color={colors.primary} />
            </View>
            <View style={styles.searchPlaceholderBox}>
              <Text style={styles.searchMainPlaceholder}>Search localities, apartments...</Text>
              <Text style={styles.searchSubPlaceholder}>
                e.g. {currentLocalities[0]}, {currentLocalities[1]}
              </Text>
            </View>
          </View>

          <View style={styles.filterButton}>
            <Icon name="filter" size={16} color="#0F172A" />
          </View>
        </TouchableOpacity>

        {/* Category Tabs: Rent | Buy | Commercial */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'rent' && styles.tabButtonActive]}
            onPress={() => handleQuickCategory('rent', 'residential')}
            activeOpacity={0.8}
          >
            <Icon
              name="home"
              size={14}
              color={activeTab === 'rent' ? '#0F172A' : '#94A3B8'}
            />
            <Text style={[styles.tabText, activeTab === 'rent' && styles.tabTextActive]}>
              Rent Homes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'buy' && styles.tabButtonActive]}
            onPress={() => handleQuickCategory('buy', 'residential')}
            activeOpacity={0.8}
          >
            <Icon
              name="building"
              size={14}
              color={activeTab === 'buy' ? '#0F172A' : '#94A3B8'}
            />
            <Text style={[styles.tabText, activeTab === 'buy' && styles.tabTextActive]}>
              Buy Property
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'commercial' && styles.tabButtonActive]}
            onPress={() => handleQuickCategory('rent', 'commercial')}
            activeOpacity={0.8}
          >
            <Icon
              name="briefcase"
              size={14}
              color={activeTab === 'commercial' ? '#0F172A' : '#94A3B8'}
            />
            <Text style={[styles.tabText, activeTab === 'commercial' && styles.tabTextActive]}>
              Commercial
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Role Switch Banner */}
        <View style={styles.bannerWrapper}>
          <RoleSwitchBanner />
        </View>

        {/* Quick Action Services Matrix */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderSimple}>
            <Text style={styles.sectionTitleBold}>Realty Services</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ServicesCatalog')}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickServicesGrid}>
            {[
              {
                id: 'rent-pay',
                title: 'Pay Rent',
                subtitle: 'Cashback',
                icon: 'credit-card',
                badge: '1.5% Off',
                bgColor: '#FEF3F2',
                iconColor: '#D92D20',
                action: () => navigation.navigate('PayRent'),
              },
              {
                id: 'packers',
                title: 'Packers',
                subtitle: 'Safe Shifting',
                icon: 'truck',
                badge: 'Verified',
                bgColor: '#EFF8FF',
                iconColor: '#175CD3',
                action: () => navigation.navigate('ServicesCatalog'),
              },
              {
                id: 'agreements',
                title: 'Agreement',
                subtitle: 'Legal Stamp',
                icon: 'shield-check',
                badge: 'Instant',
                bgColor: '#ECFDF3',
                iconColor: '#027A48',
                action: () => navigation.navigate('ServicesCatalog'),
              },
              {
                id: 'cleaning',
                title: 'Cleaning',
                subtitle: 'Deep Clean',
                icon: 'sparkles',
                badge: 'Popular',
                bgColor: '#FDF4FF',
                iconColor: '#C11574',
                action: () => navigation.navigate('ServicesCatalog'),
              },
            ].map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceItemCard}
                onPress={service.action}
                activeOpacity={0.8}
              >
                {service.badge && (
                  <View style={styles.serviceBadge}>
                    <Text style={styles.serviceBadgeText}>{service.badge}</Text>
                  </View>
                )}
                <View style={[styles.serviceIconCircle, { backgroundColor: service.bgColor }]}>
                  <Icon name={service.icon as any} size={22} color={service.iconColor} />
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dynamic Highlight Promo Banners Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promoCarouselContainer}
          snapToInterval={SCREEN_WIDTH * 0.88 + 12}
          decelerationRate="fast"
        >
          {/* Promo Card 1: Zero Brokerage Guarantee */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.promoCard, { backgroundColor: '#111827' }]}
            onPress={() => handleQuickCategory('rent')}
          >
            <View style={styles.promoContent}>
              <View style={styles.promoChip}>
                <Icon name="shield-check" size={11} color={colors.primary} />
                <Text style={styles.promoChipText}>100% DIRECT OWNER</Text>
              </View>
              <Text style={styles.promoHeading}>0% Brokerage Guarantee</Text>
              <Text style={styles.promoDesc}>
                Connect directly with property owners and save up to ₹50,000 on agent fees.
              </Text>
              <View style={styles.promoActionButton}>
                <Text style={styles.promoActionText}>Explore Verified Homes</Text>
                <Icon name="arrow-right" size={13} color="#0F172A" />
              </View>
            </View>
            <View style={styles.promoDecorativeIcon}>
              <Icon name="home" size={54} color="rgba(253, 176, 34, 0.15)" />
            </View>
          </TouchableOpacity>

          {/* Promo Card 2: Rent Pay on Credit Card */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.promoCard, { backgroundColor: '#1E1B4B' }]}
            onPress={() => navigation.navigate('PayRent')}
          >
            <View style={styles.promoContent}>
              <View style={[styles.promoChip, { borderColor: '#818CF8' }]}>
                <Icon name="sparkles" size={11} color="#A5B4FC" />
                <Text style={[styles.promoChipText, { color: '#C7D2FE' }]}>REWARDS PROGRAM</Text>
              </View>
              <Text style={styles.promoHeading}>Pay Rent via Credit Card</Text>
              <Text style={styles.promoDesc}>
                Get 45 days interest-free credit and earn up to 2% cashback with instant rent receipt.
              </Text>
              <View style={[styles.promoActionButton, { backgroundColor: '#818CF8' }]}>
                <Text style={[styles.promoActionText, { color: '#FFFFFF' }]}>Pay Rent Now</Text>
                <Icon name="arrow-right" size={13} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.promoDecorativeIcon}>
              <Icon name="credit-card" size={54} color="rgba(129, 140, 248, 0.2)" />
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Popular Localities Chips */}
        <View style={styles.sectionContainer}>
          <SectionHeading
            title={`Top Localities in ${selectedCity}`}
            subtitle="Explore highest demand rental and investment hubs"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.localityScroll}
          >
            {currentLocalities.map((loc, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.localityChip}
                onPress={() => handleLocalityPress(loc)}
                activeOpacity={0.7}
              >
                <Icon name="map-pin" size={13} color={colors.primaryDark} />
                <Text style={styles.localityChipText}>{loc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Properties Horizontal Carousel */}
        <View style={styles.sectionContainer}>
          <SectionHeading
            title="Featured Properties"
            subtitle="Handpicked premium residences with video tours"
            onSeeAll={() => navigation.navigate('SearchListings')}
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
                style={{ marginRight: spacing.md }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Trending Rentals */}
        <View style={styles.sectionContainer}>
          <SectionHeading
            title="Trending Rentals"
            subtitle="Top reviewed homes ready for immediate move-in"
            onSeeAll={() => handleQuickCategory('rent', 'residential')}
          />
          <View style={styles.verticalListContainer}>
            {rentalProperties.slice(0, 4).map((prop) => (
              <PropertyCardHorizontal
                key={prop.id}
                property={prop}
                onPress={() =>
                  navigation.navigate('PropertyDetail', {
                    propertyId: prop.id,
                    property: prop,
                  })
                }
              />
            ))}
          </View>
        </View>

        {/* Prime Investment & Buy Properties */}
        <View style={styles.sectionContainer}>
          <SectionHeading
            title="Prime Properties to Buy"
            subtitle="Villas, luxury penthouses & gated societies"
            onSeeAll={() => handleQuickCategory('buy', 'residential')}
          />
          <View style={styles.verticalListContainer}>
            {buyProperties.slice(0, 2).map((prop) => (
              <PropertyCardVertical
                key={prop.id}
                property={prop}
                onPress={() =>
                  navigation.navigate('PropertyDetail', {
                    propertyId: prop.id,
                    property: prop,
                  })
                }
                style={{ marginBottom: spacing.md }}
              />
            ))}
          </View>
        </View>

        {/* Kirayedar24 Trust Metrics */}
        <View style={styles.trustShieldContainer}>
          <View style={styles.trustBadge}>
            <Icon name="shield-check" size={16} color={colors.primary} />
            <Text style={styles.trustBadgeText}>THE KIRAYEDAR24 ASSURANCE</Text>
          </View>
          <Text style={styles.trustTitle}>Why Millions Trust Kirayedar24</Text>
          <Text style={styles.trustSubtitle}>
            Eliminating broker fees, deceptive listings, and paperwork delays.
          </Text>

          <View style={styles.trustStatsGrid}>
            <View style={styles.trustStatCard}>
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Owner Verified</Text>
            </View>
            <View style={styles.trustStatCard}>
              <Text style={styles.statValue}>₹0</Text>
              <Text style={styles.statLabel}>Brokerage Paid</Text>
            </View>
            <View style={styles.trustStatCard}>
              <Text style={styles.statValue}>48h</Text>
              <Text style={styles.statLabel}>Fast Move-in</Text>
            </View>
            <View style={styles.trustStatCard}>
              <Text style={styles.statValue}>4.9 ★</Text>
              <Text style={styles.statLabel}>Tenant Rating</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* City Selector Modal */}
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
          <View style={styles.cityModalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.cityModalTitle}>Select Your City</Text>
              <TouchableOpacity
                onPress={() => setCityModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cityModalSubtitle}>
              Showing verified listings and services in selected city
            </Text>

            <View style={styles.cityGrid}>
              {CITIES.map((c) => {
                const isSelected = selectedCity === c.name;
                return (
                  <TouchableOpacity
                    key={c.name}
                    style={[styles.cityCard, isSelected && styles.cityCardSelected]}
                    onPress={() => {
                      setSelectedCity(c.name);
                      setCityModalVisible(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cityCardLeft}>
                      <View
                        style={[
                          styles.cityIconBox,
                          isSelected && styles.cityIconBoxSelected,
                        ]}
                      >
                        <Icon
                          name="building"
                          size={16}
                          color={isSelected ? colors.primaryDark : '#64748B'}
                        />
                      </View>
                      <View>
                        <Text
                          style={[
                            styles.cityName,
                            isSelected && styles.cityNameSelected,
                          ]}
                        >
                          {c.name}
                        </Text>
                        <Text style={styles.cityState}>{c.state}</Text>
                      </View>
                    </View>
                    {isSelected && (
                      <Icon name="check-circle" size={18} color={colors.primaryDark} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0B0F19',
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingHorizontal: 18,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  logoStyle: {
    marginLeft: -8,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  cityNameText: {
    ...typography.badge,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 90,
  },
  notificationButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  greetingContainer: {
    marginBottom: 16,
  },
  greetingTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  greetingSubtitle: {
    ...typography.bodySmall,
    color: '#94A3B8',
    marginTop: 2,
    fontSize: 13,
  },
  heroSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
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
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(253, 176, 34, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchPlaceholderBox: {
    flex: 1,
  },
  searchMainPlaceholder: {
    ...typography.subtitle,
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '600',
  },
  searchSubPlaceholder: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 11,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 4,
    marginTop: 14,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.caption,
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 12,
  },
  tabTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 36,
  },
  bannerWrapper: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeaderSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleBold: {
    ...typography.h3,
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  seeAllText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
  quickServicesGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  serviceItemCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  serviceBadge: {
    position: 'absolute',
    top: -6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  serviceBadgeText: {
    color: '#FDB022',
    fontSize: 8,
    fontWeight: '800',
  },
  serviceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  serviceTitle: {
    ...typography.subtitle,
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  serviceSubtitle: {
    ...typography.caption,
    color: '#64748B',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  promoCarouselContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 12,
  },
  promoCard: {
    width: SCREEN_WIDTH * 0.88,
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  promoContent: {
    zIndex: 1,
  },
  promoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'rgba(253, 176, 34, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  promoChipText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  promoHeading: {
    ...typography.h3,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  promoDesc: {
    ...typography.bodySmall,
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
    paddingRight: 40,
  },
  promoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  promoActionText: {
    ...typography.badge,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 12,
  },
  promoDecorativeIcon: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    zIndex: 0,
  },
  localityScroll: {
    gap: 8,
    paddingTop: 6,
  },
  localityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  localityChipText: {
    ...typography.caption,
    color: '#1E293B',
    fontWeight: '600',
    fontSize: 12,
  },
  horizontalPropertiesList: {
    paddingTop: 4,
  },
  verticalListContainer: {
    gap: 12,
    marginTop: 4,
  },
  trustShieldContainer: {
    margin: 16,
    marginTop: 28,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(253, 176, 34, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.3)',
    marginBottom: 10,
  },
  trustBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  trustTitle: {
    ...typography.h3,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  trustSubtitle: {
    ...typography.bodySmall,
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  trustStatsGrid: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  trustStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statValue: {
    ...typography.h3,
    color: colors.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  statLabel: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  cityModalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '75%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cityModalTitle: {
    ...typography.h2,
    fontSize: 20,
    color: '#0F172A',
    fontWeight: '800',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityModalSubtitle: {
    ...typography.bodySmall,
    color: '#64748B',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 18,
  },
  cityGrid: {
    gap: 10,
  },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  cityCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(253, 176, 34, 0.08)',
  },
  cityCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cityIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityIconBoxSelected: {
    backgroundColor: colors.primary,
  },
  cityName: {
    ...typography.subtitle,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  cityNameSelected: {
    color: colors.primaryDark,
  },
  cityState: {
    ...typography.caption,
    fontSize: 11,
    color: '#64748B',
  },
});
