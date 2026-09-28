import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import { useAuth } from '../../context/AuthContext';
import { useProperty } from '../../context/PropertyContext';
import { useBooking } from '../../context/BookingContext';
import { useNotification } from '../../context/NotificationContext';
import { useChat } from '../../context/ChatContext';
import { RoleSwitchBanner } from '../../components/common/RoleSwitchBanner';
import { SectionHeading } from '../../components/common/SectionHeading';
import { PropertyCardHorizontal } from '../../components/property/PropertyCardHorizontal';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { AppLogo } from '../../components/common/AppLogo';
import { HomeDrawer } from '../../components/common/HomeDrawer';
import { HomePromoCarousel, HomePromo } from '../../components/common/HomePromoCarousel';
import { ContactUnlockModal } from '../../components/common/ContactUnlockModal';
import { propertyService } from '../../services/propertyService';
import { isSubscriptionActive } from '../../services/subscriptionService';
import { Property } from '../../types/property';
import { PropertyCardVertical } from '../../components/property/PropertyCardVertical';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OWNER_HOME_PROMOS: HomePromo[] = [
  {
    eyebrow: 'DEMO OWNER WORKSPACE',
    title: 'Manage your listings',
    description: 'Sample property records are shown until the owner API is connected.',
    actionLabel: 'Add a property',
    icon: 'building',
  },
  {
    eyebrow: 'LISTING PLANS',
    title: 'Plan billing is not live',
    description: 'Review the separate owner listing plans; payment activation is pending backend setup.',
    actionLabel: 'View plans',
    icon: 'award',
  },
  {
    eyebrow: 'RENT WORKSPACE',
    title: 'Open rent tools',
    description: 'Payment and receipt examples in this build are demo data.',
    actionLabel: 'Pay rent',
    icon: 'credit-card',
  },
];


export const OwnerHomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, toggleRole } = useAuth();
  const { properties, isRefreshing, refreshProperties } = useProperty();
  const { activeSubscription, bookings } = useBooking();
  const { unreadCount: notificationUnread } = useNotification();
  const { unreadCount: chatUnread } = useChat();

  const [ownerProperties, setOwnerProperties] = useState<Property[]>([]);
  const [ownerPropertiesLoading, setOwnerPropertiesLoading] = useState(true);
  const [ownerPropertiesError, setOwnerPropertiesError] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [contactProperty, setContactProperty] = useState<Property | null>(null);

  const loadOwnerProperties = useCallback(async () => {
    if (!user?.id) {
      setOwnerProperties([]);
      setOwnerPropertiesLoading(false);
      return;
    }
    setOwnerPropertiesLoading(true);
    setOwnerPropertiesError(null);
    try {
      const result = await propertyService.getUserProperties(user.id, properties);
      setOwnerProperties(result);
    } catch {
      setOwnerPropertiesError('Could not load your properties. Pull to refresh or retry.');
    } finally {
      setOwnerPropertiesLoading(false);
    }
  }, [properties, user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadOwnerProperties();
    }, [loadOwnerProperties])
  );

  const handleRefresh = async () => {
    await refreshProperties();
    await loadOwnerProperties();
  };

  const activeListings = ownerProperties.filter((p) => p.approvalSource === 'backend' && p.status === 'published');
  const underReviewListings = ownerProperties.filter((p) => p.status === 'under_review');
  const draftListings = ownerProperties.filter((p) => p.status === 'draft');
  const totalInquiries = ownerProperties.reduce((acc, p) => acc + (p.inquiriesCount || 0), 0);
  const hasActiveListingPlan = isSubscriptionActive(activeSubscription);
  const discoveryResidential = properties.filter((property) =>
    property.status === 'published' && property.category === 'residential'
  );
  const discoveryCommercial = properties.filter((property) =>
    property.status === 'published' && property.category === 'commercial'
  );

  const handleDiscoveryContact = async (property: Property) => {
    const entitlement = await propertyService.checkContactEntitlement(property.id);
    if (!entitlement.allowed) setContactProperty(property);
  };

  const upcomingVisits = [
    {
      id: 'visit-1',
      visitorName: 'Ananya Roy',
      phone: '+91 98450 99881',
      propertyTitle: ownerProperties[0]?.title || 'Indiranagar 3 BHK Penthouse',
      date: 'Sat, 27 Sep 2026',
      timeSlot: '11:30 AM',
      status: 'Confirmed',
    },
    {
      id: 'visit-2',
      visitorName: 'Karan Mehra',
      phone: '+91 99112 33445',
      propertyTitle: ownerProperties[1]?.title || 'HSR Layout 2 BHK Apartment',
      date: 'Sun, 28 Sep 2026',
      timeSlot: '04:00 PM',
      status: 'Pending',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      {/* Top Luxury Dark Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerTopRow}>
          <AppLogo width={Math.min(135, SCREEN_WIDTH * 0.35)} height={48} variant="light" style={styles.logoStyle} />

          <View style={styles.headerActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDrawerVisible(true)}
              style={styles.bellButton}
              accessibilityRole="button"
              accessibilityLabel="Open navigation menu"
            >
              <Icon name="list" size={19} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('SearchListings', { focusSearch: true })}
              style={styles.bellButton}
              accessibilityRole="button"
              accessibilityLabel="Search properties"
            >
              <Icon name="search" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Chat button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ChatList')}
              style={styles.bellButton}
              accessibilityRole="button"
              accessibilityLabel={`Chat. ${chatUnread} unread.`}
            >
              <Icon name="chat" size={18} color="#FFFFFF" />
              {chatUnread > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{chatUnread > 9 ? '9+' : chatUnread}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Notifications */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('NotificationList')}
              style={styles.bellButton}
              accessibilityRole="button"
              accessibilityLabel={`Notifications. ${notificationUnread} unread.`}
            >
              <Icon name="bell" size={18} color="#FFFFFF" />
              {notificationUnread > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {notificationUnread > 9 ? '9+' : notificationUnread}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.welcomeRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.ownerBadgePill}>
              <Icon name="award" size={12} color={colors.primary} />
              <Text style={styles.ownerBadgeText}>OWNER CONSOLE · DEMO DATA</Text>
            </View>
            <Text style={styles.ownerName}>
              Welcome, {user?.name ? user.name.split(' ')[0] : 'Owner'} 👑
            </Text>
            <Text style={styles.ownerSubtitle}>
              Manage verified properties, tenant inquiries & visits
            </Text>
          </View>

          <TouchableOpacity
            style={styles.quickAddPill}
            onPress={() => navigation.navigate('AddEditProperty')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Add New Property Listing"
          >
            <Icon name="plus" size={14} color="#0F172A" strokeWidth={3} />
            <Text style={styles.quickAddText}>Add Property</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primaryDark]}
          />
        }
      >
        {/* Role Switch Testing Banner */}
        <View style={styles.bannerContainer}>
          <RoleSwitchBanner />
        </View>

        <HomePromoCarousel
          promos={OWNER_HOME_PROMOS}
          onAction={(index) => {
            if (index === 0) navigation.navigate('AddEditProperty');
            else if (index === 1) navigation.navigate('Subscription');
            else navigation.navigate('PayRent');
          }}
        />

        {/* 4 Core Metrics Grid */}
        <View style={styles.metricsGrid}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MyProperties', { filterStatus: 'published' })}
            style={styles.metricCard}
          >
            <View style={[styles.metricIcon, { backgroundColor: '#DCFCE7' }]}>
              <Icon name="check-circle" size={18} color="#166534" />
            </View>
            <Text style={styles.metricValue}>{activeListings.length}</Text>
            <Text style={styles.metricLabel}>Active Listings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MyProperties', { filterStatus: 'under_review' })}
            style={styles.metricCard}
          >
            <View style={[styles.metricIcon, { backgroundColor: '#FEF0C7' }]}>
              <Icon name="clock" size={18} color="#B54708" />
            </View>
            <Text style={styles.metricValue}>{underReviewListings.length}</Text>
            <Text style={styles.metricLabel}>Under Review</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PropertyInquiries')}
            style={styles.metricCard}
          >
            <View style={[styles.metricIcon, { backgroundColor: '#E0F2FE' }]}>
              <Icon name="chat" size={18} color="#0369A1" />
            </View>
            <Text style={styles.metricValue}>{totalInquiries}</Text>
            <Text style={styles.metricLabel}>Tenant Leads</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Subscription')}
            style={styles.metricCard}
          >
            <View style={[styles.metricIcon, { backgroundColor: '#F3E8FF' }]}>
              <Icon name="award" size={18} color="#6B21A8" />
            </View>
            <Text style={styles.metricValue} numberOfLines={1}>{hasActiveListingPlan ? activeSubscription?.name : 'No active'}</Text>
            <Text style={styles.metricLabel}>Listing plan</Text>
          </TouchableOpacity>
        </View>

        {/* Add Property Banner CTA */}
        <View style={styles.addPropertyCard}>
          <View style={styles.addPropertyText}>
            <View style={styles.addBadge}>
              <Text style={styles.addBadgeText}>0% BROKERAGE DIRECT</Text>
            </View>
            <Text style={styles.addPropertyTitle}>Have a Property to Rent or Sell?</Text>
            <Text style={styles.addPropertySubtitle}>
              List in 5 simple steps. Connect directly with thousands of verified tenants & buyers.
            </Text>
            <Button
              title="+ Post New Property Free"
              variant="primary"
              size="md"
              onPress={() => navigation.navigate('AddEditProperty')}
              style={styles.addBtn}
            />
          </View>
          <View style={styles.addPropertyIcon}>
            <Icon name="building" size={42} color={colors.primary} strokeWidth={1.75} />
          </View>
        </View>

        {/* Subscription Booster Card */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Subscription')} style={styles.boosterCard}>
          <View style={styles.boosterLeft}>
            <View style={styles.boosterBadge}>
              <Icon name="sparkles" size={12} color={colors.primaryDark} />
              <Text style={styles.boosterBadgeText}>{hasActiveListingPlan ? 'Listing plan active' : 'No verified listing plan'}</Text>
            </View>
            <Text style={styles.boosterTitle}>{hasActiveListingPlan ? activeSubscription?.name : 'Owner listing plans'}</Text>
            <Text style={styles.boosterSubtitle}>
              {hasActiveListingPlan ? `Plan expires ${new Date(activeSubscription!.expiresAt!).toLocaleDateString()}.` : 'Demo plan selection does not activate billing or change listing status.'}
            </Text>
          </View>
          <View style={styles.boosterAction}>
            <Text style={styles.boosterManage}>Manage Plan →</Text>
          </View>
        </TouchableOpacity>

        {/* My Properties Preview Section */}
        <View style={styles.sectionContainer}>
          <SectionHeading
            title="My Property Listings"
            subtitle="Demo records only; publication requires backend approval"
            onSeeAll={() => navigation.navigate('MyProperties')}
          />
          {ownerPropertiesLoading ? (
            <View style={styles.propertyLoadState}>
              <Text style={styles.propertyLoadText}>Loading your properties…</Text>
            </View>
          ) : ownerPropertiesError ? (
            <View style={styles.propertyLoadState}>
              <Text style={styles.propertyErrorText}>{ownerPropertiesError}</Text>
              <TouchableOpacity onPress={loadOwnerProperties} style={styles.retryButton} accessibilityRole="button">
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : ownerProperties.length > 0 ? (
            <View style={styles.propertiesList}>
              {ownerProperties.map((prop) => (
                <PropertyCardHorizontal
                  key={prop.id}
                  property={prop}
                  showStatusBadge
                  onPress={() =>
                    navigation.navigate('PropertyDetail', {
                      propertyId: prop.id,
                      property: prop,
                    })
                  }
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Icon name="building" size={32} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No demo properties found</Text>
              <Text style={styles.emptySub}>
                New listings stay in review until an approved backend status is available.
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('AddEditProperty')}
              >
                <Text style={styles.emptyBtnText}>Post First Property</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <SectionHeading
            title="Residential homes"
            subtitle="Sample buyer and tenant discovery listings"
            onSeeAll={() => navigation.navigate('SearchListings', { initialFilter: { category: 'residential' } })}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.discoveryRow}>
            {discoveryResidential.slice(0, 5).map((property) => (
              <PropertyCardVertical
                key={`owner-residential-${property.id}`}
                property={property}
                cardWidth={SCREEN_WIDTH * 0.72}
                onPress={() => navigation.navigate('PropertyDetail', { propertyId: property.id, property })}
                onContactPress={() => handleDiscoveryContact(property)}
                style={{ marginRight: spacing.md }}
              />
            ))}
            {discoveryResidential.length === 0 && <Text style={styles.discoveryEmpty}>No sample residential listings.</Text>}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <SectionHeading
            title="Commercial spaces"
            subtitle="Sample office and retail discovery listings"
            onSeeAll={() => navigation.navigate('SearchListings', { initialFilter: { category: 'commercial' } })}
          />
          <View style={styles.propertiesList}>
            {discoveryCommercial.slice(0, 3).map((property) => (
              <PropertyCardHorizontal
                key={`owner-commercial-${property.id}`}
                property={property}
                onPress={() => navigation.navigate('PropertyDetail', { propertyId: property.id, property })}
                onContactPress={() => handleDiscoveryContact(property)}
              />
            ))}
            {discoveryCommercial.length === 0 && <Text style={styles.discoveryEmpty}>No sample commercial listings.</Text>}
          </View>
        </View>

        {/* Recent Inquiries & Tenant Leads */}
        <View style={styles.sectionContainer}>
          <SectionHeading
            title="Recent Tenant Leads"
            subtitle="Sample inquiry records · not connected to a live inbox"
            onSeeAll={() => navigation.navigate('PropertyInquiries')}
          />
          <View style={styles.inquiriesContainer}>
            {[
              {
                id: 'inq-1',
                name: 'Ananya Roy',
                phone: '+91 98450 99881',
                property: ownerProperties[0]?.title || 'Indiranagar 3 BHK Penthouse',
                message: 'Looking to schedule a visit this Saturday for your Indiranagar property.',
                time: '25m ago',
              },
              {
                id: 'inq-2',
                name: 'Karan Mehra',
                phone: '+91 99112 33445',
                property: ownerProperties[1]?.title || 'HSR Layout 2 BHK Apartment',
                message: 'Is the 2 BHK apartment available for bachelor software professionals?',
                time: '2h ago',
              },
            ].map((inq) => (
              <View key={inq.id} style={styles.inquiryCard}>
                <View style={styles.inquiryHeader}>
                  <View style={styles.inquiryAvatar}>
                    <Text style={styles.avatarInitial}>{inq.name[0]}</Text>
                  </View>
                  <View style={styles.inquiryMeta}>
                    <Text style={styles.inquiryName}>{inq.name}</Text>
                    <Text style={styles.inquiryProperty} numberOfLines={1}>{inq.property}</Text>
                  </View>
                  <Text style={styles.inquiryTime}>{inq.time}</Text>
                </View>
                <Text style={styles.inquiryMessage}>"{inq.message}"</Text>
                <View style={styles.inquiryActionsRow}>
                  <TouchableOpacity
                    style={styles.inquiryActionBtn}
                    onPress={() =>
                      navigation.navigate('ChatList')
                    }
                  >
                    <Icon name="chat" size={14} color={colors.primaryDark} />
                    <Text style={styles.inquiryActionText}>Reply in Chat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inquiryActionBtn, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}
                    onPress={() => Alert.alert('Contact Lead', `Calling ${inq.name} at ${inq.phone}`)}
                  >
                    <Icon name="phone" size={14} color="#166534" />
                    <Text style={[styles.inquiryActionText, { color: '#166534' }]}>Call Lead</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Property Visits */}
        <View style={styles.sectionContainer}>
          <SectionHeading
            title="Scheduled Property Visits"
            subtitle="Sample visit records · not connected to a live booking service"
          />
          <View style={styles.visitsList}>
            {upcomingVisits.map((v) => (
              <View key={v.id} style={styles.visitCard}>
                <View style={styles.visitDateBox}>
                  <Icon name="calendar" size={16} color={colors.primaryDark} />
                  <Text style={styles.visitDateText}>{v.date.split(',')[0]}</Text>
                  <Text style={styles.visitTimeText}>{v.timeSlot}</Text>
                </View>
                <View style={styles.visitInfo}>
                  <View style={styles.visitStatusBadge}>
                    <Text style={styles.visitStatusBadgeText}>{v.status}</Text>
                  </View>
                  <Text style={styles.visitorName}>{v.visitorName}</Text>
                  <Text style={styles.visitProperty} numberOfLines={1}>{v.propertyTitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Owner Quick Tools Hub */}
        <View style={styles.sectionContainer}>
          <SectionHeading
            title="Owner Management Tools"
            subtitle="Everything needed to manage rentals & tenancy"
          />
          <View style={styles.toolsGrid}>
            {[
              { id: 'add', title: 'Post Property', sub: 'Instant Listing', icon: 'plus', bg: '#FEF3C7', color: '#B45309', action: () => navigation.navigate('AddEditProperty') },
              { id: 'agreement', title: 'Rent Agreement', sub: 'Legal E-Stamp', icon: 'shield-check', bg: '#ECFDF3', color: '#027A48', action: () => navigation.navigate('ServicesCatalog') },
              { id: 'inquiries', title: 'Tenant Leads', sub: 'View Inquiries', icon: 'chat', bg: '#E0F2FE', color: '#0369A1', action: () => navigation.navigate('PropertyInquiries') },
              { id: 'switch', title: 'Browse as Tenant', sub: 'Explore Homes', icon: 'home', bg: '#F3E8FF', color: '#6B21A8', action: toggleRole },
            ].map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={styles.toolCard}
                onPress={tool.action}
                activeOpacity={0.8}
              >
                <View style={[styles.toolIconCircle, { backgroundColor: tool.bg }]}>
                  <Icon name={tool.icon as any} size={20} color={tool.color} />
                </View>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolSubtitle}>{tool.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <HomeDrawer
        visible={drawerVisible}
        role="owner"
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
  topHeader: {
    backgroundColor: '#0B0F19',
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
    marginLeft: -4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ownerBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(253, 176, 34, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.3)',
    gap: 5,
  },
  ownerBadgeText: {
    ...typography.badge,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
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
  notificationBadgeText: {
    ...typography.badge,
    fontSize: 9,
    color: '#0F172A',
    fontWeight: '800',
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ownerName: {
    ...typography.h2,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  ownerSubtitle: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  quickAddPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 5,
  },
  quickAddText: {
    ...typography.subtitle,
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricValue: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLabel: {
    ...typography.caption,
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '600',
  },
  addPropertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.25)',
  },
  addPropertyText: {
    flex: 1,
    paddingRight: 10,
  },
  addBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(253, 176, 34, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.3)',
  },
  addBadgeText: {
    ...typography.badge,
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  addPropertyTitle: {
    ...typography.subtitle,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  addPropertySubtitle: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  addBtn: {
    alignSelf: 'flex-start',
  },
  addPropertyIcon: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boosterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  boosterLeft: {
    flex: 1,
    paddingRight: 8,
  },
  boosterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  boosterBadgeText: {
    ...typography.badge,
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '800',
  },
  boosterTitle: {
    ...typography.subtitle,
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  boosterSubtitle: {
    ...typography.caption,
    color: '#B45309',
    fontSize: 11,
    marginTop: 2,
  },
  boosterAction: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  boosterManage: {
    ...typography.badge,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 11,
  },
  sectionContainer: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  propertyLoadState: {
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  propertyLoadText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  propertyErrorText: {
    ...typography.bodySmall,
    color: colors.danger,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.darkText,
  },
  propertiesList: {
    marginTop: 4,
  },
  discoveryRow: {
    paddingVertical: spacing.xs,
    paddingLeft: spacing.lg,
  },
  discoveryEmpty: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    ...typography.subtitle,
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkText,
    marginTop: 8,
    marginBottom: 4,
  },
  emptySub: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  emptyBtnText: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  inquiriesContainer: {
    gap: 10,
    marginTop: 4,
  },
  inquiryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  inquiryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inquiryAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    marginRight: 10,
  },
  avatarInitial: {
    ...typography.subtitle,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  inquiryMeta: {
    flex: 1,
  },
  inquiryName: {
    ...typography.subtitle,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  inquiryProperty: {
    ...typography.caption,
    color: '#64748B',
    fontSize: 11,
  },
  inquiryTime: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 10,
  },
  inquiryMessage: {
    ...typography.bodyMedium,
    color: '#334155',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 10,
  },
  inquiryActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inquiryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primarySubtle,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  inquiryActionText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 11,
  },
  visitsList: {
    gap: 10,
    marginTop: 4,
  },
  visitCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    ...shadows.sm,
  },
  visitDateBox: {
    width: 80,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 12,
  },
  visitDateText: {
    ...typography.caption,
    fontWeight: '800',
    color: '#0F172A',
    fontSize: 11,
    marginTop: 2,
  },
  visitTimeText: {
    ...typography.caption,
    color: '#64748B',
    fontSize: 10,
  },
  visitInfo: {
    flex: 1,
  },
  visitStatusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 2,
  },
  visitStatusBadgeText: {
    ...typography.badge,
    fontSize: 9,
    color: '#166534',
    fontWeight: '700',
  },
  visitorName: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  visitProperty: {
    ...typography.caption,
    color: '#64748B',
    fontSize: 11,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  toolCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  toolIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  toolTitle: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  toolSubtitle: {
    ...typography.caption,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
});
