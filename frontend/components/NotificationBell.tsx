"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, CheckCheck, Package, ShoppingBag } from "lucide-react";
import { useNotifications, OrderNotification } from "@/lib/NotificationContext";

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function normalizeLegacyMessageToEnglish(message: string): string {
  const directMap: Record<string, string> = {
    "Đơn hàng của bạn đã được xác nhận.": "Your order has been confirmed.",
    "Đơn hàng của bạn đang được chuẩn bị.": "Your order is being prepared.",
    "Đơn hàng của bạn đang trong quá trình sản xuất.":
      "Your order is in manufacturing.",
    "Đơn hàng của bạn đang được giao.": "Your order has been shipped.",
    "Đơn hàng của bạn đã được giao. Cảm ơn bạn!":
      "Your order has been delivered. Thank you!",
    "Đơn hàng của bạn đã bị hủy.": "Your order has been cancelled.",
    "Đơn hàng của bạn đã bị từ chối.": "Your order has been rejected.",
    "Đơn hàng của bạn đã hoàn tất.": "Your order is completed.",
    "Yêu cầu kính theo toa của bạn đã bị từ chối.":
      "Your prescription request has been rejected.",
    "Đã có kết quả đo mắt": "Eye exam results ready",
    "Nhân viên đã cập nhật kết quả đo mắt của bạn. Nhấn để xem chi tiết.":
      "Staff has recorded your eye exam results. Tap to view details.",
    "Khách hàng đã xác nhận nhận hàng": "Customer confirmed delivery",
    "Đơn hàng sẵn sàng xử lý": "Order ready for operations",
    "Đơn hàng mới chờ duyệt": "New order pending approval",
    "Yêu cầu kính theo toa bị từ chối": "Prescription request rejected",
    "Xác nhận giao hàng": "Confirm delivery",
    "Đơn hàng mới": "New orders",
    "Thông báo": "Notifications",
  };

  if (directMap[message]) return directMap[message];

  if (message.includes("đã xác nhận nhận hàng. Đơn đã hoàn tất.")) {
    return message
      .replace("Khách hàng ", "Customer ")
      .replace(
        " đã xác nhận nhận hàng. Đơn đã hoàn tất.",
        " has confirmed receipt. Order completed.",
      );
  }

  if (
    message.includes(" vừa đặt đơn ") &&
    message.includes(" VND. Vui lòng kiểm tra và xác nhận.")
  ) {
    return message
      .replace("Khách hàng ", "Customer ")
      .replace(" vừa đặt đơn ", " just placed an order for ")
      .replace(
        " VND. Vui lòng kiểm tra và xác nhận.",
        " VND. Please review and approve.",
      );
  }

  if (
    message.includes("Sales đã xác nhận đơn của khách hàng ") &&
    message.includes(". Vui lòng tiếp tục quy trình xử lý.")
  ) {
    return message
      .replace(
        "Sales đã xác nhận đơn của khách hàng ",
        "Sales confirmed order from ",
      )
      .replace(
        ". Vui lòng tiếp tục quy trình xử lý.",
        ". Please continue fulfillment workflow.",
      );
  }

  if (message.startsWith("Trạng thái đơn hàng đã được cập nhật: ")) {
    const status = message
      .replace("Trạng thái đơn hàng đã được cập nhật: ", "")
      .replace(/\.$/, "");
    return `Order status updated: ${status}.`;
  }

  if (message.includes("Lý do:")) {
    return message.replace("Lý do:", "Reason:");
  }

  if (message.includes("Yêu cầu kính theo toa của bạn đã bị từ chối.")) {
    return message.replace(
      "Yêu cầu kính theo toa của bạn đã bị từ chối.",
      "Your prescription request has been rejected.",
    );
  }

  return message;
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
  mode?: "customer" | "sales" | "operation" | "manager";
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
    managerNotifications,
    managerUnreadCount,
    markManagerRead,
    markAllManagerRead,
    clearAllManager,
  } = useNotifications();

  const isSales = mode === "sales";
  const isOperation = mode === "operation";
  const isManager = mode === "manager";
  const items: OrderNotification[] = isManager
    ? managerNotifications
    : isOperation
      ? operationNotifications
      : isSales
        ? salesNotifications
        : notifications;
  const count = isManager
    ? managerUnreadCount
    : isOperation
      ? operationUnreadCount
      : isSales
        ? salesUnreadCount
        : unreadCount;
  const onMarkRead = isManager
    ? markManagerRead
    : isOperation
      ? markOperationRead
      : isSales
        ? markSalesRead
        : markRead;
  const onMarkAll = isManager
    ? markAllManagerRead
    : isOperation
      ? markAllOperationRead
      : isSales
        ? markAllSalesRead
        : markAllRead;
  const onClear = isManager
    ? clearAllManager
    : isOperation
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
    if (n.linkTo) {
      router.push(n.linkTo);
      return;
    }
    if (isOperation) {
      router.push(`/operation/orders/${n.orderId}`);
    } else if (isManager) {
      router.push(`/manager/feedbacks`);
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
        aria-label="Notifications"
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
                ? "Confirm delivery"
                : isManager
                  ? "New reviews"
                  : isSales
                    ? "New orders"
                    : "Notifications"}
            </span>
            <div className="flex items-center gap-2">
              {count > 0 && (
                <button
                  onClick={onMarkAll}
                  className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              {items.length > 0 && (
                <button
                  onClick={onClear}
                  className="text-xs text-gray-400 hover:text-red-500"
                  title="Clear all"
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
                <span className="text-sm">No notifications</span>
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
                      {normalizeLegacyMessageToEnglish(n.message)}
                    </p>
                    {isSales && n.totalAmount != null && (
                      <p className="text-xs text-amber-600 font-medium mt-0.5">
                        {n.totalAmount.toLocaleString("en-US")} VND
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
