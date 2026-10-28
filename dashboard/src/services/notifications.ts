import { apiClient, ApiEnvelope } from "@/lib/apiClient";

export interface Notification {
  _id: string;
  type: 'subscriber' | 'contact' | 'enquiry' | 'newsletter' | 'property' | 'blog' | 'comment';
  message: string;
  read: boolean;
  relatedId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  unreadCount: number;
}

export const fetchNotifications = async (token: string, limit?: number, unreadOnly?: boolean) => {
  const response = await apiClient<ApiEnvelope<Notification[]> & { unreadCount?: number }>(
    `/notifications?limit=${limit || 20}${unreadOnly ? '&unreadOnly=true' : ''}`,
    { token }
  );
  
  return {
    success: response.success,
    data: {
      data: response.data || [],
      unreadCount: response.unreadCount || 0
    }
  };
};

export const markNotificationAsRead = (token: string, id: string) =>
  apiClient<ApiEnvelope<Notification>>(`/notifications/${id}/read`, {
    method: "PATCH",
    token,
  });

export const markAllNotificationsAsRead = (token: string) =>
  apiClient<ApiEnvelope<{ message: string }>>(`/notifications/read-all`, {
    method: "PATCH",
    token,
  });

export const deleteNotification = (token: string, id: string) =>
  apiClient<ApiEnvelope<{ message: string }>>(`/notifications/${id}`, {
    method: "DELETE",
    token,
  });

export const clearAllNotifications = (token: string) =>
  apiClient<ApiEnvelope<{ message: string }>>(`/notifications`, {
    method: "DELETE",
    token,
  });

