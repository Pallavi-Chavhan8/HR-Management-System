import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import ManagementTable from "../../components/common/ManagementTable";
import ExportDropdown from "../../components/common/ExportDropdown";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { APP_ROUTES } from "../../routes/routeConfig";
import { deleteTrainee, getTrainees } from "../../services/traineeApi";
import { exportRecords, sanitizeFileName } from "../../utils/exportUtils";
import { matchesKeywordInObject } from "../../utils/search";

const statusVariant = (status = "") => {
  const value = String(status).toLowerCase();
  if (value === "active") return "success";
  if (value === "completed") return "secondary";
  return "secondary";
};

const TraineesPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const navigate = useNavigate();

  const mapTraineeForExport = useCallback((trainee = {}) => ({
    traineeId: trainee.traineeId || "",
    name: trainee.name || "",
    email: trainee.email || "",
    phone: trainee.phone || "",
    dateOfBirth: trainee.dateOfBirth
      ? new Date(trainee.dateOfBirth).toISOString().slice(0, 10)
      : "",
    department: trainee.department || "",
    course: trainee.course || trainee.trainingProgram || "",
    internshipDuration: trainee.internshipDuration || trainee.trainingDuration || "",
    startDate: trainee.startDate
      ? new Date(trainee.startDate).toISOString().slice(0, 10)
      : "",
    endDate: trainee.endDate
      ? new Date(trainee.endDate).toISOString().slice(0, 10)
      : "",
    status: trainee.status || "",
  }), []);

  const handleExportAll = useCallback((format) => {
    exportRecords({
      records: rows.map(mapTraineeForExport),
      format,
      fileName: `trainees-report.${format}`,
      title: "Trainees Report",
      sheetName: "Trainees",
    });
  }, [rows, mapTraineeForExport]);

  const handleExportSingle = useCallback((trainee, format) => {
    const record = mapTraineeForExport(trainee);
    const namePart = sanitizeFileName(record.name || record.traineeId || "trainee");
    exportRecords({
      records: [record],
      format,
      fileName: `trainee-${namePart}.${format}`,
      title: "Trainee Details",
      sheetName: "Trainee",
    });
  }, [mapTraineeForExport]);

  useEffect(() => {
    getTrainees()
      .then((res) => {
        setRows(res.data?.trainees || res.data || []);
        setLoadError("");
      })
      .catch(() => {
        setRows([]);
        setLoadError("Could not load trainees. Please refresh and try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFilteredRows(rows.filter((row) => matchesKeywordInObject(row, searchText)));
  }, [rows, searchText]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this trainee?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteTrainee(id);
      setRows((prev) => prev.filter((item) => item._id !== id));
    } catch (_error) {
      // Keep simple UX consistent with current codebase.
      window.alert("Could not delete trainee. Please try again.");
    }
  };

  const columns = useMemo(
    () => [
      { key: "traineeId", label: "ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      {
        key: "dateOfBirth",
        label: "Date of Birth",
        render: (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "-"),
      },
      { key: "department", label: "Department" },
      {
        key: "course",
        label: "Course",
        render: (_value, row) => row.course || row.trainingProgram || "-",
      },
      {
        key: "internshipDuration",
        label: "Duration",
        render: (_value, row) => row.internshipDuration || row.trainingDuration || "-",
      },
      {
        key: "startDate",
        label: "Start Date",
        render: (value) => (value ? new Date(value).toISOString().slice(0, 10) : "-"),
      },
      {
        key: "endDate",
        label: "End Date",
        render: (value) => (value ? new Date(value).toISOString().slice(0, 10) : "-"),
      },
      {
        key: "status",
        label: "Status",
        render: (value) => <Badge variant={statusVariant(value || "ACTIVE")}>{value || "ACTIVE"}</Badge>,
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
              onClick={() => navigate(APP_ROUTES.TRAINEE_DETAIL.replace(":id", id))}
            >
              <Eye className="h-3 w-3" />
              View
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => navigate(APP_ROUTES.TRAINEE_EDIT.replace(":id", id))}
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
    [navigate, handleDelete, handleExportSingle]
  );

  return (
    <AdminLayout pageTitle="Trainees">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          placeholder="Search trainees by name, email, department..."
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
        title="Trainee Directory"
        columns={columns}
        rows={filteredRows}
        loading={loading}
        actionLabel="Add Trainee"
        onAction={() => navigate(APP_ROUTES.TRAINEE_ADD)}
      />
    </AdminLayout>
  );
};

export default TraineesPage;
