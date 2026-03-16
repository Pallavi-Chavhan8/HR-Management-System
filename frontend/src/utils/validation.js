const isBlank = (value) => String(value ?? "").trim() === "";

const isFutureDate = (value) => {
  if (isBlank(value)) {
    return false;
  }

  const selectedDate = new Date(value);
  if (Number.isNaN(selectedDate.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selectedDate > today;
};

const getAgeFromDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const monthDiff = today.getMonth() - parsed.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsed.getDate())) {
    age -= 1;
  }

  return age;
};

export const validateName = (value, label = "Name") => {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return `${label} is required.`;
  }

  if (normalized.length < 3) {
    return `${label} must be at least 3 characters.`;
  }

  return "";
};

export const validateEmail = (value) => {
  const normalized = String(value ?? "").trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!normalized) {
    return "Email is required.";
  }

  if (!emailRegex.test(normalized)) {
    return "Enter a valid email address.";
  }

  return "";
};

export const validatePhone = (value) => {
  const normalized = String(value ?? "").trim();
  const phoneRegex = /^\d{10}$/;

  if (!normalized) {
    return "Phone number is required.";
  }

  if (!phoneRegex.test(normalized)) {
    return "Phone number must be exactly 10 digits.";
  }

  return "";
};

export const validateRequiredSelection = (value, label = "Field") => {
  if (isBlank(value)) {
    return `${label} is required.`;
  }

  return "";
};

export const validatePositiveNumber = (value, label = "Value") => {
  if (isBlank(value)) {
    return `${label} is required.`;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return `${label} must be a positive number.`;
  }

  return "";
};

export const validateNonNegativeNumber = (value, label = "Value") => {
  if (isBlank(value)) {
    return "";
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return `${label} cannot be negative.`;
  }

  return "";
};

export const validateDateNotFuture = (value, label = "Date") => {
  if (isBlank(value)) {
    return `${label} is required.`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return `Enter a valid ${label.toLowerCase()}.`;
  }

  if (isFutureDate(value)) {
    return `${label} cannot be in the future.`;
  }

  return "";
};

export const validateDateOfBirth = (value, { label = "Date of Birth", minimumAge } = {}) => {
  const dateError = validateDateNotFuture(value, label);
  if (dateError) {
    return dateError;
  }

  if (minimumAge === undefined) {
    return "";
  }

  const age = getAgeFromDate(value);
  if (age === null) {
    return `Enter a valid ${label.toLowerCase()}.`;
  }

  if (age < minimumAge) {
    return `${label} requires age to be at least ${minimumAge} years.`;
  }

  return "";
};

export const validateDepartmentName = (formData) => {
  const errors = {};
  const departmentNameError = validateName(formData.departmentName, "Department name");

  if (departmentNameError) {
    errors.departmentName = departmentNameError;
  }

  return errors;
};

export const validateEmployeeForm = (formData) => {
  const errors = {};

  const nameError = validateName(formData.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(formData.phone);
  if (phoneError) errors.phone = phoneError;

  const dateOfBirthError = validateDateOfBirth(formData.dateOfBirth, { minimumAge: 18 });
  if (dateOfBirthError) errors.dateOfBirth = dateOfBirthError;

  const departmentError = validateRequiredSelection(formData.department, "Department");
  if (departmentError) errors.department = departmentError;

  if (isBlank(formData.designation)) {
    errors.designation = "Designation is required.";
  }

  const salaryError = validatePositiveNumber(formData.salary, "Salary");
  if (salaryError) errors.salary = salaryError;

  const joiningDateError = validateDateNotFuture(formData.joiningDate, "Joining date");
  if (joiningDateError) errors.joiningDate = joiningDateError;

  const statusError = validateRequiredSelection(formData.status, "Status");
  if (statusError) errors.status = statusError;

  return errors;
};

export const validateInternForm = (formData) => {
  const errors = {};

  const nameError = validateName(formData.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(formData.phone);
  if (phoneError) errors.phone = phoneError;

  const dateOfBirthError = validateDateOfBirth(formData.dateOfBirth);
  if (dateOfBirthError) errors.dateOfBirth = dateOfBirthError;

  const departmentError = validateRequiredSelection(formData.department, "Department");
  if (departmentError) errors.department = departmentError;

  if (isBlank(formData.course)) {
    errors.course = "Course is required.";
  }

  if (isBlank(formData.internshipDuration)) {
    errors.internshipDuration = "Internship duration is required.";
  }

  const startDateError = validateDateNotFuture(formData.startDate, "Start date");
  if (startDateError) errors.startDate = startDateError;

  const endDateError = validateRequiredSelection(formData.endDate, "End date");
  if (endDateError) errors.endDate = endDateError;

  return errors;
};

export const validateSalaryForm = (formData) => {
  const errors = {};

  const employeeIdError = validateRequiredSelection(formData.employeeId, "Employee");
  if (employeeIdError) errors.employeeId = employeeIdError;

  const basicSalaryError = validatePositiveNumber(formData.basicSalary, "Basic Salary");
  if (basicSalaryError) errors.basicSalary = basicSalaryError;

  const bonusError = validateNonNegativeNumber(formData.bonus, "Bonus");
  if (bonusError) errors.bonus = bonusError;

  const deductionsError = validateNonNegativeNumber(formData.deductions, "Deductions");
  if (deductionsError) errors.deductions = deductionsError;

  const paymentDateError = validateDateNotFuture(formData.paymentDate, "Payment date");
  if (paymentDateError) errors.paymentDate = paymentDateError;

  return errors;
};

export const validateTraineeForm = (formData) => {
  const errors = {};

  const nameError = validateName(formData.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(formData.phone);
  if (phoneError) errors.phone = phoneError;

  const dateOfBirthError = validateDateOfBirth(formData.dateOfBirth, { minimumAge: 18 });
  if (dateOfBirthError) errors.dateOfBirth = dateOfBirthError;

  const departmentError = validateRequiredSelection(formData.department, "Department");
  if (departmentError) errors.department = departmentError;

  if (isBlank(formData.course)) {
    errors.course = "Course is required.";
  }

  if (isBlank(formData.internshipDuration)) {
    errors.internshipDuration = "Internship duration is required.";
  }

  const startDateError = validateDateNotFuture(formData.startDate, "Start date");
  if (startDateError) errors.startDate = startDateError;

  const endDateError = validateRequiredSelection(formData.endDate, "End date");
  if (endDateError) errors.endDate = endDateError;

  return errors;
};

export const validatePassword = (value) => {
  const normalized = String(value ?? "");

  if (!normalized.trim()) {
    return "Password is required.";
  }

  if (normalized.length < 6) {
    return "Password must be at least 6 characters.";
  }

  return "";
};

export const validateConfirmPassword = (password, confirmPassword) => {
  const normalizedConfirmPassword = String(confirmPassword ?? "");

  if (!normalizedConfirmPassword.trim()) {
    return "Confirm password is required.";
  }

  if (String(password ?? "") !== normalizedConfirmPassword) {
    return "Passwords do not match.";
  }

  return "";
};

export const validateRegisterForm = (formData) => {
  const errors = {};

  const nameError = validateName(formData.name, "Full name");
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;

  const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  return errors;
};
