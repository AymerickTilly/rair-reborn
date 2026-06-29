import { getIdToken } from "../auth/AuthStore";

export async function loadUserById(userId: string) {
  const idToken = await getIdToken();
  console.log("ID Token:", idToken);

  if (!idToken) {
    console.error("No ID token available");
    return null;
  }

  const url = `https://yv9hvyex77.execute-api.ap-southeast-2.amazonaws.com/dev/user?userId=${encodeURIComponent(userId)}`;

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