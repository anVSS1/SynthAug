import { create } from 'zustand';
import api from '../services/api';

export interface Notification {
  _id: string;
  projectId: string;
  projectName: string;
  message: string;
  type: 'success' | 'error' | 'info';
  createdAt: string;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: { projectId: string; projectName: string; message: string; type: 'success' | 'error' | 'info' }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  
  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const res = await api.get('/notifications');
      set({ notifications: res.data, loading: false });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ loading: false });
    }
  },
  
  addNotification: async (notification) => {
    try {
      const res = await api.post('/notifications', notification);
      set((state) => ({
        notifications: [res.data, ...state.notifications],
      }));
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  },
  
  markAsRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        ),
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },
  
  markAllAsRead: async () => {
    try {
      await api.put('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      }));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },
  
  clearNotification: async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      set((state) => ({
        notifications: state.notifications.filter((n) => n._id !== id),
      }));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },
  
  clearAll: async () => {
    try {
      await api.delete('/notifications');
      set({ notifications: [] });
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  },
  
  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },
}));
