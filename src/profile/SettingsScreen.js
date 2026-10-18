import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView,
    Switch, // Added for the example toggle setting
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from "react-native-vector-icons/Ionicons";
import { Alert } from 'react-native';
import { logoutUser } from '../utils/authManager';
import AuthFlowManager from '../utils/AuthFlowManager';

// --- Theme Colors ---
const COLORS = {
    primary: "#FDB022",
    primaryDark: "#D97706",
    secondary: "#10B981",
    background: "#EFEEE9",
    white: "#FFFFFF",
    black: "#2D3748",
    greyText: "#626B78",
    greyLight: "#D8D5CB",
    redAccent: "#EF4444",
    toggleActive: "#FDB022",
};

// --- Settings Data Structure ---
const sections = [
    {
        title: "Account Settings",
        data: [
            { icon: "person-outline", label: "Edit Profile", screen: "EditProfileScreen", type: "navigate" },
            { icon: "lock-closed-outline", label: "Change Password", screen: "ChangePasswordScreen", type: "navigate" },
            { icon: "eye-off-outline", label: "Privacy Policy", screen: "PrivacyScreen", type: "navigate" },
        ],
    },
    {
        title: "App Preferences",
        data: [
            // Removed: { icon: "notifications-outline", label: "Notifications", screen: "NotificationSettings", type: "navigate" },
            { icon: "earth-outline", label: "Language", screen: "LanguageScreen", type: "navigate" },
            { icon: "moon-outline", label: "Dark Mode", type: "toggle", state: false }, // Example toggle
        ],
    },
    {
        title: "Support",
        data: [
            { icon: "help-circle-outline", label: "Help Center", screen: "HelpScreen", type: "navigate" },
            { icon: "mail-outline", label: "Contact Us", screen: "ContactScreen", type: "navigate" },
            { icon: "information-circle-outline", label: "About App", screen: "AboutScreen", type: "navigate" },
        ],
    },
    {
        title: "Account Actions",
        data: [
            { icon: "log-out-outline", label: "Logout", type: "logout", style: "danger" },
        ],
    },
];

const SettingsScreen = ({ navigation }) => {
    // State for example toggle (Dark Mode)
    const [isDarkMode, setIsDarkMode] = useState(false);

    /**
     * Handles the logout action.
     */
    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Use AuthFlowManager to clear auth data
                            await AuthFlowManager.clearAuthData();
                            
                            // Navigate to LoginScreen for fresh start
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'LoginScreen' }]
                            });
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    /**
     * Renders an individual setting row item.
     * @param {object} item - The setting data object.
     */
    const renderSettingItem = (item) => {
        const handlePress = () => {
            if (item.type === "navigate" && item.screen) {
                // Navigate to the linked screen
                navigation.navigate(item.screen);
            } else if (item.type === "toggle") {
                // Handle the toggle state change
                setIsDarkMode(prev => !prev);
            } else if (item.type === "logout") {
                // Handle logout action
                handleLogout();
            }
        };

        return (
            <TouchableOpacity 
                key={item.label} 
                style={[styles.settingItem, item.style === "danger" && styles.dangerItem]} 
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <View style={styles.leftContent}>
                    <Icon 
                        name={item.icon} 
                        size={22} 
                        color={item.style === "danger" ? COLORS.redAccent : COLORS.primary} 
                        style={styles.itemIcon} 
                    />
                    <Text style={[styles.itemLabel, item.style === "danger" && styles.dangerLabel]}>
                        {item.label}
                    </Text>
                </View>
                
                {item.type === "toggle" ? (
                    <Switch
                        trackColor={{ false: COLORS.greyLight, true: COLORS.toggleActive }}
                        thumbColor={isDarkMode ? COLORS.white : COLORS.white}
                        ios_backgroundColor={COLORS.greyLight}
                        onValueChange={() => setIsDarkMode(prev => !prev)}
                        value={isDarkMode}
                    />
                ) : (
                    <Icon name="chevron-forward-outline" size={20} color={COLORS.greyLight} />
                )}
            </TouchableOpacity>
        );
    };

    /**
     * Handles the Delete Account action.
     */
    const handleDeleteAccount = () => {
        // In a real app, this would prompt confirmation, delete user data, and navigate to login.
        console.log("User initiating account deletion...");
        navigation.navigate("LoginScreen"); // Assuming navigation to login/onboarding after deletion
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar translucent={false} backgroundColor="#EFEEE9" barStyle="dark-content" />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
                    <Icon name="arrow-back-outline" size={20} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollView}>
                {sections.map((section, index) => (
                    <View key={index} style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.sectionList}>
                            {section.data.map(renderSettingItem)}
                        </View>
                    </View>
                ))}

                {/* Delete Account Button */}
                <TouchableOpacity
                    style={styles.deleteAccountButton}
                    onPress={handleDeleteAccount}
                    activeOpacity={0.8}
                >
                    <Icon name="trash-outline" size={20} color={COLORS.white} />
                    <Text style={styles.deleteAccountText}>Delete Account</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

// ----------------------------------------------------------------
// ## Stylesheet
// ----------------------------------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    // --- Header Styles ---
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: '#D8D5CB',
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        borderWidth: 1,
        borderTopColor: '#FFFFFF',
        borderLeftColor: '#FFFFFF',
        borderBottomColor: '#D8D5CB',
        borderRightColor: '#D8D5CB',
        elevation: 2,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.black,
        letterSpacing: -0.3,
    },
    // --- ScrollView & Sections ---
    scrollView: {
        paddingTop: 10,
    },
    sectionContainer: {
        marginBottom: 20,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.greyText,
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 6,
        letterSpacing: 0.5,
    },
    sectionList: {
        backgroundColor: '#EFEEE9',
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderTopColor: '#FFFFFF',
        borderLeftColor: '#FFFFFF',
        borderBottomColor: '#D8D5CB',
        borderRightColor: '#D8D5CB',
        elevation: 2,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#D8D5CB', 
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemIcon: {
        marginRight: 14,
    },
    itemLabel: {
        fontSize: 15,
        color: COLORS.black,
        fontWeight: '600',
    },
    dangerLabel: {
        color: COLORS.redAccent,
        fontWeight: '700',
    },
    // --- Delete Account Button (Replaced Logout) ---
    deleteAccountButton: {
        flexDirection: 'row',
        backgroundColor: '#EFEEE9',
        paddingVertical: 15,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 50,
        borderWidth: 1,
        borderTopColor: '#FFFFFF',
        borderLeftColor: '#FFFFFF',
        borderBottomColor: '#D8D5CB',
        borderRightColor: '#D8D5CB',
        elevation: 2,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    deleteAccountText: {
        color: COLORS.redAccent,
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 10,
    },
});

export default SettingsScreen;
