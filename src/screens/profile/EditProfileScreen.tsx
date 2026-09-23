import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/common/AppHeader';
import { FormField } from '../../components/common/FormField';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || 'Bangalore');
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Required Fields', 'Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
    });
    setLoading(false);

    Alert.alert('Profile Updated', 'Your profile details have been successfully saved.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Edit Profile" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Edit Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                }}
                style={styles.avatarImg}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => Alert.alert('Change Avatar', 'Photo picker integration ready.')}
                style={styles.cameraBtn}
              >
                <Icon name="edit" size={14} color={colors.darkText} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <Text style={styles.changePhotoText}>Tap to change photo</Text>
          </View>

          {/* Form Fields */}
          <FormField
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Rajesh Sharma"
            required
            leftIcon={<Icon name="user" size={18} color={colors.textSecondary} />}
          />

          <FormField
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="e.g. rajesh@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            required
            leftIcon={<Icon name="mail" size={18} color={colors.textSecondary} />}
          />

          <FormField
            label="Mobile Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. +91 98765 01234"
            keyboardType="phone-pad"
            required
            leftIcon={<Icon name="phone" size={18} color={colors.textSecondary} />}
          />

          <FormField
            label="Primary City"
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Bangalore"
            leftIcon={<Icon name="map-pin" size={18} color={colors.textSecondary} />}
          />

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={loading}
            variant="primary"
            size="lg"
            fullWidth
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    position: 'relative',
    marginBottom: spacing.xs,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  changePhotoText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  saveBtn: {
    marginTop: spacing.lg,
  },
});
