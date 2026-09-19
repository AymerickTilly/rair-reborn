import { getIdToken } from "../auth/AuthStore";
import { API_BASE_URL } from "./config";

// Lists the image URLs in a Cloudinary folder (admin only). An error response has no list, so it yields [].
export async function loadFolderImages(folder: string): Promise<string[]> {
  const token = await getIdToken();
  const res = await fetch(`${API_BASE_URL}/images?folder=${encodeURIComponent(folder)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return Array.isArray(data) ? data : (data.urls ?? []);
}
