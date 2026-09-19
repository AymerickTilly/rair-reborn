import { getIdToken } from "../auth/AuthStore";
import { API_BASE_URL } from "./config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateProduct(productData: any): Promise<any | null> {
  try {
    const idToken = await getIdToken();

    if (!idToken) {
      console.error("No ID token available in updateAnItem");
      return null;
    }

    const res = await fetch(
      `${API_BASE_URL}/product`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(productData),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Product update failed in updateAnItem.ts:", {
        status: res.status,
        statusText: res.statusText,
        responseText: errorText,
      });
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error updating product updateAnItem.ts:", error);
    return null;
  }
}