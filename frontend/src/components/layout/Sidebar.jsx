import {
  Award,
  Building2,
  FileBadge,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  CircleDollarSign,
  ShieldCheck,
  X,
  UserCircle,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { APP_ROUTES } from "../../routes/routeConfig";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard",   key: "dashboard",   path: APP_ROUTES.DASHBOARD,   icon: LayoutDashboard },
  { label: "Employees",   key: "employees",   path: APP_ROUTES.EMPLOYEES,   icon: Users },
  { label: "Interns",     key: "interns",     path: APP_ROUTES.INTERNS,     icon: GraduationCap },
  { label: "Trainees",    key: "trainees",    path: APP_ROUTES.TRAINEES,    icon: Award },
  { label: "Departments", key: "departments", path: APP_ROUTES.DEPARTMENTS, icon: Building2 },
  { label: "Certificates", key: "certificates", path: APP_ROUTES.CERTIFICATES, icon: FileBadge },
  { label: "Salary",      key: "salary",      path: APP_ROUTES.SALARY,      icon: CircleDollarSign },
];

const Sidebar = ({ isOpen = false, onClose }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    onClose?.();
    navigate(APP_ROUTES.LOGIN, { replace: true });
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[1px] transition-opacity duration-200 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[88vw] flex-col border-r border-slate-200/80 bg-white shadow-2xl transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      {/* Logo area */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-200">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">HR Control</p>
          <h1 className="mt-0.5 text-base font-bold leading-none text-slate-800">Admin Panel</h1>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Main Menu
        </p>
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const active =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.key}
                onClick={() => {
                  navigate(item.path);
                  onClose?.();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200/50"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    active ? "text-white" : "text-slate-400"
                  }`}
                />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User profile + logout */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900">
            <UserCircle className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {admin?.name || "Admin User"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {admin?.email || "Not signed in"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
