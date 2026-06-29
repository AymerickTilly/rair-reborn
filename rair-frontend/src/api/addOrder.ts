import { getIdToken } from "../auth/AuthStore";
import { API_BASE_URL } from "./config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function addOrder(orderData: any): Promise<any | null> {
  try {
    const idToken = await getIdToken();
    if (!idToken) {
      console.error("No ID token available");
      return null;
    }

    const res = await fetch(`${API_BASE_URL}/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      console.error("Order creation failed addOrder.ts:", res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error creating order addOrder.ts:", err);
    return null;
  }
}
