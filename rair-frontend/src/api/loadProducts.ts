import { getIdToken } from "../auth/AuthStore";

export async function loadProducts() {

    const idToken = await getIdToken();
    console.log("ID Token from addProduct:", idToken);

    if (!idToken) {
        console.error("No ID token available");
        return null;
    }

    const res = await fetch("https://yv9hvyex77.execute-api.ap-southeast-2.amazonaws.com/dev/products", {
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