import api, { buildApiError } from "./api";

const serializeInternPayload = (data = {}) => ({
  ...data,
  internId: typeof data.internId === "string" ? data.internId.trim() : data.internId,
  name: typeof data.name === "string" ? data.name.trim() : data.name,
  email: typeof data.email === "string" ? data.email.trim().toLowerCase() : data.email,
  phone: typeof data.phone === "string" ? data.phone.trim() : data.phone,
  department: typeof data.department === "string" ? data.department.trim() : data.department,
  course: typeof data.course === "string" ? data.course.trim() : data.course,
  internshipDuration: typeof data.internshipDuration === "string" ? data.internshipDuration.trim() : data.internshipDuration,
  endDate: data.endDate,
  status: typeof data.status === "string" ? data.status.trim().toUpperCase() : data.status,
});

export const getInterns = async () => {
  try {
    const response = await api.get("/interns");
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const getInternById = async (id) => {
  try {
    const response = await api.get(`/interns/${id}`);
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const createIntern = async (data) => {
  try {
    const response = await api.post("/interns", serializeInternPayload(data));
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      const conflictError = new Error("Intern already exists");
      conflictError.statusCode = 409;
      conflictError.code = "DUPLICATE_RESOURCE";
      throw conflictError;
    }

    throw buildApiError(error);
  }
};

export const updateIntern = async (id, data) => {
  try {
    const response = await api.put(`/interns/${id}`, serializeInternPayload(data));
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const deleteIntern = async (id) => {
  try {
    const response = await api.delete(`/interns/${id}`);
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};
