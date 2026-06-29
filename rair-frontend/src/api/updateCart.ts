import { getIdToken } from "../auth/AuthStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateCart(cartData: any): Promise<any | null> {
  try {
    const idToken = await getIdToken();
    console.log("ID Token from updateCart:", idToken ? "Valid token" : "No token");

    if (!idToken) {
      console.error("No ID token available in updateCart");
      return null;
    }

    console.log("Sending PUT request with cartData:", cartData);
    const res = await fetch(
      "https://yv9hvyex77.execute-api.ap-southeast-2.amazonaws.com/dev/cart",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(cartData),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Product update failed in updateCart.ts:", {
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
    console.error("Error updating product updateCart.ts:", error);
    return null;
  }
}