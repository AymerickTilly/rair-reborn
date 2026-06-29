import { getIdToken } from "../auth/AuthStore";
import { API_BASE_URL } from "./config";

export async function loadUsers() {

    const idToken = await getIdToken();
    console.log("ID Token from addProduct:", idToken);

    if (!idToken) {
        console.error("No ID token available");
        return null;
    }

    const res = await fetch(`${API_BASE_URL}/users`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
      },
    });

    if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.status}`);
    }

    return res.json();
}