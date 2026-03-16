import { Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({
  pageTitle = "Dashboard",
  onExport,
  onMenuToggle,
}) => {
  const { admin } = useAuth();

  return (
    <header className="admin-fade-in mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4 lg:mb-6">
      {/* Page title */}
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          onClick={() => onMenuToggle?.()}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
          Overview
        </p>
        <h2 className="mt-0.5 truncate text-xl font-bold text-slate-800">{pageTitle}</h2>
        </div>
      </div>

      {/* Actions */}
      <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto sm:justify-end">
        {/* Export button */}
        {typeof onExport === "function" && (
          <button
            type="button"
            onClick={() => onExport()}
            className="inline-flex h-9 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-3 text-xs font-semibold text-white shadow-md shadow-blue-200/50 transition-all hover:from-blue-500 hover:to-indigo-500"
          >
            Export
          </button>
        )}

        {/* Avatar */}
        <div
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm sm:flex"
          title={admin?.name || "Admin"}
        >
          {(admin?.name?.[0] || "A").toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
