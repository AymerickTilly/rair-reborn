import { getIdToken } from "../auth/AuthStore"; // Update the path if needed

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function addProduct(productData: any): Promise<any | null> {
  try {
    const idToken = await getIdToken();
    console.log("ID Token from addProduct:", idToken);

    if (!idToken) {
      console.error("No ID token available");
      return null;
    }

    const res = await fetch("https://yv9hvyex77.execute-api.ap-southeast-2.amazonaws.com/dev/product", {
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

