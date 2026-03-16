import { useEffect, useState } from "react";
import { ArrowLeft, User, Mail, Phone, Briefcase, Building2, DollarSign, Calendar, Activity, Pencil, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { APP_ROUTES } from "../../routes/routeConfig";
import { deleteEmployee, getEmployeeById } from "../../services/employeeApi";
import { formatINR } from "../../utils/currency";

const statusVariant = (s = "") => {
  const v = String(s).toLowerCase();
  if (v === "active") return "success";
  if (v === "on leave" || v === "leave") return "warning";
  if (v === "inactive" || v === "terminated") return "destructive";
  return "secondary";
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{value || "—"}</p>
    </div>
  </div>
);

const EmployeeDetailsPage = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      setError("Invalid employee ID.");
      setLoading(false);
      return;
    }

    getEmployeeById(id)
      .then((res) => {
        const emp = res.data?.employee || res.data || res;
        setEmployee(emp);
      })
      .catch(() => setError("Could not load employee details."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!employee?._id) {
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this employee?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteEmployee(employee._id);
      navigate(APP_ROUTES.EMPLOYEES, { replace: true });
    } catch {
      setError("Could not delete employee. Please try again.");
    }
  };

  return (
    <AdminLayout pageTitle="Employee Details">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            className="gap-2 text-slate-600"
            onClick={() => navigate(APP_ROUTES.EMPLOYEES)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => navigate(`/employees/edit/${id}`)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="gap-2"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {loading && (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </CardContent>
          </Card>
        )}

        {error && !loading && (
          <Card className="border-red-100 bg-red-50 shadow-sm">
            <CardContent className="py-6 text-center text-sm font-medium text-red-600">{error}</CardContent>
          </Card>
        )}

        {employee && !loading && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow">
                  {(employee.name || "?")[0].toUpperCase()}
                </span>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">{employee.name}</CardTitle>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-slate-500">{employee.employeeId}</span>
                    <span className="text-slate-300">•</span>
                    <Badge variant={statusVariant(employee.status || "ACTIVE")}>
                      {employee.status || "ACTIVE"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
              <DetailRow icon={Mail} label="Email" value={employee.email} />
              <DetailRow icon={Phone} label="Phone" value={employee.phone} />
              <DetailRow icon={Calendar} label="Date of Birth" value={employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"} />
              <DetailRow icon={Building2} label="Department" value={employee.department} />
              <DetailRow icon={Briefcase} label="Designation" value={employee.designation} />
              <DetailRow icon={DollarSign} label="Salary" value={formatINR(employee.salary || 0)} />
              <DetailRow icon={Calendar} label="Joining Date" value={employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"} />
              <DetailRow icon={Activity} label="Status" value={employee.status || "ACTIVE"} />
              <DetailRow icon={User} label="Employee ID" value={employee.employeeId} />
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default EmployeeDetailsPage;
