import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import ManagementTable from "../../components/common/ManagementTable";
import ExportDropdown from "../../components/common/ExportDropdown";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { APP_ROUTES } from "../../routes/routeConfig";
import { useNavigate } from "react-router-dom";
import { deleteEmployee, getEmployees } from "../../services/employeeApi";
import { exportRecords, sanitizeFileName } from "../../utils/exportUtils";
import { matchesKeywordInObject } from "../../utils/search";
import { formatINR } from "../../utils/currency";

const statusVariant = (s = "") => {
  const v = String(s).toLowerCase();
  if (v === "active") return "success";
  if (v === "on leave" || v === "leave") return "warning";
  if (v === "inactive" || v === "terminated") return "destructive";
  return "secondary";
};

const EmployeesPage = () => {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const navigate = useNavigate();

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getEmployees();
      setRows(res.data?.employees || res.data || []);
      setLoadError("");
    } catch {
      setRows([]);
      setLoadError("Could not load employees. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this employee?");
    if (!confirmed) {
      return;
    }

    try {
      setActionError("");
      await deleteEmployee(id);
      await loadEmployees();
    } catch {
      setActionError("Could not delete employee. Please try again.");
    }
  }, [loadEmployees]);

  const mapEmployeeForExport = useCallback((employee = {}) => ({
    employeeId: employee.employeeId || "",
    name: employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "",
    email: employee.email || "",
    phone: employee.phone || "",
    dateOfBirth: employee.dateOfBirth
      ? new Date(employee.dateOfBirth).toISOString().slice(0, 10)
      : "",
    department: employee.department?.name || employee.department || "",
    designation: employee.designation || employee.role || "",
    salary: employee.salary ?? "",
    joiningDate: employee.joiningDate
      ? new Date(employee.joiningDate).toISOString().slice(0, 10)
      : "",
    status: employee.status || "",
  }), []);

  const handleExportAll = useCallback((format) => {
    const records = rows.map(mapEmployeeForExport);
    exportRecords({
      records,
      format,
      fileName: `employees-report.${format}`,
      title: "Employees Report",
      sheetName: "Employees",
    });
  }, [mapEmployeeForExport, rows]);

  const handleExportSingle = useCallback((employee, format) => {
    const record = mapEmployeeForExport(employee);
    const namePart = sanitizeFileName(record.name || record.employeeId || "employee");

    exportRecords({
      records: [record],
      format,
      fileName: `employee-${namePart}.${format}`,
      title: "Employee Details",
      sheetName: "Employee",
    });
  }, [mapEmployeeForExport]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    const nextRows = rows.filter((employee) => matchesKeywordInObject(employee, searchText));
    setFilteredRows(nextRows);
  }, [rows, searchText]);

  const employeeColumns = useMemo(
    () => [
      { key: "employeeId", label: "ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      {
        key: "dateOfBirth",
        label: "Date of Birth",
        render: (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "-"),
      },
      { key: "department", label: "Department" },
      { key: "designation", label: "Designation" },
      { key: "salary", label: "Salary", render: (v) => formatINR(v || 0) },
      {
        key: "status",
        label: "Status",
        render: (v) => <Badge variant={statusVariant(v || "ACTIVE")}>{v || "ACTIVE"}</Badge>,
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
              onClick={() => navigate(`/employees/${id}`)}
            >
              <Eye className="h-3 w-3" />
              View
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => navigate(APP_ROUTES.EMPLOYEE_EDIT.replace(":id", id))}
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="h-7 gap-1 px-2 text-xs"
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
    [handleDelete, handleExportSingle, navigate]
  );

  return (
    <AdminLayout pageTitle="Employees">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          placeholder="Search by name, email, department, phone..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          className="w-full sm:max-w-xs"
        />
        <ExportDropdown
          buttonLabel="Export All"
          onSelect={handleExportAll}
          disabled={loading || filteredRows.length === 0}
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
        title="Employee Directory"
        columns={employeeColumns}
        rows={filteredRows}
        loading={loading}
        actionLabel="Add Employee"
        onAction={() => navigate(APP_ROUTES.EMPLOYEE_ADD)}
      />
    </AdminLayout>
  );
};

export default EmployeesPage;
