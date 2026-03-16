import api, { buildApiError } from "./api";

export const getDashboardStats = async () => {
  try {
    const response = await api.get("/dashboard/stats");
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};
