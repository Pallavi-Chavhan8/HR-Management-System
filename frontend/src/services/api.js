import axios from "axios";

export const TOKEN_STORAGE_KEY = "token";

const resolveBaseUrl = () => {
  const viteUrl = typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_URL : undefined;
  const craUrl = typeof process !== "undefined" ? process.env?.REACT_APP_API_URL : undefined;

  return viteUrl || craUrl || "http://localhost:5000/api/v1";
};

export const getStoredToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const storeAuthToken = (token) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const clearAuthToken = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
};

const redirectToLogin = () => {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== "/login") {
    window.history.replaceState({}, "", "/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (!config.headers) {
      config.headers = {};
    }

    if (token && !config.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }

      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

export const buildApiError = (error) => {
  const statusCode = error.response?.status || 500;
  const backendMessage = error.response?.data?.message;
  const message = statusCode === 409
    ? (backendMessage || "A record with the same unique details already exists.")
    : (backendMessage || error.message || "Unexpected API error");

  const apiError = new Error(message);
  apiError.statusCode = statusCode;
  apiError.details = error.response?.data?.details || null;
  apiError.code = statusCode === 401
    ? "AUTH_UNAUTHORIZED"
    : statusCode === 409
      ? "DUPLICATE_RESOURCE"
      : "API_ERROR";

  return apiError;
};

export default api;
