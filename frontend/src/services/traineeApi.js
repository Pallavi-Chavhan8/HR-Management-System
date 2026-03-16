import api, { buildApiError } from "./api";

const serializeTraineePayload = (data = {}) => ({
  ...data,
  traineeId: typeof data.traineeId === "string" ? data.traineeId.trim() : data.traineeId,
  name: typeof data.name === "string" ? data.name.trim() : data.name,
  email: typeof data.email === "string" ? data.email.trim().toLowerCase() : data.email,
  phone: typeof data.phone === "string" ? data.phone.trim() : data.phone,
  department: typeof data.department === "string" ? data.department.trim() : data.department,
  course: typeof data.course === "string" ? data.course.trim() : data.course,
  internshipDuration: typeof data.internshipDuration === "string" ? data.internshipDuration.trim() : data.internshipDuration,
  endDate: data.endDate,
  status: typeof data.status === "string" ? data.status.trim().toUpperCase() : data.status,
});

export const getTrainees = async () => {
  try {
    const response = await api.get("/trainees");
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const getTraineeCount = async () => {
  try {
    const response = await api.get("/trainees/count");
    return response.data;
  } catch (error) {
    try {
      const fallbackResponse = await api.get("/trainees");
      const trainees = fallbackResponse?.data?.data || fallbackResponse?.data || [];

      return {
        success: true,
        totalTrainees: Array.isArray(trainees) ? trainees.length : 0,
      };
    } catch (fallbackError) {
      throw buildApiError(fallbackError);
    }
  }
};

export const getTraineeById = async (id) => {
  try {
    const response = await api.get(`/trainees/${id}`);
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const createTrainee = async (data) => {
  try {
    const response = await api.post("/trainees", serializeTraineePayload(data));
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      const conflictError = new Error("Trainee already exists");
      conflictError.statusCode = 409;
      conflictError.code = "DUPLICATE_RESOURCE";
      throw conflictError;
    }

    throw buildApiError(error);
  }
};

export const updateTrainee = async (id, data) => {
  try {
    const response = await api.put(`/trainees/${id}`, serializeTraineePayload(data));
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const deleteTrainee = async (id) => {
  try {
    const response = await api.delete(`/trainees/${id}`);
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};
