import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { APP_ROUTES } from "../../routes/routeConfig";
import { getEmployeeById, updateEmployee } from "../../services/employeeApi";
import { getDepartments } from "../../services/departmentApi";
import { validateEmployeeForm } from "../../utils/validation";

const normalizeEmployeeStatus = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "active") {
    return "Active";
  }

  if (normalized === "inactive") {
    return "Inactive";
  }

  if (normalized === "on leave" || normalized === "on_leave" || normalized === "leave") {
    return "On Leave";
  }

  return "Active";
};

const EmployeeEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [departmentLoadError, setDepartmentLoadError] = useState("");
  const [loadingEmployee, setLoadingEmployee] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    department: "",
    designation: "",
    salary: "",
    joiningDate: "",
    status: "Active",
  });

  useEffect(() => {
    let active = true;

    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);
        setDepartmentLoadError("");

        const response = await getDepartments();
        const payload = response?.data?.departments || response?.data || [];

        if (!active) return;
        setDepartments(Array.isArray(payload) ? payload : []);
      } catch {
        if (!active) return;
        setDepartments([]);
        setDepartmentLoadError("Unable to load departments. Please refresh and try again.");
      } finally {
        if (active) setLoadingDepartments(false);
      }
    };

    loadDepartments();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!id) {
      setLoadingEmployee(false);
      setError("Invalid employee ID.");
      return;
    }

    getEmployeeById(id)
      .then((res) => {
        const employee = res.data?.employee || res.data || null;
        if (!employee) {
          setError("Employee not found.");
          return;
        }

        setForm({
          name: employee.name || "",
          email: employee.email || "",
          phone: employee.phone || "",
          dateOfBirth: employee.dateOfBirth
            ? new Date(employee.dateOfBirth).toISOString().slice(0, 10)
            : "",
          department: employee.department || "",
          designation: employee.designation || "",
          salary: employee.salary ?? "",
          joiningDate: employee.joiningDate
            ? new Date(employee.joiningDate).toISOString().slice(0, 10)
            : "",
          status: normalizeEmployeeStatus(employee.status),
        });
      })
      .catch(() => setError("Could not load employee details."))
      .finally(() => setLoadingEmployee(false));
  }, [id]);

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }

      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const isDepartmentDisabled = loadingDepartments || departmentOptions.length === 0;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!id) {
      setError("Invalid employee ID.");
      return;
    }

    const validationErrors = validateEmployeeForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      await updateEmployee(id, {
        ...form,
        salary: Number(form.salary || 0),
      });
      navigate(APP_ROUTES.EMPLOYEES, { replace: true });
    } catch {
      setError("Could not update employee. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout pageTitle="Edit Employee">
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

        {loadingEmployee ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">Edit Employee</h2>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
                {fieldErrors.name && <p className="text-xs text-red-600">{fieldErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" />
                {fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" />
                {fieldErrors.phone && <p className="text-xs text-red-600">{fieldErrors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
                {fieldErrors.dateOfBirth && <p className="text-xs text-red-600">{fieldErrors.dateOfBirth}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  disabled={isDepartmentDisabled}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">{loadingDepartments ? "Loading departments..." : "Select department"}</option>
                  {departmentOptions.map((option) => (
                    <option key={option._id} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.department && <p className="text-xs text-red-600">{fieldErrors.department}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" name="designation" value={form.designation} onChange={handleChange} placeholder="Designation / Role" />
                {fieldErrors.designation && <p className="text-xs text-red-600">{fieldErrors.designation}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salary (INR)</Label>
                <Input id="salary" name="salary" type="number" value={form.salary} onChange={handleChange} placeholder="Salary" />
                {fieldErrors.salary && <p className="text-xs text-red-600">{fieldErrors.salary}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="joiningDate">Joining Date</Label>
                <Input id="joiningDate" name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} />
                {fieldErrors.joiningDate && <p className="text-xs text-red-600">{fieldErrors.joiningDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
                {fieldErrors.status && <p className="text-xs text-red-600">{fieldErrors.status}</p>}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Employee"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default EmployeeEditPage;
