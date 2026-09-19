import { getIdToken } from "../auth/AuthStore";
import { API_BASE_URL } from "./config";
import { User } from "../types/User";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateUser(userData: User): Promise<any | null> {
  try {
    const idToken = await getIdToken();

    if (!idToken) {
      console.error("No ID token available in updateUser");
      return null;
    }

    const res = await fetch(
      `${API_BASE_URL}/user`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(userData),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Product update failed in updateUser.ts:", {
        status: res.status,
        statusText: res.statusText,
        responseText: errorText,
      });
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error updating product updateUser.ts:", error);
    return null;
  }
}