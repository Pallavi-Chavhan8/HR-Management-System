import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import AddDepartmentPage from "../pages/departments/AddDepartmentPage";
import CertificatesPage from "../pages/certificates/CertificatesPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import DepartmentsPage from "../pages/departments/DepartmentsPage";
import AddEmployeePage from "../pages/employees/AddEmployeePage";
import EmployeeDetailsPage from "../pages/employees/EmployeeDetailsPage";
import EmployeeEditPage from "../pages/employees/EmployeeEditPage";
import EmployeesPage from "../pages/employees/EmployeesPage";
import AddInternPage from "../pages/interns/AddInternPage";
import InternDetailsPage from "../pages/interns/InternDetailsPage";
import InternEditPage from "../pages/interns/InternEditPage";
import InternsPage from "../pages/interns/InternsPage";
import EditDepartmentPage from "../pages/departments/EditDepartmentPage";
import AddTraineePage from "../pages/trainees/AddTraineePage";
import EditTraineePage from "../pages/trainees/EditTraineePage";
import AddSalaryPage from "../pages/salary/AddSalaryPage";
import EditSalaryPage from "../pages/salary/EditSalaryPage";
import SalaryDetailsPage from "../pages/salary/SalaryDetailsPage";
import SalaryPage from "../pages/salary/SalaryPage";
import TraineeDetailsPage from "../pages/trainees/TraineeDetailsPage";
import TraineesPage from "../pages/trainees/TraineesPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import { APP_ROUTES } from "./routeConfig";

const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
  </div>
);

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return isAuthenticated ? <Outlet /> : <Navigate to={APP_ROUTES.LOGIN} replace />;
};

const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return !isAuthenticated ? <Outlet /> : <Navigate to={APP_ROUTES.DASHBOARD} replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route element={<PublicRoute />}>
      <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={APP_ROUTES.REGISTER} element={<RegisterPage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route path={APP_ROUTES.DASHBOARD}     element={<DashboardPage />} />
      <Route path={APP_ROUTES.EMPLOYEES}     element={<EmployeesPage />} />
      <Route path={APP_ROUTES.EMPLOYEE_ADD}  element={<AddEmployeePage />} />
      <Route path={APP_ROUTES.EMPLOYEE_EDIT} element={<EmployeeEditPage />} />
      <Route path={APP_ROUTES.EMPLOYEE_DETAIL} element={<EmployeeDetailsPage />} />
      <Route path={APP_ROUTES.INTERNS}       element={<InternsPage />} />
      <Route path={APP_ROUTES.INTERN_ADD}    element={<AddInternPage />} />
      <Route path={APP_ROUTES.INTERN_EDIT}   element={<InternEditPage />} />
      <Route path={APP_ROUTES.INTERN_DETAIL} element={<InternDetailsPage />} />
      <Route path={APP_ROUTES.TRAINEES}      element={<TraineesPage />} />
      <Route path={APP_ROUTES.TRAINEE_ADD}   element={<AddTraineePage />} />
      <Route path={APP_ROUTES.TRAINEE_EDIT}  element={<EditTraineePage />} />
      <Route path={APP_ROUTES.TRAINEE_DETAIL} element={<TraineeDetailsPage />} />
      <Route path={APP_ROUTES.DEPARTMENTS}    element={<DepartmentsPage />} />
      <Route path={APP_ROUTES.DEPARTMENT_ADD}  element={<AddDepartmentPage />} />
      <Route path={APP_ROUTES.DEPARTMENT_EDIT} element={<EditDepartmentPage />} />
      <Route path={APP_ROUTES.CERTIFICATES} element={<CertificatesPage />} />
      <Route path={APP_ROUTES.SALARY} element={<SalaryPage />} />
      <Route path={APP_ROUTES.SALARY_ADD} element={<AddSalaryPage />} />
      <Route path={APP_ROUTES.SALARY_EDIT} element={<EditSalaryPage />} />
      <Route path={APP_ROUTES.SALARY_DETAIL} element={<SalaryDetailsPage />} />
    </Route>

    <Route path="/" element={<Navigate to={APP_ROUTES.DASHBOARD} replace />} />
    <Route path="*" element={<Navigate to={APP_ROUTES.DASHBOARD} replace />} />
  </Routes>
);

export default AppRoutes;
