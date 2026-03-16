import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, CircleDollarSign, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { APP_ROUTES } from "../../routes/routeConfig";
import { getSalaryById } from "../../services/salaryApi";
import { formatINR } from "../../utils/currency";

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{value || "-"}</p>
    </div>
  </div>
);

const SalaryDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Invalid salary ID.");
      setLoading(false);
      return;
    }

    getSalaryById(id)
      .then((res) => {
        setSalary(res?.data || null);
        setError("");
      })
      .catch(() => {
        setSalary(null);
        setError("Could not load salary details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AdminLayout pageTitle="Salary Details">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button
          variant="outline"
          className="gap-2 text-slate-600"
          onClick={() => navigate(APP_ROUTES.SALARY)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Salary
        </Button>

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

        {salary && !loading && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 px-6 py-5">
              <CardTitle className="text-xl font-bold text-slate-800">Salary Record</CardTitle>
              <p className="text-sm text-slate-500">
                {salary.employee?.employeeId || "-"} - {salary.employee?.name || "Unknown Employee"}
              </p>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
              <DetailRow icon={User} label="Employee" value={salary.employee?.name || "-"} />
              <DetailRow icon={User} label="Employee ID" value={salary.employee?.employeeId || "-"} />
              <DetailRow icon={CircleDollarSign} label="Basic Salary" value={formatINR(salary.basicSalary || 0)} />
              <DetailRow icon={CircleDollarSign} label="Bonus" value={formatINR(salary.bonus || 0)} />
              <DetailRow icon={CircleDollarSign} label="Deductions" value={formatINR(salary.deductions || 0)} />
              <DetailRow icon={CircleDollarSign} label="Net Salary" value={formatINR(salary.netSalary || 0)} />
              <DetailRow
                icon={Calendar}
                label="Payment Date"
                value={salary.paymentDate ? new Date(salary.paymentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default SalaryDetailsPage;
