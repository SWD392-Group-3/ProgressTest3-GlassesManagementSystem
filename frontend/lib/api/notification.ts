import { API, apiRequest } from "./client";

export interface NotificationDto {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  status: "unread" | "read";
  linkTo: string | null;
  createdAt: string;
  readAt: string | null;
  isRead: boolean;
}

/** Lấy danh sách thông báo của người dùng hiện tại */
export async function fetchNotifications(
  limit = 50,
): Promise<NotificationDto[]> {
  return apiRequest<NotificationDto[]>(
    `${API.notification.getMyNotifications}?limit=${limit}`,
    { method: "GET" },
    { auth: true },
  );
}

/** Đánh dấu một thông báo đã đọc */
export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  await apiRequest<void>(
    API.notification.markRead(notificationId),
    { method: "PATCH" },
    { auth: true },
  );
}

/** Đánh dấu tất cả thông báo là đã đọc */
export async function markAllNotificationsRead(): Promise<void> {
  await apiRequest<void>(
    API.notification.markAllRead,
    { method: "PATCH" },
    { auth: true },
  );
}
