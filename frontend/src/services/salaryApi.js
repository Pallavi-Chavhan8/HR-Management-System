import api, { buildApiError } from "./api";

const serializeSalaryPayload = (data = {}) => ({
  employeeId: typeof data.employeeId === "string" ? data.employeeId.trim() : data.employeeId,
  basicSalary: data.basicSalary === "" || data.basicSalary === undefined ? undefined : Number(data.basicSalary),
  bonus: data.bonus === "" || data.bonus === undefined ? 0 : Number(data.bonus),
  deductions: data.deductions === "" || data.deductions === undefined ? 0 : Number(data.deductions),
  netSalary: data.netSalary === "" || data.netSalary === undefined ? undefined : Number(data.netSalary),
  paymentDate: data.paymentDate,
});

export const getSalaries = async () => {
  try {
    const response = await api.get("/salaries");
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const getSalaryById = async (id) => {
  try {
    const response = await api.get(`/salaries/${id}`);
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const createSalary = async (data) => {
  try {
    const payload = serializeSalaryPayload(data);
    const response = await api.post("/salaries", payload);
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const updateSalary = async (id, data) => {
  try {
    const payload = serializeSalaryPayload(data);
    const response = await api.put(`/salaries/${id}`, payload);
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};

export const deleteSalary = async (id) => {
  try {
    const response = await api.delete(`/salaries/${id}`);
    return response.data;
  } catch (error) {
    throw buildApiError(error);
  }
};
