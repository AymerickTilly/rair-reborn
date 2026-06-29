// /api/deleteProduct.ts
import { getIdToken } from "../auth/AuthStore"; // Adjust path if needed
import { Cart } from "../types/Cart";

export async function deleteCart(cart: Cart): Promise<boolean> {
  try {
    const idToken = await getIdToken();
    if (!idToken) {
      console.error("No ID token available for deleting Cart");
      return false;
    }

    const encodedUserId = encodeURIComponent(cart.userId);
    const encodedCartId = encodeURIComponent(cart.cartId);

    const res = await fetch(
      `https://yv9hvyex77.execute-api.ap-southeast-2.amazonaws.com/dev/cart?userId=${encodedUserId}&cartId=${encodedCartId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    if (!res.ok) {
      console.error("Cart deletion failed:", res.status, res.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting Cart:", error);
    return false;
  }
}
