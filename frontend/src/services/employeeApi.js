import api, { buildApiError } from "./api";

const serializeEmployeePayload = (data = {}) => ({
  ...data,
  employeeId: typeof data.employeeId === "string" ? data.employeeId.trim() : data.employeeId,
  name: typeof data.name === "string" ? data.name.trim() : data.name,
  email: typeof data.email === "string" ? data.email.trim().toLowerCase() : data.email,
  phone: typeof data.phone === "string" ? data.phone.trim() : data.phone,
  department: typeof data.department === "string" ? data.department.trim() : data.department,
  designation: typeof data.designation === "string" ? data.designation.trim() : data.designation,
  basicSalary: data.basicSalary ?? data.salary,
  status: typeof data.status === "string" ? data.status.trim() : data.status,
});

export const getEmployees = async () => {
  try {
    const response = await api.get("/employees");
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const getEmployeeById = async (id) => {
  try {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const createEmployee = async (data) => {
  try {
    const response = await api.post("/employees", serializeEmployeePayload(data));
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      const conflictError = new Error("Employee already exists");
      conflictError.statusCode = 409;
      conflictError.code = "DUPLICATE_RESOURCE";
      throw conflictError;
    }

    throw buildApiError(error);
  }
};

export const updateEmployee = async (id, data) => {
  try {
    const response = await api.put(`/employees/${id}`, serializeEmployeePayload(data));
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const searchEmployees = async (query) => {
  try {
    const response = await api.get("/employees/search", {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};
