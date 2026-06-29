import { getIdToken } from "../auth/AuthStore";
import { API_BASE_URL } from "./config";

export async function loadOrderById(orderId: string) {
  const idToken = await getIdToken();
  console.log("ID Token:", idToken);

  if (!idToken) {
    console.error("No ID token available");
    return null;
  }

  const url = `${API_BASE_URL}/order?orderId=${encodeURIComponent(orderId)}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch order ${orderId}: ${res.status}`);
  }

  return res.json();
}