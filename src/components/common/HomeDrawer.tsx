import React from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import { Icon, IconName } from './Icon';

type HomeRoute = 'SearchListings' | 'Shortlisted' | 'ChatList' | 'NotificationList' |
  'MyProperties' | 'PayRent' | 'PayBills' | 'Subscription' | 'Settings';

interface HomeDrawerProps {
  visible: boolean;
  role: 'buyer' | 'owner';
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onClose: () => void;
}

export const HomeDrawer: React.FC<HomeDrawerProps> = ({
  visible,
  role,
  navigation,
  onClose,
}) => {
  const { user, logout } = useAuth();
  const isOwner = role === 'owner';

  const items: { label: string; icon: IconName; route: HomeRoute }[] = [
    ...(!isOwner ? [{ label: 'Search homes', icon: 'search' as IconName, route: 'SearchListings' as HomeRoute }] : []),
    ...(!isOwner ? [{ label: 'Saved properties', icon: 'heart' as IconName, route: 'Shortlisted' as HomeRoute }] : []),
    ...(isOwner ? [{ label: 'My properties', icon: 'building' as IconName, route: 'MyProperties' as HomeRoute }] : []),
    { label: 'Chats', icon: 'chat', route: 'ChatList' },
    { label: 'Notifications', icon: 'bell', route: 'NotificationList' },
    { label: 'Pay rent', icon: 'credit-card', route: 'PayRent' },
    { label: 'Pay bills', icon: 'list', route: 'PayBills' },
    ...(isOwner ? [{ label: 'Listing plans', icon: 'award' as IconName, route: 'Subscription' as HomeRoute }] : []),
    { label: 'Settings', icon: 'settings', route: 'Settings' },
  ];

  const navigateTo = (route: HomeRoute) => {
    onClose();
    navigation.navigate(route as never);
  };

  const confirmLogout = () => {
    onClose();
    Alert.alert('Log out?', 'You will need to sign in again to access your account.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.drawer} onPress={(event) => event.stopPropagation()}>
          <View style={styles.drawerHeader}>
            <View style={styles.userMark}><Icon name={isOwner ? 'building' : 'user'} size={20} color={colors.darkText} /></View>
            <View style={styles.userText}>
              <Text style={styles.name} numberOfLines={1}>{user?.name || 'Kirayedar24 member'}</Text>
              <Text style={styles.role}>{isOwner ? 'Owner / Landlord' : 'Buyer / Tenant'}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Close menu">
              <Icon name="close" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.items}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={styles.item}
                onPress={() => navigateTo(item.route)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <Icon name={item.icon} size={19} color={colors.textSecondary} />
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Icon name="chevron-right" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.logout} onPress={confirmLogout} accessibilityRole="button" accessibilityLabel="Log out">
            <Icon name="logout" size={18} color={colors.danger} />
            <Text style={styles.logoutLabel}>Log out</Text>
          </TouchableOpacity>
          <Text style={styles.modeLabel}>DEMO APP · {isOwner ? 'OWNER' : 'BUYER'} MODE</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(7, 14, 24, 0.58)' },
  drawer: { width: '84%', maxWidth: 360, height: '100%', backgroundColor: colors.surface, paddingTop: 54, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  userMark: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySubtle },
  userText: { flex: 1, marginLeft: spacing.md },
  name: { ...typography.subtitle, color: colors.darkText, fontSize: 16, fontWeight: '700' },
  role: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  items: { paddingVertical: spacing.md },
  item: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.sm },
  itemLabel: { ...typography.bodyMedium, color: colors.textPrimary, flex: 1, fontWeight: '600' },
  logout: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  logoutLabel: { ...typography.bodyMedium, color: colors.danger, fontWeight: '700' },
  modeLabel: { ...typography.badge, color: colors.textMuted, fontSize: 10, marginTop: spacing.sm, paddingHorizontal: spacing.sm },
});