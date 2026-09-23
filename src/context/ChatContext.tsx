import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChatThread, ChatMessage } from '../types/chat';
import { INITIAL_CHATS } from '../mock/chatsData';

interface ChatContextType {
  threads: ChatThread[];
  unreadCount: number;
  getThreadById: (threadId: string) => ChatThread | undefined;
  sendMessage: (threadId: string, text: string) => void;
  startOrGetThreadForProperty: (
    propertyId: string,
    propertyTitle: string,
    propertyPrice: number,
    propertyImage: string,
    owner: { id: string; name: string; role: string }
  ) => string;
  markThreadAsRead: (threadId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_CHATS);

  const unreadCount = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);

  const getThreadById = (threadId: string) => {
    return threads.find((t) => t.id === threadId);
  };

  const markThreadAsRead = (threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t))
    );
  };

  const sendMessage = (threadId: string, text: string) => {
    if (!text.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user-me',
      senderName: 'You',
      text: text.trim(),
      timestamp: 'Just now',
      isMine: true,
      status: 'sent',
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            lastMessage: text.trim(),
            lastMessageTime: 'Just now',
            messages: [...t.messages, newMessage],
          };
        }
        return t;
      })
    );
  };

  const startOrGetThreadForProperty = (
    propertyId: string,
    propertyTitle: string,
    propertyPrice: number,
    propertyImage: string,
    owner: { id: string; name: string; role: string }
  ): string => {
    const existing = threads.find((t) => t.propertyId === propertyId || t.participant.id === owner.id);
    if (existing) {
      return existing.id;
    }

    const newThreadId = `chat-${Date.now()}`;
    const newThread: ChatThread = {
      id: newThreadId,
      propertyId,
      propertyTitle,
      propertyPrice,
      propertyImage,
      participant: {
        id: owner.id,
        name: owner.name,
        role: owner.role,
        isOnline: true,
      },
      lastMessage: `Inquired about ${propertyTitle}`,
      lastMessageTime: 'Just now',
      unreadCount: 0,
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: 'user-me',
          senderName: 'You',
          text: `Hi ${owner.name}, I am interested in "${propertyTitle}". Is it available?`,
          timestamp: 'Just now',
          isMine: true,
          status: 'sent',
        },
      ],
    };

    setThreads((prev) => [newThread, ...prev]);
    return newThreadId;
  };

  return (
    <ChatContext.Provider
      value={{
        threads,
        unreadCount,
        getThreadById,
        sendMessage,
        startOrGetThreadForProperty,
        markThreadAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
