import { getIdToken } from "../auth/AuthStore";
import { API_BASE_URL } from "./config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateOrder(orderData: any): Promise<any | null> {
  try {
    const idToken = await getIdToken();
    console.log("ID Token from update order:", idToken ? "Valid token" : "No token");

    if (!idToken) {
      console.error("No ID token available in update order");
      return null;
    }

    console.log("Sending PUT request with orderData:", orderData);
    const res = await fetch(
      `${API_BASE_URL}/order`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(orderData),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Product update failed in update_order.ts:", {
        status: res.status,
        statusText: res.statusText,
        responseText: errorText,
      });
      return null;
    }

    const data = await res.json();
    console.log("Update response:", data);
    return data;
  } catch (error) {
    console.error("Error updating product update_order.ts:", error);
    return null;
  }
}