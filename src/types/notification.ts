export type NotificationCategory = 'inquiry' | 'price_drop' | 'booking' | 'payment' | 'system';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  timestamp: string;
  isRead: boolean;
  targetScreen?: string;
  targetId?: string;
}
