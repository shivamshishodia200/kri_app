import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

// --- MOCK DATA (Should be passed via navigation params in a real app) ---
const MOCK_BOOKING_DETAILS = {
  serviceSummary: "Furnished Apt. Cleaning - 2BHK + Refrigerator Deep Clean",
  total: 5999,
  date: "Wednesday, May 22, 2025",
  timeSlot: "4:00 PM - 7:00 PM",
  address: "Flat 405, ABC Apartments, Sector 18, Gurugram",
  bookingId: "HQ-987654321",
};

// --- MAIN SCREEN COMPONENT ---
const BookingConfirmedScreen = ({ navigation, route }) => {
  // In a real app, you would use:
  // const bookingDetails = route.params?.bookingDetails || MOCK_BOOKING_DETAILS;
  const bookingDetails = MOCK_BOOKING_DETAILS; 

  const handleViewBookings = () => {
    // Navigate to a dedicated 'My Bookings' or 'History' screen
    // alert("Navigating to My Bookings screen...");
    navigation.navigate('MyBookingsScreen'); 
  };

  const handleGoHome = () => {
    // Navigate back to the home screen
    navigation.popToTop(); // Go back to the very first screen (Home)
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#EFEEE9" translucent={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          
          {/* Header - Simple */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoHome} style={styles.closeCircleButton} activeOpacity={0.8}>
              <Icon name="close-outline" size={22} color="#2D3748" />
            </TouchableOpacity>
          </View>

          {/* Confirmation Icon and Message */}
          <View style={styles.confirmationContainer}>
            <View style={styles.iconCircle}>
              <Icon name="checkmark-circle-sharp" size={64} color="#10B981" />
            </View>
            <Text style={styles.successTitle}>Service Booked!</Text>
            <Text style={styles.successSubtitle}>
              Your request has been successfully placed. We've sent a confirmation email.
            </Text>
          </View>

          {/* Booking Summary Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Booking Details</Text>
            
            <View style={styles.detailRow}>
              <Icon name="ticket-outline" size={20} color="#777" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Booking ID:</Text>
              <Text style={styles.detailValueBold}>{bookingDetails.bookingId}</Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="briefcase-outline" size={20} color="#777" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Service:</Text>
              <Text style={styles.detailValue}>{bookingDetails.serviceSummary}</Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="calendar-outline" size={20} color="#777" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{bookingDetails.date}</Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="time-outline" size={20} color="#777" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Time Slot:</Text>
              <Text style={styles.detailValue}>{bookingDetails.timeSlot}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Icon name="location-outline" size={20} color="#777" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Address:</Text>
              <Text style={styles.detailValue}>{bookingDetails.address}</Text>
            </View>
            
            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Payable:</Text>
              <Text style={styles.totalPrice}>₹{bookingDetails.total.toLocaleString('en-IN')}</Text>
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleViewBookings}>
              <Text style={styles.secondaryButtonText}>View My Bookings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.primaryButton} onPress={handleGoHome}>
              <Text style={styles.primaryButtonText}>Continue Browsing</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EFEEE9",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 10,
    marginBottom: 10,
  },
  closeCircleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFEEE9',
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
  
  // Confirmation Section
  confirmationContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EFEEE9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: '#D8D5CB',
    borderRightColor: '#D8D5CB',
    elevation: 4,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2D3748',
    marginTop: 16,
    letterSpacing: -0.3,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#626B78',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: width * 0.8,
    lineHeight: 20,
  },

  // Summary Card
  card: {
    width: '100%',
    backgroundColor: '#EFEEE9',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: '#D8D5CB',
    borderRightColor: '#D8D5CB',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#D8D5CB',
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    width: 25,
    marginRight: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#626B78',
    fontWeight: '600',
    width: 90,
  },
  detailValue: {
    fontSize: 14,
    color: '#2D3748',
    flex: 1,
    fontWeight: '500',
  },
  detailValueBold: {
    fontSize: 14,
    color: '#2D3748',
    flex: 1,
    fontWeight: '700',
  },
  totalRow: {
    marginTop: 14,
    borderTopWidth: 1,
    borderColor: '#D8D5CB',
    paddingTop: 14,
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    flex: 1,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#059669',
  },

  // Action Buttons
  actionButtonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FDB022',
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#FDB022',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#EFEEE9',
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    borderWidth: 1,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: '#D8D5CB',
    borderRightColor: '#D8D5CB',
    marginBottom: 8,
    elevation: 1,
  },
  secondaryButtonText: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default BookingConfirmedScreen;