import axios from "axios";

const CURRENT_USER_STORAGE_KEY = "todo-auth-session";

export const normalizeUserName = (name = "") =>
  name.trim().replace(/\s+/g, " ");

export const applyAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete axios.defaults.headers.common.Authorization;
};

export const readCurrentSession = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    const session = rawSession ? JSON.parse(rawSession) : null;

    if (session?.token) {
      applyAuthToken(session.token);
    }

    return session;
  } catch (error) {
    console.error("Error reading current session:", error.message);
    return null;
  }
};

export const saveCurrentSession = (session) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(session));
};

export const clearCurrentSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
};
