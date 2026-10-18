import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, FlatList, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from "react-native-vector-icons/Ionicons";

const FAQS = [
  { id: '1', q: 'How do I list a property?', a: 'Go to Add Property from the home screen and fill in the details. Include good photos and a clear description.' },
  { id: '2', q: 'How are leads delivered?', a: 'Leads are delivered via in-app messages and email. You can control delivery from Notifications settings.' },
  { id: '3', q: 'How do I contact support?', a: 'Use the Contact Support button below or email support@gharplot.example.' },
];

const HelpScreen = ({ navigation }) => {
  const [expanded, setExpanded] = useState(null);

  const toggle = (id) => setExpanded(prev => (prev === id ? null : id));

  const contactSupport = () => {
  const email = 'support@gharplot.example';
    const subject = encodeURIComponent('Support request');
    const body = encodeURIComponent('Describe your issue here...');
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
    Linking.openURL(url).catch(() => {
  Alert.alert('Unable to open mail client', 'Please email support@gharplot.example');
    });
  };

  const openChat = () => {
    // If your app has a chat screen, you can navigate to it. Fallback to contact support.
    if (navigation && navigation.navigate) {
      try {
        navigation.navigate('AppointmentChatScreen');
        return;
      } catch (e) {}
    }
    contactSupport();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar translucent={false} backgroundColor="#EFEEE9" barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
          <Icon name="arrow-back" size={20} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <FlatList
        data={FAQS}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.8} style={styles.faqItem} onPress={() => toggle(item.id)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="help-circle" size={20} color="#D97706" style={{ marginRight: 10 }} />
              <Text style={styles.faqQuestion}>{item.q}</Text>
            </View>
            {expanded === item.id && <Text style={styles.faqAnswer}>{item.a}</Text>}
          </TouchableOpacity>
        )}
      />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.contactButton} onPress={openChat} activeOpacity={0.8}>
          <Text style={styles.contactText}>Chat with Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.contactButton, styles.secondary]} onPress={contactSupport} activeOpacity={0.8}>
          <Text style={[styles.contactText, { color: '#2D3748' }]}>Email Support</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEEE9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#EFEEE9',
    borderBottomWidth: 1,
    borderBottomColor: '#D8D5CB',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFEEE9',
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
    color: '#2D3748',
    letterSpacing: -0.3,
  },
  list: {
    padding: 16,
  },
  faqItem: {
    backgroundColor: '#EFEEE9',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
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
  faqQuestion: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
  },
  faqAnswer: {
    marginTop: 8,
    color: '#626B78',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    padding: 16,
    paddingBottom: 30,
  },
  contactButton: {
    backgroundColor: '#FDB022',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#FDB022',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  contactText: {
    color: '#1E293B',
    fontWeight: '800',
    fontSize: 15,
  },
  secondary: {
    backgroundColor: '#EFEEE9',
    borderWidth: 1,
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderBottomColor: '#D8D5CB',
    borderRightColor: '#D8D5CB',
    elevation: 1,
  },
});

export default HelpScreen;
