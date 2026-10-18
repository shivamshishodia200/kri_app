import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const AppointmentScreen = () => {
  const navigation = useNavigation();

  // Sample appointment data
  const [appointments, setAppointments] = useState([
    {
      id: "1",
      doctor: "Dr. Rakesh Sharma",
      speciality: "Cardiologist",
      hospital: "Max Hospital, Noida",
      date: "19 Sep",
      time: "10:00 AM",
      status: "Booked",
    },
    {
      id: "2",
      doctor: "Dr. Priya Verma",
      speciality: "Dermatologist",
      hospital: "Apollo Hospital, Delhi",
      date: "15 Sep",
      time: "11:30 AM",
      status: "Completed",
    },
  ]);

  const renderItem = ({ item }) => {
    const isCompleted = item.status === "Completed";
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("AppointmentChatScreen", { doctor: item })
        }
        activeOpacity={0.8}
      >
        <View style={styles.avatarContainer}>
          <Icon name="person" size={24} color="#FDB022" />
        </View>
        <View style={{ marginLeft: 14, flex: 1 }}>
          <Text style={styles.docName}>{item.doctor}</Text>
          <Text style={styles.docSpeciality}>{item.speciality}</Text>
          <Text style={styles.docHospital}>{item.hospital}</Text>
          <View style={styles.dateRow}>
            <Icon name="calendar-outline" size={13} color="#626B78" style={{ marginRight: 4 }} />
            <Text style={styles.dateText}>
              {item.date} at {item.time}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, isCompleted ? styles.completedBadge : styles.bookedBadge]}>
          <Text
            style={[
              styles.statusText,
              isCompleted ? styles.completedText : styles.bookedText,
            ]}
          >
            {item.status}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#EFEEE9" translucent={false} />
      {/* Header */}
      <View style={styles.header}>
        {/* Back Arrow */}
        <TouchableOpacity 
          style={styles.circleButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Icon name="arrow-back" size={20} color="#2D3748" />
        </TouchableOpacity>

        {/* Header Title */}
        <Text style={styles.headerTitle}>My Appointments</Text>

        {/* Chat Icon */}
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => navigation.navigate("AppointmentChat")}
          activeOpacity={0.8}
        >
          <Icon name="chatbubbles-outline" size={20} color="#2D3748" />
        </TouchableOpacity>
      </View>

      {/* Appointment List */}
      <FlatList
        data={appointments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EFEEE9" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EFEEE9",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#D8D5CB",
  },
  circleButton: {
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
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#2D3748", letterSpacing: -0.3 },

  card: {
    flexDirection: "row",
    backgroundColor: "#EFEEE9",
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderTopColor: "#FFFFFF",
    borderLeftColor: "#FFFFFF",
    borderBottomColor: "#D8D5CB",
    borderRightColor: "#D8D5CB",
    elevation: 2,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    alignItems: "center",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E3DC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderTopColor: "#D3D0C6",
    borderLeftColor: "#D3D0C6",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
  },
  docName: { fontSize: 16, fontWeight: "700", color: "#2D3748" },
  docSpeciality: { fontSize: 13, color: "#D97706", fontWeight: "600", marginTop: 2 },
  docHospital: { fontSize: 13, color: "#626B78", marginTop: 2 },
  dateRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  dateText: { fontSize: 12, color: "#626B78", fontWeight: "500" },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginLeft: 8,
  },
  bookedBadge: {
    backgroundColor: "#FFF8EB",
    borderWidth: 1,
    borderColor: "#FDB022",
  },
  completedBadge: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#10B981",
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  bookedText: { color: "#D97706" },
  completedText: { color: "#059669" },
});

export default AppointmentScreen;
