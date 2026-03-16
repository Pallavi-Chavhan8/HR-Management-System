import api, { buildApiError } from "./api";

const serializeDepartmentPayload = (data = {}) => ({
  departmentName: typeof data.departmentName === "string" ? data.departmentName.trim() : "",
  description: typeof data.description === "string" ? data.description.trim() : "",
});

export const getDepartments = async () => {
  try {
    const response = await api.get("/departments");
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const getDepartmentById = async (id) => {
  try {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const createDepartment = async (data) => {
  try {
    const payload = serializeDepartmentPayload(data);

    if (!payload.departmentName) {
      const validationError = new Error("Department name is required");
      validationError.statusCode = 400;
      validationError.code = "VALIDATION_ERROR";
      throw validationError;
    }

    const response = await api.post("/departments", payload);
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      const message = "Department already exists";
      const conflictError = new Error(message);
      conflictError.statusCode = 409;
      conflictError.code = "DUPLICATE_RESOURCE";
      throw conflictError;
    }

    throw buildApiError(error);
  }
};

export const updateDepartment = async (id, data) => {
  try {
    const response = await api.put(`/departments/${id}`, serializeDepartmentPayload(data));
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const deleteDepartment = async (id) => {
  try {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};
