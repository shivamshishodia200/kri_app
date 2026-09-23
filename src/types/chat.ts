export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatThread {
  id: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyPrice?: number;
  propertyImage?: string;
  participant: {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
    isOnline: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}
