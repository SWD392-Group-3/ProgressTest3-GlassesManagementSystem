import { CartProvider } from "@/lib/CartContext";
import { NotificationProvider } from "@/lib/NotificationContext";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <NotificationProvider>{children}</NotificationProvider>
    </CartProvider>
  );
}
