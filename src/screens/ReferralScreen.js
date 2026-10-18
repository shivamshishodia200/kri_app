/**
 * ReferralScreen.js
 * Simple referral screen with code sharing
 */
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Alert,
    Clipboard,
    Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from "react-native-vector-icons/Ionicons";

const COLORS = {
    primary: "#FDB022",
    primaryLight: "#FDC55E",
    primaryDark: "#D97706",
    background: "#EFEEE9",
    white: "#FFFFFF",
    black: "#2D3748",
    greyText: "#626B78",
    cardBackground: "#EFEEE9",
    border: "#D8D5CB",
};

const ReferralScreen = ({ navigation }) => {
    const [referralCode, setReferralCode] = useState('KD24REF123');

    // Copy referral code to clipboard
    const copyReferralCode = useCallback(async () => {
        try {
            await Clipboard.setString(referralCode);
            Alert.alert('Copied!', 'Referral code copied to clipboard');
        } catch (error) {
            Alert.alert('Error', 'Failed to copy referral code');
        }
    }, [referralCode]);

    // Share referral code
    const shareReferralCode = useCallback(async () => {
        try {
            const shareMessage = `Join Kirayedar24 using my referral code: ${referralCode}\n\nDownload the app now: https://kirayedar24.com`;
            
            await Share.share({
                message: shareMessage,
                title: 'Join Kirayedar24',
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to share referral code');
        }
    }, [referralCode]);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} translucent={false} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                >
                    <Icon name="arrow-back" size={20} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Refer & Earn</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <Icon name="gift" size={60} color={COLORS.primary} />
                </View>

                {/* Title */}
                <Text style={styles.title}>Invite Friends, Earn Rewards</Text>
                <Text style={styles.subtitle}>
                    Share your referral code with friends
                </Text>

                {/* Referral Code Card */}
                <View style={styles.codeCard}>
                    <Text style={styles.codeLabel}>Your Referral Code</Text>
                    <Text style={styles.codeText}>{referralCode}</Text>
                    
                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={[styles.button, styles.copyButton]}
                            onPress={copyReferralCode}
                        >
                            <Icon name="copy-outline" size={20} color={COLORS.black} />
                            <Text style={styles.buttonText}>Copy Code</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.button, styles.shareButton]}
                            onPress={shareReferralCode}
                        >
                            <Icon name="share-social-outline" size={20} color={COLORS.white} />
                            <Text style={styles.buttonText}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.background,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
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
    placeholder: {
        width: 38,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    iconContainer: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: COLORS.cardBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderTopColor: '#FFFFFF',
        borderLeftColor: '#FFFFFF',
        borderBottomColor: '#D8D5CB',
        borderRightColor: '#D8D5CB',
        elevation: 3,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.greyText,
        textAlign: 'center',
        marginBottom: 28,
    },
    codeCard: {
        width: '100%',
        backgroundColor: COLORS.cardBackground,
        borderRadius: 20,
        padding: 22,
        borderWidth: 1,
        borderTopColor: '#FFFFFF',
        borderLeftColor: '#FFFFFF',
        borderBottomColor: '#D8D5CB',
        borderRightColor: '#D8D5CB',
        elevation: 2,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    codeLabel: {
        fontSize: 12,
        color: COLORS.greyText,
        textAlign: 'center',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    codeText: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: 24,
        letterSpacing: 2,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    copyButton: {
        backgroundColor: COLORS.cardBackground,
        borderWidth: 1,
        borderTopColor: '#FFFFFF',
        borderLeftColor: '#FFFFFF',
        borderBottomColor: '#D8D5CB',
        borderRightColor: '#D8D5CB',
        elevation: 2,
    },
    shareButton: {
        backgroundColor: COLORS.primary,
        elevation: 3,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
});

export default ReferralScreen;
