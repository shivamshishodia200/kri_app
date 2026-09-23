import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
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
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Icon, IconName } from '../../components/common/Icon';

interface MenuItem {
  id: string;
  icon: IconName;
  title: string;
  subtitle?: string;
  badge?: string;
  onPress: () => void;
  isDestructive?: boolean;
}

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, role, toggleRole, logout } = useAuth();
  const { shortlistedIds, myProperties } = useProperty();
  const { bookings } = useBooking();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const isOwner = role === 'owner';

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Activity & Shortcuts',
      items: [
        ...(isOwner
          ? [
              {
                id: 'my-listings',
                icon: 'building' as IconName,
                title: 'My Property Listings',
                subtitle: `${myProperties.length} active and draft listings`,
                onPress: () => navigation.navigate('MyProperties'),
              },
              {
                id: 'inquiries',
                icon: 'chat' as IconName,
                title: 'Tenant Leads & Inquiries',
                onPress: () => navigation.navigate('PropertyInquiries'),
              },
              {
                id: 'subscription',
                icon: 'award' as IconName,
                title: 'Owner Subscription Plans',
                subtitle: 'Gold Pro Booster Active',
                badge: 'PRO',
                onPress: () => navigation.navigate('Subscription'),
              },
            ]
          : [
              {
                id: 'saved',
                icon: 'heart' as IconName,
                title: 'Shortlisted Properties',
                subtitle: `${shortlistedIds.length} saved homes`,
                onPress: () => navigation.navigate('Shortlisted'),
              },
              {
                id: 'bookings',
                icon: 'calendar' as IconName,
                title: 'My Service Appointments',
                subtitle: `${bookings.length} services booked`,
                onPress: () => navigation.navigate('MyBookings'),
              },
              {
                id: 'pay-rent',
                icon: 'credit-card' as IconName,
                title: 'Pay Rent & Receipts',
                subtitle: 'Earn 1.5% instant cashback',
                onPress: () => navigation.navigate('PayRent'),
              },
            ]),
        {
          id: 'referral',
          icon: 'sparkles' as IconName,
          title: 'Refer & Earn ₹500',
          subtitle: `Invite Code: ${user?.referralCode || 'KIRAYE24'}`,
          badge: 'Reward',
          onPress: () => navigation.navigate('Referral'),
        },
      ],
    },
    {
      title: 'Account & Security',
      items: [
        {
          id: 'edit-profile',
          icon: 'user' as IconName,
          title: 'Edit Personal Profile',
          subtitle: 'Update name, mobile, email and address',
          onPress: () => navigation.navigate('EditProfile'),
        },
        {
          id: 'password',
          icon: 'lock' as IconName,
          title: 'Change Password',
          onPress: () => navigation.navigate('ChangePassword'),
        },
        {
          id: 'settings',
          icon: 'settings' as IconName,
          title: 'App Settings & Notifications',
          onPress: () => navigation.navigate('Settings'),
        },
        {
          id: 'privacy',
          icon: 'shield-check' as IconName,
          title: 'Privacy & Security Center',
          onPress: () => navigation.navigate('PrivacySecurity'),
        },
      ],
    },
    {
      title: 'Support & Legal',
      items: [
        {
          id: 'help',
          icon: 'help' as IconName,
          title: 'Help Center & FAQs',
          onPress: () => navigation.navigate('HelpFaq'),
        },
        {
          id: 'contact',
          icon: 'phone' as IconName,
          title: 'Contact Support Team',
          subtitle: 'Available 9 AM - 9 PM daily',
          onPress: () => navigation.navigate('ContactUs'),
        },
        {
          id: 'about',
          icon: 'info' as IconName,
          title: 'About Kirayedar24',
          subtitle: 'v1.0.0 • Verified Marketplace',
          onPress: () => navigation.navigate('About'),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

      {/* Top Luxury Midnight Header */}
      <View style={styles.header}>
        <View style={styles.profileHeroRow}>
          {/* User Avatar with Glowing Gold Ring */}
          <View style={styles.avatarGlowContainer}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'KZ'}
                </Text>
              </View>
            )}
            <View style={styles.verifiedBadge}>
              <Icon name="check" size={11} color="#0F172A" strokeWidth={3} />
            </View>
          </View>

          {/* User Details */}
          <View style={styles.userInfoCol}>
            <View style={styles.memberTag}>
              <Icon name="award" size={11} color={colors.primary} />
              <Text style={styles.memberTagText}>
                {isOwner ? 'VERIFIED LANDLORD' : 'VERIFIED RESIDENT'}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.name || 'Resident User'}</Text>
            <Text style={styles.userContact}>{user?.phone || '+91 98765 43210'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@kirayedar24.com'}</Text>
          </View>

          {/* Edit Profile Action */}
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.8}
          >
            <Icon name="edit" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Dynamic Mode Switcher Bar */}
        <TouchableOpacity
          style={styles.modeSwitchCard}
          onPress={toggleRole}
          activeOpacity={0.85}
        >
          <View style={styles.modeSwitchLeft}>
            <View style={styles.modeIconCircle}>
              <Icon
                name={isOwner ? 'home' : 'building'}
                size={18}
                color={colors.primaryDark}
              />
            </View>
            <View>
              <Text style={styles.modeSwitchTitle}>
                {isOwner ? 'Switch to Buyer / Tenant' : 'Switch to Owner / Landlord'}
              </Text>
              <Text style={styles.modeSwitchSubtitle}>
                {isOwner
                  ? 'Browse and search verified homes'
                  : 'Manage listings and tenant leads'}
              </Text>
            </View>
          </View>

          <View style={styles.switchPill}>
            <Text style={styles.switchPillText}>Switch</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => (isOwner ? navigation.navigate('MyProperties') : navigation.navigate('Shortlisted'))}
            activeOpacity={0.8}
          >
            <Text style={styles.statValue}>
              {isOwner ? myProperties.length : shortlistedIds.length}
            </Text>
            <Text style={styles.statLabel}>{isOwner ? 'My Listings' : 'Shortlisted'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statBox}
            onPress={() => navigation.navigate('ChatList')}
            activeOpacity={0.8}
          >
            <Text style={styles.statValue}>
              {isOwner
                ? myProperties.reduce((acc, p) => acc + (p.inquiriesCount || 0), 0)
                : bookings.length}
            </Text>
            <Text style={styles.statLabel}>{isOwner ? 'Leads' : 'Bookings'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statBox}
            onPress={() => navigation.navigate('Referral')}
            activeOpacity={0.8}
          >
            <Text style={styles.statValue}>₹500</Text>
            <Text style={styles.statLabel}>Reward Cash</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuRow,
                    idx < section.items.length - 1 && styles.menuRowBorder,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuRowLeft}>
                    <View style={styles.menuIconContainer}>
                      <Icon name={item.icon} size={18} color="#0F172A" />
                    </View>
                    <View style={styles.menuTextContainer}>
                      <Text style={styles.menuItemTitle}>{item.title}</Text>
                      {item.subtitle && (
                        <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.menuRowRight}>
                    {item.badge && (
                      <View style={styles.menuBadge}>
                        <Text style={styles.menuBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Icon name="chevron-right" size={14} color="#94A3B8" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Log Out CTA */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setLogoutModalVisible(true)}
          activeOpacity={0.8}
        >
          <Icon name="logout" size={18} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Log Out from Account</Text>
        </TouchableOpacity>

        <Text style={styles.versionFooter}>Kirayedar24 • Version 1.0.0 (Production Build)</Text>
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={logoutModalVisible}
        title="Log Out?"
        message="Are you sure you want to log out from Kirayedar24 on this device?"
        confirmTitle="Log Out"
        cancelTitle="Cancel"
        confirmVariant="danger"
        icon="logout"
        onConfirm={async () => {
          setLogoutModalVisible(false);
          await logout();
        }}
        onClose={() => setLogoutModalVisible(false)}
      />
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
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarGlowContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(253, 176, 34, 0.15)',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '800',
    fontSize: 22,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0B0F19',
  },
  userInfoCol: {
    flex: 1,
  },
  memberTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: 'rgba(253, 176, 34, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.25)',
  },
  memberTagText: {
    ...typography.badge,
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  userName: {
    ...typography.h3,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  userContact: {
    ...typography.caption,
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 2,
  },
  userEmail: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 11,
  },
  editProfileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeSwitchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 12,
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(253, 176, 34, 0.25)',
  },
  modeSwitchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  modeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(253, 176, 34, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeSwitchTitle: {
    ...typography.subtitle,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modeSwitchSubtitle: {
    ...typography.caption,
    color: '#94A3B8',
    fontSize: 11,
  },
  switchPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  switchPillText: {
    ...typography.badge,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 11,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    ...typography.caption,
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  menuSection: {
    marginBottom: 18,
  },
  sectionTitle: {
    ...typography.caption,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuItemSubtitle: {
    ...typography.caption,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  menuRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  menuBadgeText: {
    ...typography.badge,
    color: '#0F172A',
    fontSize: 9,
    fontWeight: '800',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: 8,
  },
  logoutButtonText: {
    ...typography.subtitle,
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  versionFooter: {
    ...typography.caption,
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 20,
  },
});
