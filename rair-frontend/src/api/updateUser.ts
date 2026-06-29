import { getIdToken } from "../auth/AuthStore";
import { User } from "../types/User";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateUser(userData: User): Promise<any | null> {
  try {
    const idToken = await getIdToken();
    console.log("ID Token from updateUser:", idToken ? "Valid token" : "No token");

    if (!idToken) {
      console.error("No ID token available in updateUser");
      return null;
    }

    console.log("Sending PUT request with updateUser:", userData);
    const res = await fetch(
      "https://yv9hvyex77.execute-api.ap-southeast-2.amazonaws.com/dev/user",
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
    console.log("Update response:", data);
    return data;
  } catch (error) {
    console.error("Error updating product updateUser.ts:", error);
    return null;
  }
}