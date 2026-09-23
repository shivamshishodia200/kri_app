import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useChat } from '../../context/ChatContext';
import { ChatMessage } from '../../types/chat';
import { AppHeader } from '../../components/common/AppHeader';
import { formatIndianCurrency } from '../../components/common/PriceDisplay';
import { Icon } from '../../components/common/Icon';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatDetail'>;

const QUICK_PROMPTS = [
  'Is this still available?',
  'Can I visit this Saturday at 3 PM?',
  'What is the security deposit?',
  'Is parking space included?',
];

export const ChatDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { threadId, participantName } = route.params;
  const { getThreadById, sendMessage } = useChat();

  const thread = getThreadById(threadId);
  const [inputMessage, setInputMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    sendMessage(threadId, text.trim());
    setInputMessage('');

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleCall = () => {
    Alert.alert('Calling', `Connecting call to ${participantName || 'Property Contact'}...`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <AppHeader
        title={participantName || thread?.participant.name || 'Chat'}
        subtitle={thread?.participant.isOnline ? '🟢 Online now' : 'Active today'}
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCall}
            style={styles.callHeaderBtn}
          >
            <Icon name="phone" size={18} color={colors.primaryDark} />
          </TouchableOpacity>
        }
      />

      {/* Property banner if related to a property */}
      {thread?.propertyTitle && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            if (thread.propertyId) {
              navigation.navigate('PropertyDetail', { propertyId: thread.propertyId });
            }
          }}
          style={styles.propertyBanner}
        >
          {thread.propertyImage && (
            <Image source={{ uri: thread.propertyImage }} style={styles.propertyThumb} />
          )}
          <View style={styles.propertyMeta}>
            <Text style={styles.propertyTitle} numberOfLines={1}>
              {thread.propertyTitle}
            </Text>
            {thread.propertyPrice ? (
              <Text style={styles.propertyPrice}>
                {formatIndianCurrency(thread.propertyPrice)} / month
              </Text>
            ) : null}
          </View>
          <Icon name="chevron-right" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      )}

      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={thread?.messages || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.isMine ? styles.myBubble : styles.theirBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                item.isMine ? styles.myMessageText : styles.theirMessageText,
              ]}
            >
              {item.text}
            </Text>
            <View style={styles.timeRow}>
              <Text
                style={[
                  styles.timeText,
                  item.isMine ? styles.myTimeText : styles.theirTimeText,
                ]}
              >
                {item.timestamp}
              </Text>
              {item.isMine && (
                <Icon
                  name="check"
                  size={12}
                  color={item.status === 'read' ? colors.primaryDark : colors.textMuted}
                  strokeWidth={2.5}
                />
              )}
            </View>
          </View>
        )}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Quick Prompts */}
      <View style={styles.quickPromptsRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={QUICK_PROMPTS}
          keyExtractor={(item, i) => String(i)}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSend(item)}
              style={styles.promptChip}
            >
              <Text style={styles.promptText}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.xs }}
        />
      </View>

      {/* Bottom Input Field */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Type your message here..."
            placeholderTextColor={colors.textMuted}
            style={styles.textInput}
            multiline
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSend()}
            disabled={!inputMessage.trim()}
            style={[
              styles.sendButton,
              Boolean(inputMessage.trim()) && styles.sendButtonActive,
            ]}
          >
            <Icon
              name="arrow-right"
              size={18}
              color={inputMessage.trim() ? colors.darkText : colors.textMuted}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  callHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  propertyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  propertyThumb: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    marginRight: spacing.sm,
  },
  propertyMeta: {
    flex: 1,
  },
  propertyTitle: {
    ...typography.subtitle,
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkText,
  },
  propertyPrice: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  messagesContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.xl,
    marginBottom: spacing.sm,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: radii.xs,
  },
  theirBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radii.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    ...typography.bodyMedium,
    lineHeight: 20,
  },
  myMessageText: {
    color: colors.darkText,
    fontWeight: '500',
  },
  theirMessageText: {
    color: colors.textPrimary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 3,
  },
  timeText: {
    ...typography.caption,
    fontSize: 10,
  },
  myTimeText: {
    color: 'rgba(0,0,0,0.6)',
  },
  theirTimeText: {
    color: colors.textMuted,
  },
  quickPromptsRow: {
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
  },
  promptChip: {
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promptText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    ...typography.bodyMedium,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 90,
    color: colors.darkText,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
});
