import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
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
import { useBooking } from '../../context/BookingContext';
import { useNotification } from '../../context/NotificationContext';
import { RoleSwitchBanner } from '../../components/common/RoleSwitchBanner';
import { SectionHeading } from '../../components/common/SectionHeading';
import { PropertyCardHorizontal } from '../../components/property/PropertyCardHorizontal';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { AppLogo } from '../../components/common/AppLogo';

export const OwnerHomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { myProperties } = useProperty();
  const { activeSubscription } = useBooking();
  const { unreadCount } = useNotification();

  const activeCount = myProperties.filter((p) => p.status === 'published').length;
  const underReviewCount = myProperties.filter((p) => p.status === 'under_review').length;
  const totalInquiries = myProperties.reduce((acc, p) => acc + (p.inquiriesCount || 0), 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      {/* Top Luxury Dark Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerTopRow}>
          <AppLogo width={135} height={50} variant="light" style={styles.logoStyle} />

          <View style={styles.headerActions}>
            <View style={styles.ownerBadgePill}>
              <Icon name="award" size={12} color={colors.primary} />
              <Text style={styles.ownerBadgeText}>OWNER CONSOLE</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('NotificationList')}
              style={styles.bellButton}
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

        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.ownerName}>
              Welcome, {user?.name ? user.name.split(' ')[0] : 'Owner'} 👑
            </Text>
            <Text style={styles.ownerSubtitle}>
              Manage your listings, inquiries and rent payouts
            </Text>
          </View>

          <TouchableOpacity
            style={styles.quickAddPill}
            onPress={() => navigation.navigate('AddEditProperty')}
            activeOpacity={0.85}
          >
            <Icon name="plus" size={14} color="#0F172A" strokeWidth={3} />
            <Text style={styles.quickAddText}>Add Property</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Role Switch Testing Banner */}
        <View style={styles.bannerContainer}>
          <RoleSwitchBanner />
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MyProperties', { filterStatus: 'published' })}
            style={styles.metricCard}
          >
            <View style={[styles.metricIcon, { backgroundColor: '#DCFCE7' }]}>
              <Icon name="check-circle" size={18} color="#166534" />
            </View>
            <Text style={styles.metricValue}>{activeCount}</Text>
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
            <Text style={styles.metricValue}>{underReviewCount}</Text>
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
            <Text style={styles.metricLabel}>Total Inquiries</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Subscription')}
            style={styles.metricCard}
          >
            <View style={[styles.metricIcon, { backgroundColor: '#F3E8FF' }]}>
              <Icon name="award" size={18} color="#6B21A8" />
            </View>
            <Text style={styles.metricValue}>Gold Pro</Text>
            <Text style={styles.metricLabel}>Active Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Add Property Hero Banner */}
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
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Subscription')}
          style={styles.boosterCard}
        >
          <View style={styles.boosterLeft}>
            <View style={styles.boosterBadge}>
              <Icon name="sparkles" size={12} color={colors.primaryDark} />
              <Text style={styles.boosterBadgeText}>Listing Booster</Text>
            </View>
            <Text style={styles.boosterTitle}>{activeSubscription.name}</Text>
            <Text style={styles.boosterSubtitle}>
              Get 5x more verified inquiries with top-of-search placement.
            </Text>
          </View>
          <View style={styles.boosterAction}>
            <Text style={styles.boosterManage}>Manage Plan →</Text>
          </View>
        </TouchableOpacity>

        {/* My Properties List */}
        <View style={styles.sectionContainer}>
          <SectionHeading
            title="My Property Listings"
            subtitle="Manage, edit or track status of your listings"
            onSeeAll={() => navigation.navigate('MyProperties')}
          />
          <View style={styles.propertiesList}>
            {myProperties.map((prop) => (
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
        </View>

        {/* Recent Inquiries Section */}
        <View style={styles.sectionContainer}>
          <SectionHeading
            title="Recent Inquiries"
            subtitle="Prospective tenants waiting for response"
            onSeeAll={() => navigation.navigate('PropertyInquiries')}
          />
          <View style={styles.inquiriesContainer}>
            {[
              {
                id: 'inq-1',
                name: 'Ananya Roy',
                phone: '+91 98450 99881',
                message: 'Looking to schedule a visit this Saturday for Indiranagar Penthouse.',
                time: '25m ago',
              },
              {
                id: 'inq-2',
                name: 'Karan Mehra',
                phone: '+91 99112 33445',
                message: 'Is the 2 BHK apartment in HSR Layout available for bachelor professionals?',
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
                    <Text style={styles.inquiryPhone}>{inq.phone} • {inq.time}</Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('ChatList')}
                    style={styles.replyBtn}
                  >
                    <Text style={styles.replyBtnText}>Reply</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.inquiryMessage}>{inq.message}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ownerBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(253, 176, 34, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.25)',
  },
  ownerBadgeText: {
    ...typography.badge,
    fontSize: 10,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bellButton: {
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
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  ownerName: {
    ...typography.h2,
    fontSize: 18,
    color: '#FFFFFF',
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
    borderRadius: 16,
    gap: 5,
  },
  quickAddText: {
    ...typography.badge,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 12,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  addPropertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 18,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addPropertyText: {
    flex: 1,
    marginRight: spacing.md,
  },
  addBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(253, 176, 34, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.3)',
    marginBottom: 8,
  },
  addBadgeText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
  },
  addPropertyTitle: {
    ...typography.h3,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  addPropertySubtitle: {
    ...typography.caption,
    color: '#94A3B8',
    lineHeight: 16,
    marginBottom: 12,
  },
  addBtn: {
    alignSelf: 'flex-start',
    borderRadius: 10,
  },
  addPropertyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(253, 176, 34, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricValue: {
    ...typography.h2,
    fontSize: 20,
    color: '#0F172A',
    fontWeight: '800',
    marginBottom: 2,
  },
  metricLabel: {
    ...typography.caption,
    color: '#64748B',
    fontWeight: '600',
    fontSize: 12,
  },
  boosterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  boosterLeft: {
    flex: 1,
  },
  boosterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  boosterBadgeText: {
    ...typography.badge,
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  boosterTitle: {
    ...typography.subtitle,
    fontSize: 14,
    fontWeight: '700',
    color: '#78350F',
  },
  boosterSubtitle: {
    ...typography.caption,
    color: '#92400E',
    lineHeight: 15,
    marginTop: 2,
    fontSize: 11,
  },
  boosterAction: {
    paddingLeft: spacing.sm,
  },
  boosterManage: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  propertiesList: {
    gap: 12,
  },
  inquiriesContainer: {
    gap: 10,
  },
  inquiryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
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
    backgroundColor: 'rgba(253, 176, 34, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitial: {
    ...typography.subtitle,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  inquiryMeta: {
    flex: 1,
  },
  inquiryName: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  inquiryPhone: {
    ...typography.caption,
    color: '#64748B',
    fontSize: 11,
  },
  replyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  replyBtnText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  inquiryMessage: {
    ...typography.bodySmall,
    color: '#334155',
    lineHeight: 18,
    fontSize: 13,
  },
});
