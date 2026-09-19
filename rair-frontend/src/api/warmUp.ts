import { API_BASE_URL } from "./config";

// The free-tier API host sleeps after a while without traffic, and the first request then takes many
// seconds. Pinging the unauthenticated /health endpoint as soon as the app loads wakes it while the user
// is still on the login page or heading to the shop. The response isn't needed, so no-cors is enough.
export function warmUpApi() {
  fetch(`${API_BASE_URL}/health`, { mode: "no-cors" }).catch(() => {});
}
