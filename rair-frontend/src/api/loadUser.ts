import { getIdToken } from "../auth/AuthStore";
import { API_BASE_URL } from "./config";

export async function loadUserById(userId: string) {
  const idToken = await getIdToken();
  console.log("ID Token:", idToken);

  if (!idToken) {
    console.error("No ID token available");
    return null;
  }

  const url = `${API_BASE_URL}/user?userId=${encodeURIComponent(userId)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch product ${userId}: ${res.status}`);
  }

  return res.json();
}