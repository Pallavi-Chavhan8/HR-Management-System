import api, { buildApiError, clearAuthToken, storeAuthToken } from "./api";

export const registerAdmin = async (data) => {
  try {
    const response = await api.post("/auth/register", data, { skipAuth: true });
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const loginAdmin = async (data) => {
  try {
    const response = await api.post("/auth/login", data, { skipAuth: true });

    const token = response.data?.data?.token;
    if (token) {
      storeAuthToken(token);
    }

    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const getAdminProfile = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const logoutAdmin = async () => {
  try {
    // Keep logout resilient even when backend logout endpoint is not implemented.
    const response = await api.post("/auth/logout");
    clearAuthToken();
    return response.data;
  } catch (error) {
    clearAuthToken();

    if (error.response?.status === 404 || error.response?.status === 405) {
      return { success: true, message: "Logged out" };
    }

    throw buildApiError(error);
  }
};
