"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  CartDto,
  getCart,
  createCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  AddCartItemRequest,
} from "./api";
import { getUser } from "./auth-storage";

interface CartContextValue {
  cart: CartDto | null;
  cartCount: number;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (body: AddCartItemRequest) => Promise<void>;
  updateItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    const user = getUser();
    if (!user) return;
    setLoading(true);
    try {
      let data = await getCart(user.userId).catch(() => null);
      if (!data) {
        data = await createCart(user.userId);
      }
      setCart(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(async (body: AddCartItemRequest) => {
    const user = getUser();
    if (!user) throw new Error("Vui lòng đăng nhập.");
    const data = await addCartItem(user.userId, body);
    setCart(data);
  }, []);

  const updateItem = useCallback(
    async (cartItemId: string, quantity: number) => {
      const data = await updateCartItem(cartItemId, quantity);
      setCart(data);
    },
    [],
  );

  const removeItem = useCallback(async (cartItemId: string) => {
    await removeCartItem(cartItemId);
    setCart((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.filter((i) => i.cartItemId !== cartItemId),
            totalAmount: prev.items
              .filter((i) => i.cartItemId !== cartItemId)
              .reduce((s, i) => s + i.unitPrice * i.quantity, 0),
          }
        : prev,
    );
  }, []);

  const cartCount = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,
        fetchCart,
        addItem,
        updateItem,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
