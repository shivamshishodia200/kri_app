// EditProfileScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { getCurrentUserProfile, updateCurrentUserProfile, validateProfileData } from '../services/userapi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // First try to load from AsyncStorage as fallback
      let storedUserData = null;
      try {
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedUser) {
          storedUserData = JSON.parse(storedUser);
        }
      } catch (storageError) {
        console.log('Error reading from storage:', storageError);
      }
      
      // Try to load user profile from API
      let userData = null;
      try {
        const response = await getCurrentUserProfile();
        console.log('Profile API Response:', JSON.stringify(response, null, 2));
        
        if (response && response.success) {
          // Handle different response structures
          if (response.user) {
            userData = response.user;
          } else if (response.data && response.data.user) {
            userData = response.data.user;
          } else if (response.data) {
            userData = response.data;
          }
        }
      } catch (apiError) {
        console.log('API Error:', apiError);
      }
      
      // Use API data or fall back to stored data
      const user = userData || storedUserData;
      
      if (user) {
        // Safely extract address fields
        const address = user.address || {};
        
        setFullName(user.fullName || user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone || user.mobile || '');
        setState(user.state || address.state || '');
        setCity(user.city || address.city || '');
        setStreet(user.street || address.street || '');
        setPinCode(user.pinCode || user.pincode || address.pinCode || address.pincode || '');
        setPassword(''); // Never pre-fill password
        setProfilePicture(user.profilePicture || user.avatar || null);
      } else {
        console.log('No user data found');
      }
    } catch (error) {
      console.error('Error loading profile:', error.message);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    // Validate profile data using new API validation
    const profileData = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      state: state.trim(),
      city: city.trim(),
      street: street.trim(),
      pinCode: pinCode.trim(),
      ...(password.trim() && { password: password.trim() })
    };

    const validation = validateProfileData(profileData);
    
    if (!validation.isValid) {
      const fieldErrors = {};
      validation.errors.forEach(error => {
        if (error.includes('name')) fieldErrors.fullName = error;
        else if (error.includes('email')) fieldErrors.email = error;
        else if (error.includes('phone')) fieldErrors.phone = error;
        else if (error.includes('state')) fieldErrors.state = error;
        else if (error.includes('city')) fieldErrors.city = error;
        else if (error.includes('PIN')) fieldErrors.pinCode = error;
        else if (error.includes('password')) fieldErrors.password = error;
      });
      setErrors(fieldErrors);
      
      const errorMessages = validation.errors.join('\n');
      Alert.alert('Validation Error', errorMessages);
      return;
    }

    try {
      setSaving(true);
      
      const response = await updateCurrentUserProfile(profileData);
      
      if (response.success) {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
          <Icon name="arrow-back" size={20} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={require("../assets/profile.png")}
            style={styles.avatar}
          />
          <TouchableOpacity
            style={styles.editAvatar}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="camera-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Card Form */}
        <View style={styles.formCard}>
          {/* Full Name */}
          <View style={styles.inputRow}>
            <Icon name="person-outline" size={20} color="#FDB022" />
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
              placeholderTextColor="#999"
            />
          </View>

          {/* Email */}
          <View style={styles.inputRow}>
            <Icon name="mail-outline" size={20} color="#FDB022" />
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              keyboardType="email-address"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </View>

          {/* Phone */}
          <View style={styles.inputRow}>
            <Icon name="call-outline" size={20} color="#FDB022" />
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              placeholderTextColor="#999"
              maxLength={10}
            />
          </View>

          {/* State */}
          <View style={styles.inputRow}>
            <Icon name="location-outline" size={20} color="#FDB022" />
            <TextInput
              style={[styles.input, errors.state && styles.inputError]}
              value={state}
              onChangeText={setState}
              placeholder="State"
              placeholderTextColor="#999"
            />
          </View>

          {/* City */}
          <View style={styles.inputRow}>
            <Icon name="business-outline" size={20} color="#FDB022" />
            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              value={city}
              onChangeText={setCity}
              placeholder="City"
              placeholderTextColor="#999"
            />
          </View>

          {/* Street */}
          <View style={styles.inputRow}>
            <Icon name="home-outline" size={20} color="#FDB022" />
            <TextInput
              style={styles.input}
              value={street}
              onChangeText={setStreet}
              placeholder="Street Address (optional)"
              placeholderTextColor="#999"
            />
          </View>

          {/* PIN Code */}
          <View style={styles.inputRow}>
            <Icon name="pin-outline" size={20} color="#FDB022" />
            <TextInput
              style={[styles.input, errors.pinCode && styles.inputError]}
              value={pinCode}
              onChangeText={setPinCode}
              placeholder="PIN Code"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          {/* Password */}
          <View style={styles.inputRow}>
            <Icon name="lock-closed-outline" size={20} color="#FDB022" />
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              value={password}
              onChangeText={setPassword}
              placeholder="New Password (optional)"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveBtn, saving && { opacity: 0.7 }]} 
            onPress={handleSaveChanges}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Sheet for Avatar */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalItem}>
              <Icon name="camera" size={22} color="#FDB022" />
              <Text style={styles.modalText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalItem}>
              <Icon name="image" size={22} color="#FDB022" />
              <Text style={styles.modalText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFEEE9" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFEEE9",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#D8D5CB",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EFEEE9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#D8D5CB",
    borderRightColor: "#D8D5CB",
    elevation: 2,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2D3748",
    marginLeft: 14,
    letterSpacing: -0.3,
  },

  // Avatar
  avatarContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#E5E3DC",
  },
  editAvatar: {
    position: "absolute",
    bottom: 0,
    right: "38%",
    backgroundColor: "#FDB022",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  // Form Card
  formCard: {
    marginHorizontal: 16,
    backgroundColor: "#EFEEE9",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#D8D5CB",
    borderRightColor: "#D8D5CB",
    elevation: 2,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderTopColor: "#D3D0C6",
    borderLeftColor: "#D3D0C6",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    backgroundColor: "#E5E3DC",
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: "#2D3748",
    paddingVertical: 12,
    fontWeight: "500",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },

  // Save button
  saveBtn: {
    backgroundColor: "#FDB022",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
    elevation: 3,
    shadowColor: "#FDB022",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveText: { color: "#1E293B", fontSize: 16, fontWeight: "800" },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalContent: {
    backgroundColor: "#EFEEE9",
    padding: 22,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#D8D5CB",
    borderRightColor: "#D8D5CB",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  modalText: { marginLeft: 12, fontSize: 15, color: "#2D3748", fontWeight: "600" },
});

export default EditProfileScreen;
