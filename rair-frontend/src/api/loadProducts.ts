import { getIdToken } from "../auth/AuthStore";
import { API_BASE_URL } from "./config";

export async function loadProducts() {

    const idToken = await getIdToken();

    if (!idToken) {
        console.error("No ID token available");
        return null;
    }

    const res = await fetch(`${API_BASE_URL}/products`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
      },
    });

    if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
    }

    return res.json();
}