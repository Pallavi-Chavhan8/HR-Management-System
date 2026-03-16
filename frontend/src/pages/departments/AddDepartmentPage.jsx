import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import EntityForm from "../../components/forms/EntityForm";
import { Button } from "../../components/ui/button";
import { APP_ROUTES } from "../../routes/routeConfig";
import { createDepartment } from "../../services/departmentApi";
import { validateDepartmentName } from "../../utils/validation";

const departmentFields = [
  { name: "departmentName", placeholder: "Department name" },
  { name: "description",    placeholder: "Description",    fullWidth: true },
];

const AddDepartmentPage = () => {
  const navigate = useNavigate();

  const validateDepartmentForm = useCallback((formData) => validateDepartmentName(formData), []);

  const handleSubmit = async (formData) => {
    await createDepartment(formData);
  };

  return (
    <AdminLayout pageTitle="Add Department">
      <div className="mx-auto max-w-2xl space-y-5">
        <Button
          variant="outline"
          className="gap-2 text-slate-600"
          onClick={() => navigate(APP_ROUTES.DEPARTMENTS)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Departments
        </Button>

        <EntityForm
          title="New Department"
          fields={departmentFields}
          submitLabel="Create Department"
          validate={validateDepartmentForm}
          onSubmit={handleSubmit}
          onSuccess={() => navigate(APP_ROUTES.DEPARTMENTS)}
        />
      </div>
    </AdminLayout>
  );
};

export default AddDepartmentPage;
