import { getIdToken } from "../auth/AuthStore";
import { API_BASE_URL } from "./config"; // Update the path if needed

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function addUser(userData: any): Promise<any | null> {
  try {
    const idToken = await getIdToken();
    console.log("ID Token from addUser:", idToken);

    if (!idToken) {
      console.error("No ID token available");
      return null;
    }

    const res = await fetch(`${API_BASE_URL}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
      },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      console.error("User add failed addUser.ts:", res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error adding user addUser.ts:", error);
    return null;
  }
}

