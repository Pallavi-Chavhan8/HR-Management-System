import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import EntityForm from "../../components/forms/EntityForm";
import { Button } from "../../components/ui/button";
import { APP_ROUTES } from "../../routes/routeConfig";
import { createEmployee } from "../../services/employeeApi";
import { getDepartments } from "../../services/departmentApi";
import { validateEmployeeForm } from "../../utils/validation";

const AddEmployeePage = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [departmentLoadError, setDepartmentLoadError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);
        setDepartmentLoadError("");

        const response = await getDepartments();
        const payload = response?.data?.departments || response?.data || [];

        if (!active) {
          return;
        }

        setDepartments(Array.isArray(payload) ? payload : []);
      } catch (_error) {
        if (!active) {
          return;
        }

        setDepartments([]);
        setDepartmentLoadError("Unable to load departments. Please refresh and try again.");
      } finally {
        if (active) {
          setLoadingDepartments(false);
        }
      }
    };

    loadDepartments();

    return () => {
      active = false;
    };
  }, []);

  const departmentOptions = useMemo(
    () => departments
      .map((department) => ({
        _id: department._id,
        value: department.departmentName || department.name || "",
        label: department.departmentName || department.name || "Unnamed Department",
      }))
      .filter((option) => option._id && option.value),
    [departments]
  );

  const employeeFields = useMemo(
    () => [
      { name: "name",        placeholder: "Full name" },
      { name: "email",       placeholder: "Email address",               type: "email" },
      { name: "phone",       placeholder: "Phone number" },
      { name: "dateOfBirth", placeholder: "Date of Birth",              type: "date" },
      {
        name: "department",
        placeholder: "Department",
        type: "select",
        options: departmentOptions,
        selectPlaceholder: loadingDepartments ? "Loading departments..." : "Select department",
        disabled: loadingDepartments || departmentOptions.length === 0,
      },
      { name: "designation", placeholder: "Designation / Role" },
      { name: "salary",      placeholder: "Salary (INR)",                type: "number" },
      { name: "joiningDate", placeholder: "Joining date",                type: "date" },
      {
        name: "status",
        placeholder: "Status",
        type: "select",
        options: [
          { _id: "active", value: "Active", label: "Active" },
          { _id: "inactive", value: "Inactive", label: "Inactive" },
          { _id: "on-leave", value: "On Leave", label: "On Leave" },
        ],
        fullWidth: true,
      },
    ],
    [departmentOptions, loadingDepartments]
  );

  const validateEmployeeData = useCallback((formData) => validateEmployeeForm(formData), []);

  const handleSubmit = async (formData) => {
    await createEmployee({
      ...formData,
      salary: formData.salary ? Number(formData.salary) : undefined,
    });
  };

  return (
    <AdminLayout pageTitle="Add Employee">
      <div className="mx-auto max-w-2xl space-y-5">
        <Button
          variant="outline"
          className="gap-2 text-slate-600"
          onClick={() => navigate(APP_ROUTES.EMPLOYEES)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employees
        </Button>

        {departmentLoadError && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {departmentLoadError}
          </p>
        )}

        <EntityForm
          title="New Employee"
          fields={employeeFields}
          submitLabel="Create Employee"
          validate={validateEmployeeData}
          onSubmit={handleSubmit}
          onSuccess={() => navigate(APP_ROUTES.EMPLOYEES)}
        />
      </div>
    </AdminLayout>
  );
};

export default AddEmployeePage;
