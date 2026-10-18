/**
 * ProfileScreen.js
 * Redesigned with consistent Neumorphism styling and real dynamic data
 */

import React, { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    ScrollView,
    StatusBar,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from "react-native-vector-icons/Ionicons";
import FeatherIcon from "react-native-vector-icons/Feather";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import { useFocusEffect } from '@react-navigation/native';
import { getCurrentUserProfile } from '../services/userapi';
import { getUserProperties } from '../services/propertyService';
import CustomAlert from '../components/CustomAlert';
import SubscriptionModal from '../components/SubscriptionModal';
import { useSubscription } from '../context/SubscriptionContext';
import { getNotificationCount } from '../utils/notificationManager';
import { propertyService } from '../services/propertyapi';

// --- Theme Tokens ---
const COLORS = {
    primary: "#FDB022",
    primaryLight: "#FFF8EB",
    primaryDark: "#D97706",
    background: "#EFEEE9",
    cardBg: "#EFEEE9",
    white: "#FFFFFF",
    textDark: "#2D3748",
    textMuted: "#626B78",
    borderHighlight: "#FFFFFF",
    borderShadow: "#D8D5CB",
    inputBg: "#E5E3DC",
    success: "#10B981",
    successLight: "#ECFDF5",
    danger: "#EF4444",
    dangerLight: "#FEF2F2",
    accent: "#0284C7",
    accentLight: "#E0F2FE",
    purple: "#7C3AED",
    purpleLight: "#EDE9FE",
};

const ProfileScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [logoutAlert, setLogoutAlert] = useState({ visible: false });
    const [userRole, setUserRole] = useState('');
    const [email, setEmail] = useState('');
    const [shortlistedCount, setShortlistedCount] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);
    const [myListingsCount, setMyListingsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [avatarVersion, setAvatarVersion] = useState(Date.now());
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    
    // Subscription context
    const { activeSubscription, userHasPackage, loadActiveSubscription } = useSubscription();

    const loadProfileData = useCallback(async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await getCurrentUserProfile();
            await loadActiveSubscription();
            
            if (response.success && response.user) {
                const userData = response.user;
                setName(userData.fullName || userData.name || 'User');
                setEmail(userData.email || 'user@example.com');
                setAvatar(userData.profilePicture || null);
                setUserRole(userData.role || userData.userType || '');
                
                // Fetch user's properties count for owners
                try {
                    const propertiesResponse = await getUserProperties();
                    if (propertiesResponse.success && propertiesResponse.data) {
                        setMyListingsCount(propertiesResponse.data.length);
                    } else {
                        setMyListingsCount(0);
                    }
                } catch (e) {
                    setMyListingsCount(0);
                }
                
                // Fetch shortlisted/favorites count
                try {
                    const savedResponse = await propertyService.getSavedProperties();
                    let savedData = [];
                    if (savedResponse && savedResponse.savedProperties && Array.isArray(savedResponse.savedProperties)) {
                        savedData = savedResponse.savedProperties;
                    } else if (savedResponse && Array.isArray(savedResponse.data)) {
                        savedData = savedResponse.data;
                    } else if (Array.isArray(savedResponse)) {
                        savedData = savedResponse;
                    }
                    savedData = savedData.filter(Boolean);
                    setShortlistedCount(savedData.length);
                } catch (e) {
                    setShortlistedCount(0);
                }
                
                // Fetch notification count
                try {
                    const notifCount = await getNotificationCount();
                    setNotificationCount(notifCount || 0);
                } catch (e) {
                    setNotificationCount(0);
                }
                
            } else {
                throw new Error(response.message || 'Failed to load profile');
            }
            
            setAvatarVersion(Date.now());
            
        } catch (err) {
            console.error("Profile loading failed:", err);
            setError('Could not load profile. Please try again.');
            
            try {
                const storedUser = await AsyncStorage.getItem('userData');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    setName(user.fullName || user.name || 'User');
                    setEmail(user.email || '');
                    setAvatar(user.profilePicture || null);
                }
                const storedRole = await AsyncStorage.getItem('userRole');
                if (storedRole) setUserRole(storedRole);
            } catch (fallbackErr) {
                console.error('Fallback profile loading failed:', fallbackErr);
            }
        } finally {
            setLoading(false);
        }
    }, [loadActiveSubscription]);

    const getDaysRemaining = (endDate) => {
        if (!endDate) return 0;
        const end = new Date(endDate);
        const now = new Date();
        const diff = end - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    const getSubscriptionProgress = (subscription) => {
        if (!subscription?.startDate || !subscription?.endDate) return 0;
        const start = new Date(subscription.startDate);
        const end = new Date(subscription.endDate);
        const now = new Date();
        const totalDuration = end - start;
        const elapsed = now - start;
        if (totalDuration <= 0) return 0;
        const progress = (elapsed / totalDuration) * 100;
        return Math.min(Math.max(progress, 0), 100);
    };

    useFocusEffect(
        useCallback(() => {
            loadProfileData();
            return () => {};
        }, [loadProfileData])
    );

    const getInitials = (fullName) => {
        if (!fullName || fullName === 'User') return 'U';
        const parts = fullName.split(' ').filter(Boolean);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        if (parts.length >= 2) return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
        return 'U';
    };

    const initials = getInitials(name);
    const isOwner = userRole && (userRole.toLowerCase() === 'owner' || userRole.toLowerCase() === 'landlord');

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading profile details...</Text>
            </SafeAreaView>
        );
    }
    
    if (error && !name) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <View style={styles.errorIconContainer}>
                    <Icon name="alert-circle-outline" size={54} color={COLORS.danger} />
                </View>
                <Text style={styles.errorTextTitle}>Unable to Load Profile</Text>
                <Text style={styles.errorTextDetail}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadProfileData} activeOpacity={0.85}>
                    <Icon name="refresh" size={16} color="#1E293B" style={{ marginRight: 6 }} />
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} translucent={false} />
            
            {/* Top Navigation Bar */}
            <View style={styles.headerTopBar}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                >
                    <Icon name="chevron-back" size={20} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerPageTitle}>My Profile</Text>
                <View style={{ width: 38 }} />
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Overview Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarWrapper}>
                        {avatar ? (
                            <Image
                                source={{ uri: avatar.includes('?') ? `${avatar}&v=${avatarVersion}` : `${avatar}?v=${avatarVersion}` }}
                                style={styles.avatarImg}
                                onError={() => setAvatar(null)}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitials}>{initials}</Text>
                            </View>
                        )}
                        <TouchableOpacity 
                            style={styles.editIconBadge}
                            onPress={() => navigation.navigate('EditProfileScreen')}
                            activeOpacity={0.85}
                        >
                            <FeatherIcon name="camera" size={12} color="#1E293B" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.profileName} numberOfLines={1}>{name}</Text>
                    <Text style={styles.profileEmail} numberOfLines={1}>{email}</Text>

                    {/* Role Badge */}
                    <View style={styles.roleBadgeContainer}>
                        <View style={styles.roleBadge}>
                            <Icon name={isOwner ? "business" : "person"} size={12} color={COLORS.primaryDark} style={{ marginRight: 4 }} />
                            <Text style={styles.roleBadgeText}>{isOwner ? 'Property Owner' : 'Buyer / Tenant'}</Text>
                        </View>
                    </View>

                    {/* Edit Profile Action Button */}
                    <TouchableOpacity 
                        style={styles.editProfileButton}
                        onPress={() => navigation.navigate('EditProfileScreen')}
                        activeOpacity={0.85}
                    >
                        <FeatherIcon name="edit-2" size={13} color={COLORS.primaryDark} />
                        <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Quick Stats Grid */}
                <View style={styles.quickStatsRow}>
                    <TouchableOpacity 
                        style={styles.statCard}
                        onPress={() => navigation.navigate('Shortlisted')}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.statIconCircle, { backgroundColor: COLORS.dangerLight }]}>
                            <Icon name="heart" size={20} color={COLORS.danger} />
                        </View>
                        <Text style={styles.statNumber}>{shortlistedCount}</Text>
                        <Text style={styles.statLabel}>Shortlisted</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.statCard}
                        onPress={() => navigation.navigate('NotificationList')}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.statIconCircle, { backgroundColor: COLORS.primaryLight }]}>
                            <Icon name="notifications" size={20} color={COLORS.primaryDark} />
                        </View>
                        <Text style={styles.statNumber}>{notificationCount}</Text>
                        <Text style={styles.statLabel}>Alerts</Text>
                    </TouchableOpacity>

                    {isOwner ? (
                        <TouchableOpacity 
                            style={styles.statCard}
                            onPress={() => navigation.navigate('HomeScreenOwner')}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.statIconCircle, { backgroundColor: COLORS.accentLight }]}>
                                <Icon name="business" size={20} color={COLORS.accent} />
                            </View>
                            <Text style={styles.statNumber}>{myListingsCount}</Text>
                            <Text style={styles.statLabel}>Properties</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Subscription Status Card - For Tenants */}
                {!isOwner && userHasPackage && activeSubscription ? (
                    <View style={styles.subscriptionActiveCard}>
                        <View style={styles.subscriptionHeader}>
                            <View style={styles.subscriptionIconWrapper}>
                                <FontAwesomeIcon name="crown" size={18} color={COLORS.primaryDark} />
                            </View>
                            <View style={styles.subscriptionTitleWrapper}>
                                <Text style={styles.subscriptionPlanName}>
                                    {activeSubscription.package?.name || activeSubscription.packageName || 'Active Subscription'}
                                </Text>
                                <View style={styles.activeStatusBadge}>
                                    <View style={styles.activeDot} />
                                    <Text style={styles.activeStatusText}>Active Plan</Text>
                                </View>
                            </View>
                        </View>
                        
                        <View style={styles.subscriptionDetails}>
                            <View style={styles.subscriptionDetailRow}>
                                <Icon name="calendar-outline" size={15} color={COLORS.textMuted} />
                                <Text style={styles.subscriptionDetailLabel}>Expiry Date:</Text>
                                <Text style={styles.subscriptionDetailValue}>
                                    {activeSubscription.endDate 
                                        ? new Date(activeSubscription.endDate).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                          })
                                        : 'N/A'}
                                </Text>
                            </View>
                            
                            <View style={styles.subscriptionDetailRow}>
                                <Icon name="hourglass-outline" size={15} color={COLORS.textMuted} />
                                <Text style={styles.subscriptionDetailLabel}>Days Left:</Text>
                                <Text style={[styles.subscriptionDetailValue, { 
                                    color: getDaysRemaining(activeSubscription.endDate) <= 5 ? COLORS.danger : COLORS.success 
                                }]}>
                                    {getDaysRemaining(activeSubscription.endDate)} days
                                </Text>
                            </View>
                            
                            {activeSubscription.package?.contactLimit ? (
                                <View style={styles.subscriptionDetailRow}>
                                    <Icon name="call-outline" size={15} color={COLORS.textMuted} />
                                    <Text style={styles.subscriptionDetailLabel}>Contacts Remaining:</Text>
                                    <Text style={styles.subscriptionDetailValue}>
                                        {activeSubscription.contactsUsed || 0} / {activeSubscription.package.contactLimit}
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                        
                        <View style={styles.subscriptionProgress}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { 
                                    width: `${getSubscriptionProgress(activeSubscription)}%`,
                                    backgroundColor: getSubscriptionProgress(activeSubscription) > 80 ? COLORS.danger : COLORS.primaryDark
                                }]} />
                            </View>
                            <Text style={styles.progressText}>
                                {getSubscriptionProgress(activeSubscription).toFixed(0)}% elapsed
                            </Text>
                        </View>
                    </View>
                ) : !isOwner ? (
                    <TouchableOpacity 
                        style={styles.premiumCard} 
                        onPress={() => setShowSubscriptionModal(true)}
                        activeOpacity={0.9}
                    >
                        <View style={styles.premiumHeader}>
                            <View style={styles.premiumIconWrapper}>
                                <FontAwesomeIcon name="crown" size={18} color={COLORS.primaryDark} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.premiumTitle}>Subscription Plans</Text>
                                <Text style={styles.premiumSubtitle}>Direct contact access & verified owners</Text>
                            </View>
                            <Icon name="chevron-forward" size={18} color={COLORS.primaryDark} />
                        </View>
                    </TouchableOpacity>
                ) : null}

                {/* Account & Support Menu */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Account & Settings</Text>
                    <View style={styles.menuCard}>
                        <TouchableOpacity 
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('EditProfileScreen')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: COLORS.primaryLight }]}>
                                <Icon name="person-outline" size={18} color={COLORS.primaryDark} />
                            </View>
                            <Text style={styles.menuText}>Edit Profile</Text>
                            <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('PropertyInquiryFormScreen')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: COLORS.accentLight }]}>
                                <Icon name="help-circle-outline" size={18} color={COLORS.accent} />
                            </View>
                            <Text style={styles.menuText}>Help & Support</Text>
                            <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('ContactUs')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: COLORS.primaryLight }]}>
                                <Icon name="call-outline" size={18} color={COLORS.primaryDark} />
                            </View>
                            <Text style={styles.menuText}>Contact Us</Text>
                            <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.menuItem, { borderBottomWidth: 0 }]}
                            onPress={() => navigation.navigate('About')}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: COLORS.purpleLight }]}>
                                <Icon name="information-circle-outline" size={18} color={COLORS.purple} />
                            </View>
                            <Text style={styles.menuText}>About Kirayedar24</Text>
                            <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Sign Out Button */}
                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={() => setLogoutAlert({
                        visible: true,
                        title: 'Sign Out',
                        message: 'Are you sure you want to sign out of your account?',
                        icon: 'log-out-outline',
                        iconColor: COLORS.danger,
                        buttons: [
                            {
                                text: 'Cancel',
                                style: 'cancel',
                                onPress: () => setLogoutAlert({ visible: false })
                            },
                            {
                                text: 'Sign Out',
                                onPress: async () => {
                                    await AsyncStorage.multiRemove(['authToken', 'userId', 'userData', 'userRole']);
                                    setLogoutAlert({ visible: false });
                                    navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
                                }
                            }
                        ]
                    })}
                    activeOpacity={0.85}
                >
                    <Icon name="log-out-outline" size={18} color={COLORS.danger} style={{ marginRight: 8 }} />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                {/* App Version Info */}
                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>Kirayedar24 • Version 1.0.0 (Build 24)</Text>
                </View>

                {/* Custom Logout Alert Modal */}
                <CustomAlert
                    visible={logoutAlert.visible}
                    title={logoutAlert.title}
                    message={logoutAlert.message}
                    icon={logoutAlert.icon}
                    iconColor={logoutAlert.iconColor}
                    buttons={logoutAlert.buttons}
                    onClose={() => setLogoutAlert({ visible: false })}
                />

                {/* Subscription Modal */}
                <SubscriptionModal
                    visible={showSubscriptionModal}
                    onClose={() => setShowSubscriptionModal(false)}
                    onSuccess={() => {
                        setShowSubscriptionModal(false);
                        loadActiveSubscription();
                    }}
                />

                <View style={{ height: 110 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },

    // Header Top Bar
    headerTopBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: COLORS.cardBg,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderTopColor: COLORS.borderHighlight,
        borderLeftColor: COLORS.borderHighlight,
        borderBottomColor: COLORS.borderShadow,
        borderRightColor: COLORS.borderShadow,
        elevation: 2,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    headerPageTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textDark,
        letterSpacing: -0.3,
    },

    // Neumorphic Profile Card
    profileCard: {
        borderRadius: 20,
        backgroundColor: COLORS.cardBg,
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1.5,
        borderTopColor: COLORS.borderHighlight,
        borderLeftColor: COLORS.borderHighlight,
        borderBottomColor: COLORS.borderShadow,
        borderRightColor: COLORS.borderShadow,
        elevation: 3,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 10,
    },
    avatarImg: {
        width: 76,
        height: 76,
        borderRadius: 38,
        borderWidth: 2.5,
        borderColor: '#FFFFFF',
    },
    avatarPlaceholder: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: COLORS.inputBg,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2.5,
        borderColor: '#FFFFFF',
    },
    avatarInitials: {
        fontSize: 26,
        fontWeight: '800',
        color: COLORS.primaryDark,
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        elevation: 2,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textDark,
        marginBottom: 3,
        textAlign: 'center',
    },
    profileEmail: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginBottom: 10,
        textAlign: 'center',
    },
    roleBadgeContainer: {
        marginBottom: 14,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    roleBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: COLORS.primaryDark,
        textTransform: 'uppercase',
    },
    editProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBg,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1.5,
        borderTopColor: COLORS.borderHighlight,
        borderLeftColor: COLORS.borderHighlight,
        borderBottomColor: COLORS.borderShadow,
        borderRightColor: COLORS.borderShadow,
        elevation: 2,
        gap: 6,
    },
    editProfileButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primaryDark,
    },

    // Quick Stats Grid
    quickStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1.5,
        borderTopColor: COLORS.borderHighlight,
        borderLeftColor: COLORS.borderHighlight,
        borderBottomColor: COLORS.borderShadow,
        borderRightColor: COLORS.borderShadow,
        elevation: 2,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    statIconCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    statNumber: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textDark,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textMuted,
    },

    // Active Subscription Card
    subscriptionActiveCard: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1.5,
        borderTopColor: COLORS.borderHighlight,
        borderLeftColor: COLORS.borderHighlight,
        borderBottomColor: COLORS.borderShadow,
        borderRightColor: COLORS.borderShadow,
        elevation: 2,
    },
    subscriptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    subscriptionIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    subscriptionTitleWrapper: {
        flex: 1,
    },
    subscriptionPlanName: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.textDark,
        marginBottom: 2,
    },
    activeStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.successLight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.success,
        marginRight: 5,
    },
    activeStatusText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.success,
    },
    subscriptionDetails: {
        backgroundColor: COLORS.inputBg,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    subscriptionDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    subscriptionDetailLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: 8,
        flex: 1,
    },
    subscriptionDetailValue: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textDark,
    },
    subscriptionProgress: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: COLORS.inputBg,
        borderRadius: 3,
        overflow: 'hidden',
        marginRight: 10,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textMuted,
    },

    // Upgrade to Premium Banner
    premiumCard: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1.5,
        borderTopColor: COLORS.borderHighlight,
        borderLeftColor: COLORS.borderHighlight,
        borderBottomColor: COLORS.borderShadow,
        borderRightColor: COLORS.borderShadow,
        elevation: 2,
    },
    premiumHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    premiumIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    premiumTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: COLORS.textDark,
    },
    premiumSubtitle: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 2,
    },

    // Menu Section
    menuSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textDark,
        marginBottom: 10,
        paddingLeft: 4,
    },
    menuCard: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 18,
        borderWidth: 1.5,
        borderTopColor: COLORS.borderHighlight,
        borderLeftColor: COLORS.borderHighlight,
        borderBottomColor: COLORS.borderShadow,
        borderRightColor: COLORS.borderShadow,
        elevation: 2,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E0D8',
    },
    menuIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textDark,
    },

    // Logout Button
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.cardBg,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1.5,
        borderTopColor: COLORS.borderHighlight,
        borderLeftColor: COLORS.borderHighlight,
        borderBottomColor: COLORS.borderShadow,
        borderRightColor: COLORS.borderShadow,
        elevation: 2,
        marginBottom: 14,
    },
    logoutText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.danger,
    },

    // Version
    versionContainer: {
        alignItems: 'center',
        paddingVertical: 6,
    },
    versionText: {
        fontSize: 11,
        color: COLORS.textMuted,
        fontWeight: '500',
    },

    // Loading & Error States
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    errorIconContainer: {
        marginBottom: 12,
    },
    errorTextTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.textDark,
        marginBottom: 6,
    },
    errorTextDetail: {
        fontSize: 13,
        color: COLORS.textMuted,
        textAlign: 'center',
        lineHeight: 18,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 16,
    },
    retryButtonText: {
        color: '#1E293B',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default ProfileScreen;
