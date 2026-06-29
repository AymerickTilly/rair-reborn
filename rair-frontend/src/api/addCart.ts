import { getIdToken } from "../auth/AuthStore";
import { API_BASE_URL } from "./config";
import { Cart } from "../types/Cart";

export async function addToCart(cartData: Cart): Promise<{ message: string; item: Cart } | null> {
  try {
    const idToken = await getIdToken();
    console.log("ID Token from addToCart:", idToken ? "Valid token" : "No token");

    if (!idToken) {
      console.error("No ID token available in addToCart");
      throw new Error("No ID token available");
    }

    console.log("Sending POST request with cartData:", cartData);
    const res = await fetch(
      `${API_BASE_URL}/cart`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(cartData),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Cart add failed in addToCart.ts:", {
        status: res.status,
        statusText: res.statusText,
        responseText: errorText,
      });
      throw new Error(`Cart add failed: ${res.status} ${res.statusText} - ${errorText}`);
    }

    const data = await res.json();
    console.log("Add to cart response:", data);
    return data;
  } catch (error) {
    console.error("Error in addToCart.ts:", error);
    throw error;
  }
}
