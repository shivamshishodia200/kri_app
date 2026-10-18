import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEYS = {
  push: 'notifications_push',
  email: 'notifications_email',
  sms: 'notifications_sms',
};

const NotificationsScreen = ({ navigation }) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await AsyncStorage.getItem(SETTINGS_KEYS.push);
        const e = await AsyncStorage.getItem(SETTINGS_KEYS.email);
        const s = await AsyncStorage.getItem(SETTINGS_KEYS.sms);
        if (p !== null) setPushEnabled(p === '1');
        if (e !== null) setEmailEnabled(e === '1');
        if (s !== null) setSmsEnabled(s === '1');
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  const persist = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value ? '1' : '0');
    } catch (err) {
      // ignore
    }
  };

  const togglePush = (val) => {
    setPushEnabled(val);
    persist(SETTINGS_KEYS.push, val);
  };
  const toggleEmail = (val) => {
    setEmailEnabled(val);
    persist(SETTINGS_KEYS.email, val);
  };
  const toggleSms = (val) => {
    setSmsEnabled(val);
    persist(SETTINGS_KEYS.sms, val);
  };

  const resetAll = () => {
    Alert.alert('Reset notifications', 'Reset notification preferences to defaults?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => {
        setPushEnabled(true);
        setEmailEnabled(true);
        setSmsEnabled(false);
        await persist(SETTINGS_KEYS.push, true);
        await persist(SETTINGS_KEYS.email, true);
        await persist(SETTINGS_KEYS.sms, false);
      } }
    ]);
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar translucent={false} backgroundColor="#EFEEE9" barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.8}>
          <Icon name="arrow-back" size={20} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Push Notifications</Text>
            <Text style={styles.rowSubtitle}>Receive app alerts for messages and enquiries</Text>
          </View>
          <Switch 
            value={pushEnabled} 
            onValueChange={togglePush} 
            thumbColor={pushEnabled ? '#FDB022' : '#FAF9F6'}
            trackColor={{ false: '#D3D0C6', true: '#FEEFC3' }}
          />
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Email Notifications</Text>
            <Text style={styles.rowSubtitle}>Weekly summaries and important updates</Text>
          </View>
          <Switch 
            value={emailEnabled} 
            onValueChange={toggleEmail} 
            thumbColor={emailEnabled ? '#FDB022' : '#FAF9F6'}
            trackColor={{ false: '#D3D0C6', true: '#FEEFC3' }}
          />
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>SMS Notifications</Text>
            <Text style={styles.rowSubtitle}>Time-critical alerts via SMS</Text>
          </View>
          <Switch 
            value={smsEnabled} 
            onValueChange={toggleSms} 
            thumbColor={smsEnabled ? '#FDB022' : '#FAF9F6'}
            trackColor={{ false: '#D3D0C6', true: '#FEEFC3' }}
          />
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetAll} activeOpacity={0.8}>
          <Text style={styles.resetButtonText}>Reset to defaults</Text>
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
    marginRight: 12,
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
  content: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#626B78',
    marginTop: 4,
    maxWidth: 240,
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: '#FDB022',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#FDB022',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  resetButtonText: {
    color: '#1E293B',
    fontWeight: '800',
    fontSize: 15,
  },
});

export default NotificationsScreen;
