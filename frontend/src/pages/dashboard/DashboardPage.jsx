import { useEffect, useState } from "react";
import { Building2, GraduationCap, Users } from "lucide-react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import DashboardCards from "../../components/common/DashboardCards";
import AdminLayout from "../../components/layout/AdminLayout";
import { APP_ROUTES } from "../../routes/routeConfig";
import { getDashboardStats } from "../../services/dashboardApi";
import { getEmployees } from "../../services/employeeApi";
import { getInterns } from "../../services/internApi";
import { getTraineeCount } from "../../services/traineeApi";
import { getDepartments } from "../../services/departmentApi";
import { formatINR } from "../../utils/currency";

const statusVariant = (status = "") => {
  const s = String(status).toLowerCase();
  if (s === "active") return "success";
  if (s === "on leave" || s === "leave") return "warning";
  if (s === "terminated" || s === "inactive") return "destructive";
  return "secondary";
};

const Spinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
  </div>
);

const EmptyRow = ({ cols, message }) => (
  <TableRow>
    <TableCell colSpan={cols} className="py-10 text-center text-sm text-slate-400">
      {message}
    </TableCell>
  </TableRow>
);

const SectionHeader = ({ icon: Icon, iconBg, title, route, label = "View All" }) => {
  const navigate = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return (
    <CardHeader className="flex flex-col gap-3 border-b border-slate-100 px-5 pb-3 pt-5 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <CardTitle className="truncate text-base font-bold text-slate-800">{title}</CardTitle>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate(route)}
        className="w-full text-xs sm:w-auto"
      >
        {label}
      </Button>
    </CardHeader>
  );
};

const DashboardPage = () => {
  const [stats, setStats]             = useState(null);
  const [totalTrainees, setTotalTrainees] = useState(0);
  const [employees, setEmployees]     = useState([]);
  const [interns, setInterns]         = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadEmp, setLoadEmp]         = useState(true);
  const [loadInt, setLoadInt]         = useState(true);
  const [loadDept, setLoadDept]       = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() =>
        setStats({ totalEmployees: 0, totalInterns: 0, totalDepartments: 0, totalSalaryExpense: 0 })
      );

    getTraineeCount()
      .then((res) => {
        const total = res?.totalTrainees ?? res?.data?.totalTrainees;
        setTotalTrainees(Number(total) || 0);
      })
      .catch(() => setTotalTrainees(0));

    getEmployees()
      .then((res) => setEmployees(res.data?.employees || res.data || []))
      .catch(() => setEmployees([]))
      .finally(() => setLoadEmp(false));

    getInterns()
      .then((res) => setInterns(res.data?.interns || res.data || []))
      .catch(() => setInterns([]))
      .finally(() => setLoadInt(false));

    getDepartments()
      .then((res) => setDepartments(res.data?.departments || res.data || []))
      .catch(() => setDepartments([]))
      .finally(() => setLoadDept(false));
  }, []);

  const displayedEmployees = employees.slice(0, 6);
  const displayedInterns = interns.slice(0, 6);
  const displayedDepartments = departments;

  return (
    <AdminLayout activePath={APP_ROUTES.DASHBOARD} pageTitle="Dashboard">
      <div className="space-y-6 pb-8">
        {/* ── Stats cards ── */}
        <DashboardCards stats={stats} totalTrainees={totalTrainees} />

        {/* ── Employees + Interns row ── */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* Employees — spans 2 cols */}
          <Card className="border-slate-200 shadow-sm xl:col-span-2">
            <SectionHeader
              icon={Users}
              iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
              title="Recent Employees"
              route={APP_ROUTES.EMPLOYEES}
            />
            <CardContent className="p-0">
              {loadEmp ? (
                <Spinner />
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="pl-5 text-xs font-bold uppercase tracking-wider text-slate-400">Name</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Designation</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Department</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Salary</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedEmployees.length === 0 ? (
                      <EmptyRow cols={5} message="No employee records found." />
                    ) : (
                      displayedEmployees.map((emp) => (
                        <TableRow key={emp._id} className="hover:bg-slate-50/50">
                          <TableCell className="pl-5 font-semibold text-slate-800">
                            {emp.name ||
                              `${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
                              "—"}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {emp.designation || emp.role || "—"}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {emp.department?.name || emp.department || "—"}
                          </TableCell>
                          <TableCell className="text-slate-700">
                            {formatINR(emp.salary || 0)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(emp.status || "Active")}>
                              {emp.status || "Active"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interns — 1 col */}
          <Card className="border-slate-200 shadow-sm">
            <SectionHeader
              icon={GraduationCap}
              iconBg="bg-gradient-to-br from-violet-500 to-violet-600"
              title="Interns"
              route={APP_ROUTES.INTERNS}
            />
            <CardContent className="p-0">
              {loadInt ? (
                <Spinner />
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="pl-5 text-xs font-bold uppercase tracking-wider text-slate-400">Name</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Domain</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedInterns.length === 0 ? (
                      <EmptyRow cols={3} message="No interns found." />
                    ) : (
                      displayedInterns.map((intern) => (
                        <TableRow key={intern._id} className="hover:bg-slate-50/50">
                          <TableCell className="pl-5 font-semibold text-slate-800">
                            {intern.name ||
                              `${intern.firstName || ""} ${intern.lastName || ""}`.trim() ||
                              "—"}
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {intern.domain || intern.department || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(intern.status || "Active")}>
                              {intern.status || "Active"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Departments ── */}
        <Card className="border-slate-200 shadow-sm">
          <SectionHeader
            icon={Building2}
            iconBg="bg-gradient-to-br from-indigo-500 to-indigo-600"
            title="Department List"
            route={APP_ROUTES.DEPARTMENTS}
            label="Manage"
          />
          <CardContent className="p-0">
            {loadDept ? (
              <Spinner />
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                    <TableHead className="pl-5 text-xs font-bold uppercase tracking-wider text-slate-400">Department</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Head / Manager</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedDepartments.length === 0 ? (
                    <EmptyRow cols={4} message="No departments found." />
                  ) : (
                    displayedDepartments.map((dept) => (
                      <TableRow key={dept._id} className="hover:bg-slate-50/50">
                        <TableCell className="pl-5 font-semibold text-slate-800">
                          {dept.name || "—"}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {dept.head || dept.manager || "—"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-slate-500">
                          {dept.description || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">Active</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
