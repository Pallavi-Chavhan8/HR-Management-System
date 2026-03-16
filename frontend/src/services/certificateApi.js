import api, { buildApiError } from "./api";

export const lookupCertificateById = async (id) => {
  try {
    const response = await api.get(`/certificates/lookup/${encodeURIComponent(String(id).trim())}`);
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};
