const rawApiUrl = process.env.REACT_APP_API_URL?.trim();

const isPlaceholderApiUrl =
  !rawApiUrl || rawApiUrl.includes("YOUR_BACKEND_VERCEL_URL");

const isBrowserLocalhost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const isLocalApiUrl =
  !!rawApiUrl &&
  /(localhost|127\.0\.0\.1)/i.test(rawApiUrl);

const TODOS_API_BASE_URL =
  isPlaceholderApiUrl || (isLocalApiUrl && !isBrowserLocalhost)
    ? "/api/todos"
    : rawApiUrl;

const API_ROOT = TODOS_API_BASE_URL.replace(/\/todos\/?$/, "");
const AUTH_API_BASE_URL = `${API_ROOT}/auth`;

export { API_ROOT, AUTH_API_BASE_URL };
export default TODOS_API_BASE_URL;
