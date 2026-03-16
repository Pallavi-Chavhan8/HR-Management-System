import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import ManagementTable from "../../components/common/ManagementTable";
import ExportDropdown from "../../components/common/ExportDropdown";
import AdminLayout from "../../components/layout/AdminLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { APP_ROUTES } from "../../routes/routeConfig";
import { useNavigate } from "react-router-dom";
import { deleteIntern, getInterns } from "../../services/internApi";
import { exportRecords, sanitizeFileName } from "../../utils/exportUtils";
import { matchesKeywordInObject } from "../../utils/search";

const InternsPage = () => {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const navigate = useNavigate();

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this intern?");
    if (!confirmed) return;
    try {
      await deleteIntern(id);
      setRows((prev) => prev.filter((row) => row._id !== id));
    } catch {
      // deletion failed — row remains in the list
    }
  }, []);

  const mapInternForExport = useCallback((intern = {}) => ({
    internId: intern.internId || "",
    name: intern.name || `${intern.firstName || ""} ${intern.lastName || ""}`.trim() || "",
    email: intern.email || "",
    phone: intern.phone || "",
    dateOfBirth: intern.dateOfBirth
      ? new Date(intern.dateOfBirth).toISOString().slice(0, 10)
      : "",
    department: intern.department || "",
    course: intern.course || "",
    internshipDuration: intern.internshipDuration || "",
    startDate: intern.startDate
      ? new Date(intern.startDate).toISOString().slice(0, 10)
      : "",
    endDate: intern.endDate
      ? new Date(intern.endDate).toISOString().slice(0, 10)
      : "",
    status: intern.status || "",
  }), []);

  const handleExportAll = useCallback((format) => {
    exportRecords({
      records: rows.map(mapInternForExport),
      format,
      fileName: `interns-report.${format}`,
      title: "Interns Report",
      sheetName: "Interns",
    });
  }, [mapInternForExport, rows]);

  const handleExportSingle = useCallback((intern, format) => {
    const record = mapInternForExport(intern);
    const namePart = sanitizeFileName(record.name || record.internId || "intern");

    exportRecords({
      records: [record],
      format,
      fileName: `intern-${namePart}.${format}`,
      title: "Intern Details",
      sheetName: "Intern",
    });
  }, [mapInternForExport]);

  useEffect(() => {
    getInterns()
      .then((res) => {
        setRows(res.data?.interns || res.data || []);
        setLoadError("");
      })
      .catch(() => {
        setRows([]);
        setLoadError("Could not load interns. Please refresh and try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFilteredRows(rows.filter((row) => matchesKeywordInObject(row, searchText)));
  }, [rows, searchText]);

  const internColumns = useMemo(
    () => [
      { key: "internId", label: "ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      {
        key: "dateOfBirth",
        label: "Date of Birth",
        render: (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "-"),
      },
      { key: "department", label: "Department" },
      { key: "course", label: "Course" },
      { key: "internshipDuration", label: "Duration" },
      {
        key: "endDate",
        label: "End Date",
        render: (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "-"),
      },
      {
        key: "_id",
        label: "Actions",
        render: (_id, row) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-blue-600"
              onClick={() => navigate(APP_ROUTES.INTERN_DETAIL.replace(":id", _id))}
              title="View"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-indigo-600"
              onClick={() => navigate(APP_ROUTES.INTERN_EDIT.replace(":id", _id))}
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
    <AdminLayout pageTitle="Interns">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          placeholder="Search interns by any field..."
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
        title="Intern Directory"
        columns={internColumns}
        rows={filteredRows}
        loading={loading}
        actionLabel="Add Intern"
        onAction={() => navigate(APP_ROUTES.INTERN_ADD)}
      />
    </AdminLayout>
  );
};

export default InternsPage;
