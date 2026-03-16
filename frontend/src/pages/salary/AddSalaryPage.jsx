import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { APP_ROUTES } from "../../routes/routeConfig";
import { getEmployeeById, getEmployees } from "../../services/employeeApi";
import { createSalary } from "../../services/salaryApi";
import { validateSalaryForm } from "../../utils/validation";

const calculateNetSalary = ({ basicSalary, bonus, deductions }) =>
  Number(basicSalary || 0) + Number(bonus || 0) - Number(deductions || 0);

const AddSalaryPage = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employeeLoadError, setEmployeeLoadError] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loadingEmployeeDetails, setLoadingEmployeeDetails] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: "",
    basicSalary: "",
    bonus: "",
    deductions: "",
    netSalary: "",
    paymentDate: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);
        setEmployeeLoadError("");

        const response = await getEmployees();
        const payload = response?.data || [];

        if (!active) {
          return;
        }

        setEmployees(Array.isArray(payload) ? payload : []);
      } catch (_error) {
        if (!active) {
          return;
        }

        setEmployees([]);
        setEmployeeLoadError("Unable to load employees. Please refresh and try again.");
      } finally {
        if (active) {
          setLoadingEmployees(false);
        }
      }
    };

    loadEmployees();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadEmployeeDetails = async () => {
      if (!formData.employeeId) {
        if (!active) {
          return;
        }

        setSelectedEmployee(null);
        setFormData((prev) => ({
          ...prev,
          basicSalary: "",
          netSalary: "",
        }));
        return;
      }

      try {
        setLoadingEmployeeDetails(true);
        setFormError("");

        const response = await getEmployeeById(formData.employeeId);
        const employee = response?.data || null;

        if (!active) {
          return;
        }

        const resolvedSalary = employee?.salary;

        setSelectedEmployee(employee);
        setFormData((prev) => ({
          ...prev,
          basicSalary: resolvedSalary !== undefined && resolvedSalary !== null ? String(resolvedSalary) : "",
          netSalary: "",
        }));
      } catch (error) {
        if (!active) {
          return;
        }

        setSelectedEmployee(null);
        setFormData((prev) => ({
          ...prev,
          basicSalary: "",
          netSalary: "",
        }));
        setFormError(error?.message || "Unable to load employee details.");
      } finally {
        if (active) {
          setLoadingEmployeeDetails(false);
        }
      }
    };

    loadEmployeeDetails();

    return () => {
      active = false;
    };
  }, [formData.employeeId]);

  const employeeOptions = useMemo(
    () => employees
      .map((employee) => ({
        value: employee._id,
        label: `${employee.employeeId || ""} - ${employee.name || "Unnamed Employee"}`,
      }))
      .filter((option) => option.value),
    [employees]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFieldErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }

      const next = { ...prev };
      delete next[name];
      return next;
    });
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      netSalary: name === "bonus" || name === "deductions" || name === "employeeId"
        ? ""
        : prev.netSalary,
    }));

    if (name === "employeeId") {
      setFormError("");
    }

    if (name === "bonus" || name === "deductions") {
      setFormError("");
    }
  };

  const handleCalculate = () => {
    if (loadingEmployeeDetails) {
      setFormError("Employee details are still loading. Please wait.");
      return;
    }

    const basicSalary = Number(formData.basicSalary);
    const bonus = Number(formData.bonus || 0);
    const deductions = Number(formData.deductions || 0);

    if (!formData.employeeId) {
      setFieldErrors((prev) => ({ ...prev, employeeId: "Employee is required." }));
      return;
    }

    if (Number.isNaN(basicSalary) || basicSalary <= 0) {
      setFieldErrors((prev) => ({ ...prev, basicSalary: "Basic Salary will load from employee details." }));
      return;
    }

    if (Number.isNaN(bonus) || bonus < 0) {
      setFieldErrors((prev) => ({ ...prev, bonus: "Bonus cannot be negative." }));
      return;
    }

    if (Number.isNaN(deductions) || deductions < 0) {
      setFieldErrors((prev) => ({ ...prev, deductions: "Deductions cannot be negative." }));
      return;
    }

    const netSalary = calculateNetSalary({ basicSalary, bonus, deductions });

    if (netSalary < 0) {
      setFormError("Net Salary cannot be negative.");
      return;
    }

    setFormError("");
    setFormData((prev) => ({
      ...prev,
      netSalary: String(netSalary),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateSalaryForm(formData);

    if (loadingEmployeeDetails) {
      errors.employeeId = "Please wait until employee details finish loading.";
    }

    if (!formData.basicSalary) {
      errors.basicSalary = "Basic Salary is loaded automatically from the employee record.";
    }

    if (!formData.netSalary) {
      errors.netSalary = "Please calculate net salary before saving.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError("");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      await createSalary({
        employeeId: formData.employeeId,
        basicSalary: Number(formData.basicSalary),
        bonus: Number(formData.bonus || 0),
        deductions: Number(formData.deductions || 0),
        netSalary: Number(formData.netSalary || 0),
        paymentDate: formData.paymentDate,
      });

      navigate(APP_ROUTES.SALARY, { replace: true });
    } catch (error) {
      setFormError(error?.message || "Could not create salary record. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout pageTitle="Add Salary">
      <div className="mx-auto max-w-2xl space-y-5">
        <Button
          variant="outline"
          className="gap-2 text-slate-600"
          onClick={() => navigate(APP_ROUTES.SALARY)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Salary
        </Button>

        {employeeLoadError && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {employeeLoadError}
          </p>
        )}

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 px-5 pb-3 pt-5">
            <CardTitle className="text-base font-bold text-slate-800">New Salary Record</CardTitle>
          </CardHeader>

          <CardContent className="p-5">
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="employeeId" className="text-xs text-slate-500">
                    Employee ID
                  </Label>
                  <select
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    disabled={loadingEmployees || employeeOptions.length === 0}
                    className={`flex h-10 w-full rounded-lg bg-white px-3 py-2 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/30 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${
                      fieldErrors.employeeId ? "border border-red-400" : "border border-slate-200"
                    }`}
                  >
                    <option value="">
                      {loadingEmployees ? "Loading employees..." : "Select employee"}
                    </option>
                    {employeeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.employeeId && <p className="text-xs text-red-600">{fieldErrors.employeeId}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="basicSalary" className="text-xs text-slate-500">Basic Salary</Label>
                  <Input
                    id="basicSalary"
                    name="basicSalary"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.basicSalary}
                    readOnly
                    placeholder={loadingEmployeeDetails ? "Loading salary..." : "Basic Salary"}
                    className={fieldErrors.basicSalary ? "border-red-400" : "border-slate-200"}
                  />
                  {fieldErrors.basicSalary && <p className="text-xs text-red-600">{fieldErrors.basicSalary}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="bonus" className="text-xs text-slate-500">Bonus</Label>
                  <Input
                    id="bonus"
                    name="bonus"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.bonus}
                    onChange={handleChange}
                    placeholder="Bonus"
                    className={fieldErrors.bonus ? "border-red-400" : "border-slate-200"}
                  />
                  {fieldErrors.bonus && <p className="text-xs text-red-600">{fieldErrors.bonus}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="deductions" className="text-xs text-slate-500">Deductions</Label>
                  <Input
                    id="deductions"
                    name="deductions"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.deductions}
                    onChange={handleChange}
                    placeholder="Deductions"
                    className={fieldErrors.deductions ? "border-red-400" : "border-slate-200"}
                  />
                  {fieldErrors.deductions && <p className="text-xs text-red-600">{fieldErrors.deductions}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="paymentDate" className="text-xs text-slate-500">Payment Date</Label>
                  <Input
                    id="paymentDate"
                    name="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    className={fieldErrors.paymentDate ? "border-red-400" : "border-slate-200"}
                  />
                  {fieldErrors.paymentDate && <p className="text-xs text-red-600">{fieldErrors.paymentDate}</p>}
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="netSalary" className="text-xs text-slate-500">Net Salary</Label>
                  <Input
                    id="netSalary"
                    name="netSalary"
                    value={formData.netSalary}
                    readOnly
                    placeholder="Click Calculate Net Salary"
                    className={fieldErrors.netSalary ? "border-red-400" : "border-slate-200"}
                  />
                  {fieldErrors.netSalary && <p className="text-xs text-red-600">{fieldErrors.netSalary}</p>}
                </div>
              </div>

              {selectedEmployee && (
                <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Employee Name</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedEmployee.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Department</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedEmployee.department || "-"}</p>
                  </div>
                </div>
              )}

              {formError && (
                <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {formError}
                </p>
              )}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={handleCalculate}
                >
                  <Calculator className="h-4 w-4" />
                  Calculate Net Salary
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200/50 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save Salary"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AddSalaryPage;
