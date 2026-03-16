import { useEffect, useState } from "react";
import { ArrowLeft, Calculator } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { APP_ROUTES } from "../../routes/routeConfig";
import { getSalaryById, updateSalary } from "../../services/salaryApi";

const calculateNetSalary = ({ basicSalary, bonus, deductions }) =>
  Number(basicSalary || 0) + Number(bonus || 0) - Number(deductions || 0);

const EditSalaryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    employeeId: "",
    employeeCode: "",
    employeeName: "",
    basicSalary: "",
    bonus: "",
    deductions: "",
    netSalary: "",
    paymentDate: "",
  });

  useEffect(() => {
    if (!id) {
      setError("Invalid salary record ID.");
      setLoading(false);
      return;
    }

    const loadSalary = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getSalaryById(id);
        const salary = response?.data || null;

        if (!salary) {
          setError("Salary record not found.");
          return;
        }

        setFormData({
          employeeId: salary.employeeId || salary.employee?._id || "",
          employeeCode: salary.employee?.employeeId || "",
          employeeName: salary.employee?.name || "",
          basicSalary: String(salary.basicSalary ?? ""),
          bonus: String(salary.bonus ?? 0),
          deductions: String(salary.deductions ?? 0),
          netSalary: String(salary.netSalary ?? ""),
          paymentDate: salary.paymentDate
            ? new Date(salary.paymentDate).toISOString().slice(0, 10)
            : "",
        });
      } catch (loadError) {
        setError(loadError?.message || "Could not load salary record.");
      } finally {
        setLoading(false);
      }
    };

    loadSalary();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      netSalary: name === "bonus" || name === "deductions" ? "" : prev.netSalary,
    }));

    setFieldErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }

      const next = { ...prev };
      delete next[name];
      return next;
    });

    setError("");
  };

  const handleCalculate = () => {
    const basicSalary = Number(formData.basicSalary || 0);
    const bonus = Number(formData.bonus || 0);
    const deductions = Number(formData.deductions || 0);

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
      setError("Net Salary cannot be negative.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      netSalary: String(netSalary),
    }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = {};

    if (formData.bonus === "" || Number(formData.bonus) < 0) {
      errors.bonus = "Bonus cannot be negative.";
    }

    if (formData.deductions === "" || Number(formData.deductions) < 0) {
      errors.deductions = "Deductions cannot be negative.";
    }

    if (!formData.paymentDate) {
      errors.paymentDate = "Payment date is required.";
    }

    if (!formData.netSalary) {
      errors.netSalary = "Please calculate net salary before updating.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateSalary(id, {
        employeeId: formData.employeeId,
        bonus: Number(formData.bonus || 0),
        deductions: Number(formData.deductions || 0),
        paymentDate: formData.paymentDate,
      });

      navigate(APP_ROUTES.SALARY, { replace: true });
    } catch (updateError) {
      setError(updateError?.message || "Could not update salary record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout pageTitle="Edit Salary">
      <div className="mx-auto max-w-2xl space-y-5">
        <Button
          variant="outline"
          className="gap-2 text-slate-600"
          onClick={() => navigate(APP_ROUTES.SALARY)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Salary
        </Button>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 px-5 pb-3 pt-5">
            <CardTitle className="text-base font-bold text-slate-800">Edit Salary Record</CardTitle>
          </CardHeader>

          <CardContent className="p-5">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="employee" className="text-xs text-slate-500">Employee</Label>
                    <Input
                      id="employee"
                      value={`${formData.employeeCode} - ${formData.employeeName}`.trim()}
                      readOnly
                      className="border-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="basicSalary" className="text-xs text-slate-500">Basic Salary</Label>
                    <Input
                      id="basicSalary"
                      name="basicSalary"
                      type="number"
                      value={formData.basicSalary}
                      readOnly
                      className="border-slate-200"
                    />
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
                      className={fieldErrors.netSalary ? "border-red-400" : "border-slate-200"}
                    />
                    {fieldErrors.netSalary && <p className="text-xs text-red-600">{fieldErrors.netSalary}</p>}
                  </div>
                </div>

                {error && (
                  <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {error}
                  </p>
                )}

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button type="button" variant="outline" className="gap-2" onClick={handleCalculate}>
                    <Calculator className="h-4 w-4" />
                    Calculate Net Salary
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200/50 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60"
                  >
                    {saving ? "Updating..." : "Update Salary"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EditSalaryPage;
