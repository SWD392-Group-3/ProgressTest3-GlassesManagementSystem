"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as signalR from "@microsoft/signalr";
import { getToken, getUser } from "@/lib/auth-storage";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api/notification";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrderNotification {
  id: string; // DB Guid (hoặc random cho Sales notifications)
  orderId: string; // orderId / prescriptionId để navigate
  newStatus?: string; // dùng cho Customer (trạng thái đổi) / "PrescriptionRejected"
  customerName?: string; // dùng cho Sale (đơn mới)
  totalAmount?: number; // dùng cho Sale (đơn mới)
  message: string;
  timestamp: string;
  read: boolean;
  linkTo?: string; // link điều hướng từ DB
}

interface NotificationContextValue {
  /** Thông báo dành cho Customer (thay đổi trạng thái đơn) */
  notifications: OrderNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  /** Thông báo dành cho Sale (đơn mới thanh toán) */
  salesNotifications: OrderNotification[];
  salesUnreadCount: number;
  markSalesRead: (id: string) => void;
  markAllSalesRead: () => void;
  clearAllSales: () => void;
  /** Thông báo dành cho Operation (khách hàng xác nhận nhận hàng) */
  operationNotifications: OrderNotification[];
  operationUnreadCount: number;
  markOperationRead: (id: string) => void;
  markAllOperationRead: () => void;
  clearAllOperation: () => void;
}

const SALES_ROLES = ["Sales", "Admin"];

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  markRead: () => {},
  markAllRead: () => {},
  clearAll: () => {},
  salesNotifications: [],
  salesUnreadCount: 0,
  markSalesRead: () => {},
  markAllSalesRead: () => {},
  clearAllSales: () => {},
  operationNotifications: [],
  operationUnreadCount: 0,
  markOperationRead: () => {},
  markAllOperationRead: () => {},
  clearAllOperation: () => {},
});

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [salesNotifications, setSalesNotifications] = useState<
    OrderNotification[]
  >([]);
  const [operationNotifications, setOperationNotifications] = useState<
    OrderNotification[]
  >([]);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const salesUnreadCount = salesNotifications.filter((n) => !n.read).length;
  const operationUnreadCount = operationNotifications.filter(
    (n) => !n.read,
  ).length;

  // ── Load lịch sử thông báo từ DB khi mount ──
  useEffect(() => {
    const user = getUser();
    if (!user) return;

    const isCustomer = user.role === "Customer";
    const isSalesUser = SALES_ROLES.includes(user.role ?? "");
    const isOperationUser = user.role === "Operation";
    if (!isCustomer && !isSalesUser && !isOperationUser) return;

    fetchNotifications(50)
      .then((items) => {
        const mapped: OrderNotification[] = items.map((item) => {
          const segments = item.linkTo?.split("/").filter(Boolean) ?? [];
          const orderId =
            segments.length >= 2
              ? segments[segments.length - 1]
              : (segments[0] ?? "");
          return {
            id: item.id,
            orderId,
            newStatus:
              item.type === "prescription_rejected"
                ? "PrescriptionRejected"
                : item.type === "eye_result_ready"
                  ? "EyeResultReady"
                  : item.type,
            message: item.content,
            timestamp: item.createdAt,
            read: item.isRead,
            linkTo: item.linkTo ?? undefined,
          };
        });

        if (isCustomer) setNotifications(mapped);
        else if (isSalesUser) setSalesNotifications(mapped);
        else if (isOperationUser) setOperationNotifications(mapped);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const user = getUser();
    const token = getToken();
    if (!user || !token) return;

    const isCustomer = user.role === "Customer" && !!user.customerId;
    const isSales = SALES_ROLES.includes(user.role ?? "");
    const isOperation = user.role === "Operation";

    if (!isCustomer && !isSales && !isOperation) return;

    let isMounted = true;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5000/hubs/notification", {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect([2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.None)
      .build();

    // Bắt lỗi reconnect/close để tránh unhandled rejection
    connection.onreconnecting(() => {});
    connection.onreconnected(() => {});
    connection.onclose(() => {});

    // ── Customer: nhận thông báo thay đổi trạng thái đơn ──
    if (isCustomer) {
      connection.on(
        "OrderStatusChanged",
        (data: {
          orderId: string;
          newStatus: string;
          message: string;
          timestamp: string;
        }) => {
          if (!isMounted) return;
          setNotifications((prev) =>
            [
              {
                id: `${Date.now()}-${Math.random()}`,
                orderId: data.orderId,
                newStatus: data.newStatus,
                message: data.message,
                timestamp: data.timestamp,
                read: false,
              },
              ...prev,
            ].slice(0, 50),
          );
        },
      );

      connection.on(
        "PrescriptionRejected",
        (data: {
          prescriptionId: string;
          message: string;
          timestamp: string;
        }) => {
          if (!isMounted) return;
          setNotifications((prev) =>
            [
              {
                id: `${Date.now()}-${Math.random()}`,
                orderId: data.prescriptionId,
                newStatus: "PrescriptionRejected",
                message: data.message,
                timestamp: data.timestamp,
                read: false,
              },
              ...prev,
            ].slice(0, 50),
          );
        },
      );

      connection.on(
        "EyeResultReady",
        (data: { orderId: string; message: string; timestamp: string }) => {
          if (!isMounted) return;
          setNotifications((prev) =>
            [
              {
                id: `${Date.now()}-${Math.random()}`,
                orderId: data.orderId,
                newStatus: "EyeResultReady",
                message: data.message,
                timestamp: data.timestamp,
                read: false,
                linkTo: `/orders/${data.orderId}?tab=eye-result`,
              },
              ...prev,
            ].slice(0, 50),
          );
        },
      );
    }

    // ── Sale: nhận thông báo đơn hàng mới được thanh toán ──
    if (isSales) {
      connection.on(
        "NewOrderPaid",
        (data: {
          orderId: string;
          customerName: string;
          totalAmount: number;
          message: string;
          timestamp: string;
        }) => {
          if (!isMounted) return;
          setSalesNotifications((prev) =>
            [
              {
                id: `${Date.now()}-${Math.random()}`,
                orderId: data.orderId,
                customerName: data.customerName,
                totalAmount: data.totalAmount,
                message: data.message,
                timestamp: data.timestamp,
                read: false,
              },
              ...prev,
            ].slice(0, 50),
          );
        },
      );
    }

    // ── Operation: nhận thông báo khách xác nhận nhận hàng ──
    if (isOperation) {
      connection.on(
        "DeliveryConfirmed",
        (data: {
          orderId: string;
          customerName: string;
          message: string;
          timestamp: string;
        }) => {
          if (!isMounted) return;
          setOperationNotifications((prev) =>
            [
              {
                id: `${Date.now()}-${Math.random()}`,
                orderId: data.orderId,
                customerName: data.customerName,
                message: data.message,
                timestamp: data.timestamp,
                read: false,
              },
              ...prev,
            ].slice(0, 50),
          );
        },
      );
    }

    connection
      .start()
      .then(async () => {
        if (!isMounted) {
          await connection.stop();
          return;
        }
        if (isCustomer)
          await connection.invoke("JoinCustomerGroup", user.customerId!);
        if (isSales) await connection.invoke("JoinSalesGroup");
        if (isOperation) await connection.invoke("JoinOperationGroup");
        connectionRef.current = connection;
      })
      .catch(() => {
        // Backend chưa chạy hoặc mạng lỗi — bỏ qua, không throw lên global
      });

    return () => {
      isMounted = false;
      const conn = connectionRef.current;
      connectionRef.current = null;
      if (conn && conn.state !== signalR.HubConnectionState.Disconnected) {
        const leaves: Promise<void>[] = [];
        if (isCustomer)
          leaves.push(
            conn.invoke("LeaveCustomerGroup", user.customerId!).catch(() => {}),
          );
        if (isSales)
          leaves.push(conn.invoke("LeaveSalesGroup").catch(() => {}));
        if (isOperation)
          leaves.push(conn.invoke("LeaveOperationGroup").catch(() => {}));
        Promise.all(leaves).finally(() => conn.stop().catch(() => {}));
      }
    };
  }, []);

  // ── Helpers (gọi API nếu id là DB Guid) ──
  const isDbGuid = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const markRead = (id: string) => {
    if (isDbGuid(id)) markNotificationRead(id).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };
  const markAllRead = () => {
    markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const clearAll = () => setNotifications([]);

  const markSalesRead = (id: string) => {
    if (isDbGuid(id)) markNotificationRead(id).catch(() => {});
    setSalesNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };
  const markAllSalesRead = () => {
    markAllNotificationsRead().catch(() => {});
    setSalesNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const clearAllSales = () => setSalesNotifications([]);

  const markOperationRead = (id: string) => {
    if (isDbGuid(id)) markNotificationRead(id).catch(() => {});
    setOperationNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };
  const markAllOperationRead = () => {
    markAllNotificationsRead().catch(() => {});
    setOperationNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true })),
    );
  };
  const clearAllOperation = () => setOperationNotifications([]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markRead,
        markAllRead,
        clearAll,
        salesNotifications,
        salesUnreadCount,
        markSalesRead,
        markAllSalesRead,
        clearAllSales,
        operationNotifications,
        operationUnreadCount,
        markOperationRead,
        markAllOperationRead,
        clearAllOperation,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
