import { getIdToken } from "../auth/AuthStore";
import { API_BASE_URL } from "./config"; // Update the path if needed

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function addProduct(productData: any): Promise<any | null> {
  try {
    const idToken = await getIdToken();
    console.log("ID Token from addProduct:", idToken);

    if (!idToken) {
      console.error("No ID token available");
      return null;
    }

    const res = await fetch(`${API_BASE_URL}/product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
      },
      body: JSON.stringify(productData),
    });

    if (!res.ok) {
      console.error("Product add failed addProduct.ts:", res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error adding product addProduct.ts:", error);
    return null;
  }
}

