import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { APP_ROUTES } from "../../routes/routeConfig";
import { getDepartments } from "../../services/departmentApi";
import { createTrainee } from "../../services/traineeApi";
import { validateTraineeForm } from "../../utils/validation";

const durationOptions = [
  "1 month",
  "2 months",
  "3 months",
  "6 months",
  "12 months",
];

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const calculateEndDate = (startDate, internshipDuration) => {
  const normalizedStartDate = String(startDate || "").trim();
  const normalizedDuration = String(internshipDuration || "").trim().toLowerCase();
  if (!normalizedStartDate || !normalizedDuration) {
    return "";
  }

  const durationMatch = normalizedDuration.match(/^(\d{1,2})\s*(month|months)$/i);
  if (!durationMatch) {
    return "";
  }

  const monthsToAdd = Number(durationMatch[1]);
  if (!monthsToAdd) {
    return "";
  }

  const parsedStartDate = new Date(normalizedStartDate);
  if (Number.isNaN(parsedStartDate.getTime())) {
    return "";
  }

  const result = new Date(parsedStartDate);
  result.setMonth(result.getMonth() + monthsToAdd);
  return result.toISOString().slice(0, 10);
};

const AddTraineePage = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [departmentLoadError, setDepartmentLoadError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    department: "",
    course: "",
    internshipDuration: "",
    startDate: "",
    endDate: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const isDepartmentDisabled = loadingDepartments || departmentOptions.length === 0;

  useEffect(() => {
    setForm((prev) => {
      const nextEndDate = calculateEndDate(prev.startDate, prev.internshipDuration);
      return nextEndDate === prev.endDate ? prev : { ...prev, endDate: nextEndDate };
    });
  }, [form.startDate, form.internshipDuration]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name] && !(name === "startDate" && prev.endDate) && !(name === "internshipDuration" && prev.endDate)) {
        return prev;
      }

      const next = { ...prev };
      delete next[name];
      if (name === "startDate" || name === "internshipDuration") {
        delete next.endDate;
      }
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateTraineeForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      await createTrainee(form);
      navigate(APP_ROUTES.TRAINEES, { replace: true });
    } catch {
      setError("Could not create trainee. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout pageTitle="Add Trainee">
      <div className="mx-auto max-w-2xl space-y-5">
        <Button
          variant="outline"
          className="gap-2 text-slate-600"
          onClick={() => navigate(APP_ROUTES.TRAINEES)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trainees
        </Button>

        {departmentLoadError && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {departmentLoadError}
          </p>
        )}

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 px-6 py-5">
            <CardTitle className="text-lg font-semibold text-slate-800">New Trainee</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className={selectClass}
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
                  <Label htmlFor="course">Course</Label>
                  <Input id="course" name="course" value={form.course} onChange={handleChange} placeholder="Course name" />
                  {fieldErrors.course && <p className="text-xs text-red-600">{fieldErrors.course}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internshipDuration">Internship Duration</Label>
                  <select
                    id="internshipDuration"
                    name="internshipDuration"
                    value={form.internshipDuration}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="">Select internship duration</option>
                    {durationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.internshipDuration && <p className="text-xs text-red-600">{fieldErrors.internshipDuration}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
                  {fieldErrors.startDate && <p className="text-xs text-red-600">{fieldErrors.startDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" name="endDate" type="date" value={form.endDate} readOnly disabled />
                  {fieldErrors.endDate && <p className="text-xs text-red-600">{fieldErrors.endDate}</p>}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Trainee"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AddTraineePage;
