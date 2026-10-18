/**
 * ChatListScreen - Redesigned with Premium Neumorphic UI
 * Displays user chats with real-time updates and search filtering
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
  TextInput,
  ToastAndroid,
  Platform,
  DeviceEventEmitter,
  Modal,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

// Components & Services
import ChatItem from '../components/ChatItem';
import { getUserChats, deleteChat, deleteAllChats, getCurrentUserId } from '../services/chatApi';
import useChatSocket from '../hooks/useChatSocket';

const colors = {
  primary: '#FDB022',
  primaryLight: '#FFF8EB',
  primaryDark: '#D97706',
  background: '#EFEEE9',
  cardBg: '#EFEEE9',
  white: '#FFFFFF',
  text: '#2D3748',
  lightText: '#626B78',
  borderHighlight: '#FFFFFF',
  borderShadow: '#D8D5CB',
  inputBg: '#E5E3DC',
  unread: '#EF4444',
  unreadLight: '#FEE2E2',
};

const ChatListScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deletingChatIds, setDeletingChatIds] = useState(new Set());

  // Get current user ID
  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
    };
    fetchUserId();
  }, []);

  // Fetch chats
  const fetchChats = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      const result = await getUserChats();
      
      if (result.success) {
        setChats(result.chats || []);
      } else {
        console.error('Failed to fetch chats:', result.error);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchChats();
  }, []);

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchChats(false);
    }, [])
  );

  // Real-time updates via WebSocket
  const handleNewMessage = useCallback((data) => {
    setChats(prevChats => {
      const chatId = data.chatId || data.chat?._id;
      if (!chatId) return prevChats;

      const existingChatIndex = prevChats.findIndex(chat => chat._id === chatId);
      
      if (existingChatIndex !== -1) {
        const updatedChats = [...prevChats];
        const chat = updatedChats[existingChatIndex];
        
        updatedChats[existingChatIndex] = {
          ...chat,
          lastMessage: {
            text: data.text || data.message?.text,
            sender: data.sender || data.message?.sender,
            timestamp: data.timestamp || data.message?.timestamp || new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
          unreadCount: data.sender !== currentUserId 
            ? (chat.unreadCount || 0) + 1 
            : chat.unreadCount,
        };

        return updatedChats.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      } else {
        fetchChats(false);
        return prevChats;
      }
    });
  }, [currentUserId]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('chatMessageSent', () => {
      fetchChats(false);
    });
    
    return () => subscription.remove();
  }, []);

  useChatSocket(null, handleNewMessage, null);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChats(false);
  };

  const handleChatPress = (chat) => {
    const participants = chat.participants || [];
    let otherParticipant = null;

    for (const p of participants) {
      const pId = p?._id || p?.id || p;
      if (String(pId) !== String(currentUserId)) {
        otherParticipant = (typeof p === 'object') ? p : { _id: pId, id: pId };
        break;
      }
    }

    if (!otherParticipant && participants.length > 0) {
      const p = participants[0];
      otherParticipant = (typeof p === 'object') ? p : { _id: p, id: p };
    }

    navigation.navigate('ChatDetailScreen', {
      chatId: chat._id,
      user: otherParticipant,
      propertyTitle: chat.propertyTitle || chat.property?.title || 'Property',
      propertyId: chat.propertyId || chat.property?._id,
    });
  };

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

  const handleDeleteChat = (chat) => {
    if (deletingChatIds.has(chat._id)) return;

    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this chat history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingChatIds(prev => new Set(prev).add(chat._id));
              setChats(prevChats => prevChats.filter(c => c._id !== chat._id));

              const result = await deleteChat(chat._id);
              
              if (result.success) {
                showToast(result.message || 'Chat deleted');
              } else {
                showToast(result.error || 'Failed to delete chat');
                fetchChats(false);
              }
            } catch (error) {
              console.error('Delete chat error:', error);
              showToast('Network error. Please try again.');
              fetchChats(false);
            } finally {
              setDeletingChatIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(chat._id);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const handleDeleteAllChats = () => {
    if (chats.length === 0) {
      showToast('No chats to delete');
      return;
    }

    Alert.alert(
      'Delete All Conversations',
      `Are you sure you want to delete all ${chats.length} conversations? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              setMenuVisible(false);
              setLoading(true);

              const result = await deleteAllChats();
              
              if (result.success) {
                setChats([]);
                showToast(result.message || 'All chats deleted');
              } else {
                showToast(result.error || 'Failed to delete all chats');
              }
            } catch (error) {
              console.error('Delete all chats error:', error);
              showToast('Network error. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const filteredChats = chats.filter(chat => {
    if (!search) return true;
    const query = search.toLowerCase();
    const propTitle = (chat.propertyTitle || chat.property?.title || '').toLowerCase();
    const ownerName = (chat.ownerName || chat.owner?.fullName || chat.tenant?.fullName || '').toLowerCase();
    const lastMsg = (chat.lastMessage?.text || chat.lastMessage?.content || '').toLowerCase();
    return propTitle.includes(query) || ownerName.includes(query) || lastMsg.includes(query);
  });

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrapper}>
          <Icon name="chatbubbles-outline" size={48} color={colors.lightText} />
        </View>
        <Text style={styles.emptyTitle}>No Conversations Yet</Text>
        <Text style={styles.emptySubtitle}>
          Connect directly with property owners and tenants to ask questions and arrange visits.
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}
        >
          <Icon name="search-outline" size={16} color="#1E293B" style={{ marginRight: 6 }} />
          <Text style={styles.browseButtonText}>Browse Properties</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderChatItem = ({ item }) => (
    <ChatItem
      chat={item}
      onPress={handleChatPress}
      onDelete={handleDeleteChat}
      currentUserId={currentUserId}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>Direct chat with owners & tenants</Text>
        </View>
        
        {/* Menu Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
          activeOpacity={0.8}
        >
          <Icon name="ellipsis-vertical" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Inset Search Field */}
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={18} color={colors.lightText} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={colors.lightText}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="close-circle" size={18} color={colors.lightText} />
          </TouchableOpacity>
        )}
      </View>

      {/* Custom Dropdown Menu */}
      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuDropdown}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteAllChats}
            >
              <Icon name="trash-outline" size={18} color={colors.unread} />
              <Text style={styles.menuItemText}>Delete All Chats</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Chat List */}
      {loading && chats.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.lightText,
    marginTop: 2,
    fontWeight: '500',
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderTopColor: colors.borderHighlight,
    borderLeftColor: colors.borderHighlight,
    borderBottomColor: colors.borderShadow,
    borderRightColor: colors.borderShadow,
    elevation: 2,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  // Inset Search Field
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBg,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopColor: "#D0CDC4",
    borderLeftColor: "#D0CDC4",
    borderBottomColor: "#FFFFFF",
    borderRightColor: "#FFFFFF",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
  },

  listContent: {
    paddingBottom: 110,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.lightText,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 32,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E3DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.lightText,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  browseButtonText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '800',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuDropdown: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    marginTop: 65,
    marginRight: 16,
    paddingVertical: 6,
    minWidth: 190,
    borderWidth: 1.5,
    borderTopColor: colors.borderHighlight,
    borderLeftColor: colors.borderHighlight,
    borderBottomColor: colors.borderShadow,
    borderRightColor: colors.borderShadow,
    elevation: 6,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: colors.unread,
    marginLeft: 10,
    fontWeight: '700',
  },
});

export default ChatListScreen;
