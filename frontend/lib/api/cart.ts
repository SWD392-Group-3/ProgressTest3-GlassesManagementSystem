import { apiRequest, API } from "./client";

export interface CartItemDto {
  cartItemId: string;
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
  cartId: string;
  customerId: string;
  items: CartItemDto[];
  totalAmount: number;
}

export interface AddCartItemRequest {
  productVariantId?: string | null;
  lensesVariantId?: string | null;
  comboItemId?: string | null;
  serviceId?: string | null;
  slotId?: string | null;
  quantity: number;
  note?: string | null;
}

/** GET /api/cart/{customerId} */
export async function getCart(customerId: string): Promise<CartDto> {
  return apiRequest<CartDto>(API.cart.get(customerId), {}, { auth: true });
}

/** POST /api/cart/{customerId}/create */
export async function createCart(customerId: string): Promise<CartDto> {
  return apiRequest<CartDto>(
    API.cart.create(customerId),
    { method: "POST" },
    { auth: true },
  );
}

/** POST /api/cart/{customerId}/items */
export async function addCartItem(
  customerId: string,
  body: AddCartItemRequest,
): Promise<CartDto> {
  return apiRequest<CartDto>(
    API.cart.addItem(customerId),
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
