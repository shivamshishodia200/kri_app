import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput, // Added for input fields
    ScrollView,
    Alert, // Using Alert for placeholder messaging as it's standard in RN
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from "react-native-vector-icons/Ionicons";
// import { profileService } from '../services/profileApi.js'; // REMOVED

// --- Theme Colors ---
const COLORS = {
    primary: "#FDB022",
    primaryDark: "#D97706",
    secondary: "#10B981",
    background: "#EFEEE9",
    white: "#FFFFFF",
    black: "#2D3748",
    greyText: "#626B78",
    greyLight: "#E5E3DC",
    border: "#D8D5CB",
    redAccent: "#EF4444",
    toggleActive: "#FDB022",
};

const ChangePasswordScreen = ({ navigation }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChangePassword = async () => {
        setError(''); // Clear previous errors

        // Mock validation (API removed)
        const validation = {
            isValid: currentPassword && newPassword && newPassword === confirmPassword && newPassword.length >= 6,
            errors: {
                ...(!currentPassword && { current: 'Current password is required' }),
                ...(!newPassword && { new: 'New password is required' }),
                ...(newPassword && newPassword.length < 6 && { length: 'Password must be at least 6 characters' }),
                ...(newPassword && confirmPassword && newPassword !== confirmPassword && { match: 'Passwords do not match' })
            }
        };
        
        if (!validation.isValid) {
            const errorMessages = Object.values(validation.errors).join('\\n');
            setError(errorMessages);
            return;
        }

        try {
            setLoading(true);
            
            // Mock password change (API removed)
            const response = {
                success: true,
                message: 'Password changed successfully (offline mode)'
            };
            
            if (response.success) {
                Alert.alert(
                    'Success', 
                    'Password changed successfully!',
                    [
                        { 
                            text: 'OK', 
                            onPress: () => {
                                // Clear fields and go back
                                setCurrentPassword('');
                                setNewPassword('');
                                setConfirmPassword('');
                                navigation.goBack();
                            }
                        }
                    ]
                );
            } else {
                setError(response.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Change password error:', error);
            setError('Failed to change password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
                    <Icon name="arrow-back-outline" size={20} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
                
                <Text style={styles.instructionText}>
                    Please enter your current password, then choose a strong new password.
                </Text>

                {/* Current Password Input */}
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        secureTextEntry={!showCurrentPassword}
                        placeholder="Enter current password"
                        placeholderTextColor={COLORS.greyText}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                    />
                    <TouchableOpacity 
                        style={styles.eyeToggle}
                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                        <Icon 
                            name={showCurrentPassword ? "eye-off-outline" : "eye-outline"} 
                            size={20} 
                            color={COLORS.greyText} 
                        />
                    </TouchableOpacity>
                </View>

                {/* New Password Input */}
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        secureTextEntry={!showNewPassword}
                        placeholder="Enter new password (min 6 characters)"
                        placeholderTextColor={COLORS.greyText}
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    <TouchableOpacity 
                        style={styles.eyeToggle}
                        onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                        <Icon 
                            name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                            size={20} 
                            color={COLORS.greyText} 
                        />
                    </TouchableOpacity>
                </View>

                {/* Confirm New Password Input */}
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        secureTextEntry={!showConfirmPassword}
                        placeholder="Confirm new password"
                        placeholderTextColor={COLORS.greyText}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity 
                        style={styles.eyeToggle}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        <Icon 
                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                            size={20} 
                            color={COLORS.greyText} 
                        />
                    </TouchableOpacity>
                </View>

                {/* Error Message */}
                {error ? (
                    <Text style={styles.errorText}>
                        <Icon name="alert-circle-outline" size={14} color={COLORS.redAccent} /> {error}
                    </Text>
                ) : null}

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, loading && { opacity: 0.7 }]}
                    onPress={handleChangePassword}
                    activeOpacity={0.8}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.saveButtonText}>Change Password</Text>
                    )}
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
        borderBottomColor: COLORS.border,
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
    // --- Content & ScrollView ---
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    instructionText: {
        fontSize: 14,
        color: COLORS.greyText,
        marginBottom: 20,
        lineHeight: 20,
    },
    // --- Input Styles ---
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.black,
        marginBottom: 8,
        marginTop: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E5E3DC',
        borderWidth: 1,
        borderTopColor: '#D3D0C6',
        borderLeftColor: '#D3D0C6',
        borderBottomColor: '#FFFFFF',
        borderRightColor: '#FFFFFF',
        borderRadius: 12,
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: COLORS.black,
        fontWeight: '500',
    },
    eyeToggle: {
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    errorText: {
        marginTop: 15,
        fontSize: 14,
        color: COLORS.redAccent,
        fontWeight: '500',
    },
    // --- Button Styles ---
    saveButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    saveButtonText: {
        color: '#1E293B',
        fontSize: 16,
        fontWeight: '800',
    },
});

export default ChangePasswordScreen;
