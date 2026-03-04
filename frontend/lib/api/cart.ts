import { apiRequest, API } from "./client";

export interface CartItemDto {
  id: string;
  cartId: string;
  productVariantId: string | null;
  lensesVariantId: string | null;
  comboItemId: string | null;
  serviceId: string | null;
  slotId: string | null;
  quantity: number;
  unitPrice: number;
  note: string | null;
}

export interface CartDto {
  id: string;
  customerId: string;
  cartItems: CartItemDto[];
  totalAmount: number;
  status: string | null;
  createdAt: string;
}

export interface AddCartItemRequest {
  productId?: string | null;
  productVariantId?: string | null;
  lensesVariantId?: string | null;
  comboItemId?: string | null;
  serviceId?: string | null;
  slotId?: string | null;
  quantity: number;
  note?: string | null;
}

/** GET /api/cart */
export async function getCart(): Promise<CartDto> {
  return apiRequest<CartDto>(API.cart.get(), {}, { auth: true });
}

/** POST /api/cart/create */
export async function createCart(): Promise<CartDto> {
  return apiRequest<CartDto>(
    API.cart.create(),
    { method: "POST" },
    { auth: true },
  );
}

/** POST /api/cart/items */
export async function addCartItem(body: AddCartItemRequest): Promise<CartDto> {
  return apiRequest<CartDto>(
    API.cart.addItem(),
    { method: "POST", body: JSON.stringify(body) },
    { auth: true },
  );
}

/** PUT /api/cart/items/{cartItemId} */
export async function updateCartItem(
  cartItemId: string,
  quantity: number,
): Promise<CartDto> {
  return apiRequest<CartDto>(
    API.cart.updateItem(cartItemId),
    { method: "PUT", body: JSON.stringify({ quantity }) },
    { auth: true },
  );
}

/** DELETE /api/cart/items/{cartItemId} */
export async function removeCartItem(cartItemId: string): Promise<void> {
  await apiRequest<void>(
    API.cart.removeItem(cartItemId),
    { method: "DELETE" },
    { auth: true },
  );
}
