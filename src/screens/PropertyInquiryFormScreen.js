import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  Modal,
  FlatList,
  StatusBar,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from "react-native-vector-icons/Ionicons";

const PropertyInquiryFormScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPropertyTypeModal, setShowPropertyTypeModal] = useState(false);

  const propertyTypes = [
    "House",
    "Office",
    "Shop",
    "PG"
  ];

  const handleSelectPropertyType = (type) => {
    setPropertyType(type);
    setShowPropertyTypeModal(false);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter your name");
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert("Required", "Please enter your phone number");
      return;
    }

    // Remove all non-digit characters
    const cleanPhone = phoneNumber.trim().replace(/\D/g, '');

    if (cleanPhone.length < 10) {
      Alert.alert("Invalid", "Please enter a valid phone number (at least 10 digits)");
      return;
    }

    // Keep only last 10 digits (in case user entered +91 or country code)
    const formattedPhone = cleanPhone.slice(-10);

    if (!address.trim()) {
      Alert.alert("Required", "Please enter your address");
      return;
    }

    if (!propertyType) {
      Alert.alert("Required", "Please select a property type");
      return;
    }

    if (!message.trim()) {
      Alert.alert("Required", "Please enter your message");
      return;
    }

    setLoading(true);

    // Prepare API payload
    const payload = {
      name: name.trim(),
      phone: formattedPhone,
      address: address.trim(),
      propertyType: propertyType,
      message: message.trim()
    };

    console.log('Submitting payload:', JSON.stringify(payload, null, 2));

    // Send request to API
    fetch('https://backend.kirayedar24.com/api/enquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        console.log('Response status:', response.status);
        return response.json().then((data) => {
          console.log('Response data:', JSON.stringify(data, null, 2));
          if (!response.ok) {
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
          }
          return data;
        });
      })
      .then((data) => {
        setLoading(false);
        console.log('✅ Inquiry submitted successfully:', data);
        
        // Clear form first
        setName("");
        setPhoneNumber("");
        setAddress("");
        setPropertyType("");
        setMessage("");
        
        Alert.alert(
          "✅ Success!",
          "Your inquiry has been submitted successfully!\n\n" +
          "📧 A confirmation email has been sent to the property owner.\n\n" +
          "📞 You will be contacted soon.\n\n" +
          "Thank you for using our service!",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.goBack();
              }
            }
          ]
        );
      })
      .catch((error) => {
        setLoading(false);
        console.error('❌ API Error:', error);
        
        // More detailed error message
        const errorMsg = error.message || 'Unable to submit inquiry. Please check your internet connection.';
        
        Alert.alert(
          "❌ Submission Failed",
          `${errorMsg}\n\nPlease try again or contact support if the problem persists.`,
          [
            {
              text: "Retry",
              onPress: () => handleSubmit()
            },
            {
              text: "Cancel",
              style: "cancel"
            }
          ]
        );
      });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#EFEEE9" translucent={false} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
          <Icon name="chevron-back" size={20} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit an Inquiry</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Phone Number Input */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Your Phone Number"
              keyboardType="phone-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Address Input */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Your Address"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Property Type Dropdown */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowPropertyTypeModal(true)}
          >
            <Text style={[styles.dropdownText, propertyType ? { color: "#111827" } : { color: "#9CA3AF" }]}>
              {propertyType || "Select Property Type"}
            </Text>
            <Icon name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* Message Input */}
          <View style={styles.messageInputGroup}>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Enter your message here..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading ? { opacity: 0.7 } : null]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.submitText}>{loading ? "Submitting..." : "Submit Inquiry"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Property Type Modal */}
      <Modal
        visible={showPropertyTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPropertyTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Property Type</Text>
              <TouchableOpacity onPress={() => setShowPropertyTypeModal(false)}>
                <Icon name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={propertyTypes}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleSelectPropertyType(item)}
                >
                  <Text style={styles.modalOptionText}>{item}</Text>
                  {propertyType === item && (
                    <Icon name="checkmark-circle" size={20} color="#FDB022" />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFEEE9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#D8D5CB",
    backgroundColor: "#EFEEE9",
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2D3748",
    letterSpacing: -0.3,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    paddingBottom: 50,
  },
  formCard: {
    backgroundColor: "#EFEEE9",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#D8D5CB",
    borderRightColor: "#D8D5CB",
    shadowColor: "#1E293B",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  inputGroup: {
    borderWidth: 1,
    borderTopColor: "#D3D0C6",
    borderLeftColor: "#D3D0C6",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#E5E3DC",
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  input: {
    fontSize: 15,
    color: "#2D3748",
    fontWeight: "500",
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
  },
  dropdownButton: {
    borderWidth: 1,
    borderTopColor: "#D3D0C6",
    borderLeftColor: "#D3D0C6",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#E5E3DC",
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D3748",
  },
  messageInputGroup: {
    borderWidth: 1,
    borderTopColor: "#D3D0C6",
    borderLeftColor: "#D3D0C6",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: "#E5E3DC",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageInput: {
    fontSize: 15,
    color: "#2D3748",
    minHeight: 110,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#FDB022",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#FDB022",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  submitText: {
    color: "#1E293B",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#EFEEE9",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    borderWidth: 1,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#D8D5CB",
    borderRightColor: "#D8D5CB",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#D8D5CB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2D3748",
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#2D3748",
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#D8D5CB",
  },
});

export default PropertyInquiryFormScreen;
