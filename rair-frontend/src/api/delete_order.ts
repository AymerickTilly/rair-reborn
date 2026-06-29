// /api/deleteProduct.ts
import { getIdToken } from "../auth/AuthStore"; // Adjust path if needed

export async function deleteOrder(orderId: string): Promise<boolean> {
  try {
    const idToken = await getIdToken();
    if (!idToken) {
      console.error("No ID token available for deleting order");
      return false;
    }

    const encodedId = encodeURIComponent(orderId);
    const res = await fetch(
      `https://yv9hvyex77.execute-api.ap-southeast-2.amazonaws.com/dev/order?orderId=${encodedId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    if (!res.ok) {
      console.error("Order deletion failed:", res.status, res.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting order:", error);
    return false;
  }
}
