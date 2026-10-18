import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Dimensions,
    Platform,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#FDB022',
    background: '#EFEEE9',
    text: '#1E293B',
    grey: '#626B78',
    border: '#E2DFD7',
    danger: '#DC2626',
};

const DrawerMenu = ({ visible, onClose, onLogout, navigation }) => {
    const menuItems = [
        { label: 'Refer & Earn', icon: 'gift', screen: 'ReferralScreen' },
        { label: 'Help & Support', icon: 'headset', screen: 'PropertyInquiryFormScreen' },
        { label: 'Contact Us', icon: 'call', screen: 'ContactUs' },
        { label: 'Privacy Policy', icon: 'shield-checkmark', screen: 'PrivacyPolicy' },
        { label: 'Terms & Conditions', icon: 'document-text', screen: 'TermAndConditionScreen' },
    ];

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <StatusBar backgroundColor="rgba(0,0,0,0.4)" barStyle="dark-content" />

            <View style={styles.overlay}>
                <View style={styles.drawer}>
                    <SafeAreaView style={{ flex: 1 }}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.titleRow}>
                                <Text style={styles.appName}>Kirayedar<Text style={styles.appNameAccent}>24</Text></Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Icon name="close" size={20} color={COLORS.grey} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        {/* Menu */}
                        <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
                            {menuItems.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.menuItem}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        onClose();
                                        navigation?.navigate(item.screen);
                                    }}
                                >
                                    <View style={styles.iconContainer}>
                                        <Icon name={item.icon} size={18} color={COLORS.primary} />
                                    </View>
                                    <Text style={styles.menuText}>{item.label}</Text>
                                    <Icon name="chevron-forward" size={16} color="#A0AEC0" style={styles.chevron} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.divider} />

                        {/* Logout */}
                        <TouchableOpacity
                            style={styles.logout}
                            activeOpacity={0.7}
                            onPress={() => {
                                onClose();
                                onLogout();
                            }}
                        >
                            <View style={styles.logoutIconContainer}>
                                <Icon name="log-out-outline" size={18} color={COLORS.danger} />
                            </View>
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>

                        <Text style={styles.version}>Version 1.0.0</Text>
                    </SafeAreaView>
                </View>

                <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    drawer: {
        width: width * 0.78,
        backgroundColor: COLORS.background,
        borderRightWidth: 1.5,
        borderRightColor: '#D8D5CB',
        shadowColor: '#1E293B',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 20,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    appName: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: -0.3,
    },
    appNameAccent: {
        color: COLORS.primary,
    },
    closeBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#E5E3DC',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderTopColor: '#D3D0C6',
        borderLeftColor: '#D3D0C6',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderBottomColor: '#FFFFFF',
        borderRightColor: '#FFFFFF',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 16,
    },
    menuScroll: {
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 6,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1E293B',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    menuText: {
        marginLeft: 14,
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
        flex: 1,
    },
    chevron: {
        marginLeft: 'auto',
    },
    logout: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginTop: 4,
    },
    logoutIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutText: {
        marginLeft: 14,
        fontSize: 15,
        color: COLORS.danger,
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: COLORS.grey,
        marginBottom: 16,
        marginTop: 6,
    },
});

export default DrawerMenu;
