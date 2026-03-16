import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import ManagementTable from "../../components/common/ManagementTable";
import ExportDropdown from "../../components/common/ExportDropdown";
import { Button } from "../../components/ui/button";
import { APP_ROUTES } from "../../routes/routeConfig";
import { deleteSalary, getSalaries } from "../../services/salaryApi";
import { formatINR } from "../../utils/currency";
import { exportRecords, sanitizeFileName } from "../../utils/exportUtils";

const SalaryPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate();

  const loadSalaryRecords = async () => {
    try {
      setLoading(true);
      setActionError("");
      const res = await getSalaries();
      setRows(res?.data || []);
      setLoadError("");
    } catch {
      setRows([]);
      setLoadError("Could not load salary records. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  const mapSalaryForExport = (salary = {}) => ({
    employeeId: salary.employee?.employeeId || "",
    employeeName: salary.employee?.name || "",
    employeeEmail: salary.employee?.email || "",
    department: salary.employee?.department || "",
    designation: salary.employee?.designation || "",
    basicSalary: salary.basicSalary ?? 0,
    bonus: salary.bonus ?? 0,
    deductions: salary.deductions ?? 0,
    netSalary: salary.netSalary ?? 0,
    paymentDate: salary.paymentDate
      ? new Date(salary.paymentDate).toISOString().slice(0, 10)
      : "",
  });

  const handleExportAll = (format) => {
    const records = rows.map(mapSalaryForExport);
    exportRecords({
      records,
      format,
      fileName: `salary-records.${format}`,
      title: "Salary Records Report",
      sheetName: "Salaries",
    });
  };

  const handleExportSingle = (salary, format) => {
    const record = mapSalaryForExport(salary);
    const identity = sanitizeFileName(record.employeeId || record.employeeName || "salary-record");

    exportRecords({
      records: [record],
      format,
      fileName: `salary-${identity}.${format}`,
      title: "Salary Record",
      sheetName: "Salary",
    });
  };

  useEffect(() => {
    loadSalaryRecords();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this salary record?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteSalary(id);
      await loadSalaryRecords();
    } catch (error) {
      setActionError(error?.message || "Could not delete salary record. Please try again.");
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "employee",
        label: "Employee",
        render: (_value, row) => row.employee?.employeeId || row.employee?.name || "-",
      },
      {
        key: "employeeName",
        label: "Name",
        render: (_value, row) => row.employee?.name || "-",
      },
      { key: "basicSalary", label: "Basic", render: (value) => formatINR(value || 0) },
      { key: "bonus", label: "Bonus", render: (value) => formatINR(value || 0) },
      { key: "deductions", label: "Deductions", render: (value) => formatINR(value || 0) },
      { key: "netSalary", label: "Net", render: (value) => formatINR(value || 0) },
      {
        key: "paymentDate",
        label: "Payment Date",
        render: (value) =>
          value
            ? new Date(value).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "-",
      },
      {
        key: "_id",
        label: "Action",
        render: (id, row) => (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => navigate(APP_ROUTES.SALARY_DETAIL.replace(":id", id))}
            >
              <Eye className="h-3 w-3" />
              View
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => navigate(APP_ROUTES.SALARY_EDIT.replace(":id", id))}
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 gap-1 px-2 text-xs text-red-600"
              onClick={() => handleDelete(id)}
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
            <ExportDropdown
              buttonLabel="Export"
              onSelect={(format) => handleExportSingle(row, format)}
            />
          </div>
        ),
      },
    ],
    [navigate]
  );

  return (
    <AdminLayout pageTitle="Salary">
      <div className="mb-3 flex justify-end">
        <ExportDropdown
          buttonLabel="Export All"
          onSelect={handleExportAll}
          disabled={loading || rows.length === 0}
        />
      </div>

      {loadError && (
        <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {loadError}
        </p>
      )}
      {actionError && (
        <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {actionError}
        </p>
      )}

      <ManagementTable
        title="Salary Records"
        columns={columns}
        rows={rows}
        loading={loading}
        actionLabel="Add Salary"
        onAction={() => navigate(APP_ROUTES.SALARY_ADD)}
      />
    </AdminLayout>
  );
};

export default SalaryPage;
