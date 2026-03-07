"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, CheckCheck, Package, ShoppingBag } from "lucide-react";
import { useNotifications, OrderNotification } from "@/lib/NotificationContext";

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

function statusColor(status?: string): string {
  switch (status) {
    case "Confirmed":
    case "Delivered":
      return "text-green-600";
    case "Shipped":
    case "Manufacturing":
    case "ProcessingTemplate":
      return "text-blue-600";
    case "Cancelled":
    case "Rejected":
    case "PrescriptionRejected":
      return "text-red-500";
    default:
      return "text-amber-500";
  }
}

interface Props {
  /** "customer" = nhận OrderStatusChanged | "sales" = nhận NewOrderPaid | "operation" = nhận DeliveryConfirmed */
  mode?: "customer" | "sales" | "operation";
}

export default function NotificationBell({ mode = "customer" }: Props) {
  const {
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
  } = useNotifications();

  const isSales = mode === "sales";
  const isOperation = mode === "operation";
  const items: OrderNotification[] = isOperation
    ? operationNotifications
    : isSales
      ? salesNotifications
      : notifications;
  const count = isOperation
    ? operationUnreadCount
    : isSales
      ? salesUnreadCount
      : unreadCount;
  const onMarkRead = isOperation
    ? markOperationRead
    : isSales
      ? markSalesRead
      : markRead;
  const onMarkAll = isOperation
    ? markAllOperationRead
    : isSales
      ? markAllSalesRead
      : markAllRead;
  const onClear = isOperation
    ? clearAllOperation
    : isSales
      ? clearAllSales
      : clearAll;

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleNotificationClick(n: OrderNotification) {
    onMarkRead(n.id);
    setOpen(false);
    if (isOperation) {
      router.push(`/operation/orders/${n.orderId}`);
    } else if (isSales) {
      router.push(`/sales/orders/${n.orderId}`);
    } else if (n.newStatus === "PrescriptionRejected") {
      router.push(`/prescriptions`);
    } else {
      router.push(`/orders/${n.orderId}`);
    }
  }

  const Icon = isSales || isOperation ? ShoppingBag : Bell;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Thông báo"
      >
        <Icon className="w-5 h-5 text-gray-700" />
        {count > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-800 text-sm">
              {isOperation
                ? "Xác nhận nhận hàng"
                : isSales
                  ? "Đơn hàng mới"
                  : "Thông báo"}
            </span>
            <div className="flex items-center gap-2">
              {count > 0 && (
                <button
                  onClick={onMarkAll}
                  className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Đánh dấu đã đọc
                </button>
              )}
              {items.length > 0 && (
                <button
                  onClick={onClear}
                  className="text-xs text-gray-400 hover:text-red-500"
                  title="Xóa tất cả"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                <Bell className="w-8 h-8 opacity-30" />
                <span className="text-sm">Chưa có thông báo</span>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 items-start ${
                    !n.read ? "bg-blue-50/60" : ""
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <Package
                      className={`w-4 h-4 ${statusColor(n.newStatus)}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-snug">
                      {n.message}
                    </p>
                    {isSales && n.totalAmount != null && (
                      <p className="text-xs text-amber-600 font-medium mt-0.5">
                        {n.totalAmount.toLocaleString("vi-VN")}đ
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {timeAgo(n.timestamp)}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
