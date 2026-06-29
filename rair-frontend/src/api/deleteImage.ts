// /api/deleteImage.ts
import { getIdToken } from "../auth/AuthStore";
import { API_BASE_URL } from "./config"; // Adjust path if needed

export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    const idToken = await getIdToken();
    console.log("ID Token from deleteImage:", idToken);

    if (!idToken) {
      console.error("No ID token available");
      return false;
    }

    const encodedUrl = encodeURIComponent(imageUrl);
    const res = await fetch(
      `${API_BASE_URL}/image?imageUrl=${encodedUrl}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    if (!res.ok) {
      console.error("Image deletion failed deleteImage.ts:", res.status, res.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting image deleteImage.ts:", error);
    return false;
  }
}