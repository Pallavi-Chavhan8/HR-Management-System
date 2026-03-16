import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import ManagementTable from "../../components/common/ManagementTable";
import ExportDropdown from "../../components/common/ExportDropdown";
import AdminLayout from "../../components/layout/AdminLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { APP_ROUTES } from "../../routes/routeConfig";
import { useNavigate } from "react-router-dom";
import { deleteDepartment, getDepartments } from "../../services/departmentApi";
import { exportRecords, sanitizeFileName } from "../../utils/exportUtils";
import { matchesKeywordInObject } from "../../utils/search";

const DepartmentsPage = () => {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const navigate = useNavigate();

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this department?");
    if (!confirmed) return;
    try {
      await deleteDepartment(id);
      setRows((prev) => prev.filter((row) => row._id !== id));
    } catch {
      // deletion failed — row remains in the list
    }
  }, []);

  const mapDepartmentForExport = useCallback((department = {}) => ({
    departmentName: department.departmentName || department.name || "",
    description: department.description || "",
    headOrManager: department.head || department.manager || "",
    createdAt: department.createdAt
      ? new Date(department.createdAt).toISOString().slice(0, 10)
      : "",
  }), []);

  const handleExportAll = useCallback((format) => {
    exportRecords({
      records: rows.map(mapDepartmentForExport),
      format,
      fileName: `departments-report.${format}`,
      title: "Departments Report",
      sheetName: "Departments",
    });
  }, [mapDepartmentForExport, rows]);

  const handleExportSingle = useCallback((department, format) => {
    const record = mapDepartmentForExport(department);
    const namePart = sanitizeFileName(record.departmentName || "department");

    exportRecords({
      records: [record],
      format,
      fileName: `department-${namePart}.${format}`,
      title: "Department Details",
      sheetName: "Department",
    });
  }, [mapDepartmentForExport]);

  useEffect(() => {
    getDepartments()
      .then((res) => {
        setRows(res.data?.departments || res.data || []);
        setLoadError("");
      })
      .catch(() => {
        setRows([]);
        setLoadError("Could not load departments. Please refresh and try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFilteredRows(rows.filter((row) => matchesKeywordInObject(row, searchText)));
  }, [rows, searchText]);

  const departmentColumns = useMemo(
    () => [
      { key: "departmentName", label: "Department" },
      { key: "description", label: "Description" },
      {
        key: "_id",
        label: "Actions",
        render: (_id, row) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-indigo-600"
              onClick={() => navigate(APP_ROUTES.DEPARTMENT_EDIT.replace(":id", _id))}
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-red-600"
              onClick={() => handleDelete(_id)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <ExportDropdown
              buttonLabel="Export"
              onSelect={(format) => handleExportSingle(row, format)}
            />
          </div>
        ),
      },
    ],
    [handleExportSingle, handleDelete, navigate]
  );

  return (
    <AdminLayout pageTitle="Departments">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          placeholder="Search departments by any field..."
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
      <ManagementTable
        title="Department Directory"
        columns={departmentColumns}
        rows={filteredRows}
        loading={loading}
        actionLabel="Add Department"
        onAction={() => navigate(APP_ROUTES.DEPARTMENT_ADD)}
      />
    </AdminLayout>
  );
};

export default DepartmentsPage;
