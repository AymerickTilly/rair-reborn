import { getIdToken } from "../auth/AuthStore";
import { API_BASE_URL } from "./config";

// The API prices the order, checks and decrements stock, and empties the ordered cart items itself,
// so the client only sends what the customer wants.
export interface CreateOrderPayload {
  shippingAddress: string;
  paymentMethod: string;
  products: { cartId: string; productId: string; size: string; quantity: number }[];
}

// Throws an Error carrying the API's message (e.g. "Only 2 left of X in size M.") so the page can show it.
export async function addOrder(orderData: CreateOrderPayload): Promise<{ orderId: string }> {
  const idToken = await getIdToken();
  if (!idToken) throw new Error("You are signed out. Please sign in again.");

  const res = await fetch(`${API_BASE_URL}/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Could not place the order. Please try again.");
  }

  return res.json();
}
