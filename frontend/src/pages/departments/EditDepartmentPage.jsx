import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import EntityForm from "../../components/forms/EntityForm";
import { Button } from "../../components/ui/button";
import { APP_ROUTES } from "../../routes/routeConfig";
import { getDepartmentById, updateDepartment } from "../../services/departmentApi";
import { validateDepartmentName } from "../../utils/validation";

const departmentFields = [
  { name: "departmentName", placeholder: "Department name" },
  { name: "description",    placeholder: "Description", fullWidth: true },
];

const EditDepartmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [prefillData, setPrefillData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!id) {
      setLoadError("Invalid department ID.");
      setLoading(false);
      return;
    }

    getDepartmentById(id)
      .then((res) => {
        const dept = res.data || null;
        if (!dept) {
          setLoadError("Department not found.");
          return;
        }
        setPrefillData({
          departmentName: dept.departmentName || dept.name || "",
          description: dept.description || "",
        });
      })
      .catch(() => setLoadError("Could not load department details."))
      .finally(() => setLoading(false));
  }, [id]);

  const validateDepartmentForm = useCallback(
    (formData) => validateDepartmentName(formData),
    []
  );

  const handleSubmit = async (formData) => {
    await updateDepartment(id, formData);
  };

  return (
    <AdminLayout pageTitle="Edit Department">
      <div className="mx-auto max-w-2xl space-y-5">
        <Button
          variant="outline"
          className="gap-2 text-slate-600"
          onClick={() => navigate(APP_ROUTES.DEPARTMENTS)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Departments
        </Button>

        {loadError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {loadError}
          </p>
        )}

        {loading && !loadError && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
        )}

        {!loading && !loadError && prefillData && (
          <EntityForm
            title="Edit Department"
            fields={departmentFields}
            submitLabel="Update Department"
            validate={validateDepartmentForm}
            onSubmit={handleSubmit}
            onSuccess={() => navigate(APP_ROUTES.DEPARTMENTS)}
            initialValues={prefillData}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default EditDepartmentPage;
