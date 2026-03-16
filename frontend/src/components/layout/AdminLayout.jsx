import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const AdminLayout = ({
  children,
  pageTitle,
  onNavbarExport,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800">
      <div className="flex min-h-screen">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar
            pageTitle={pageTitle}
            onExport={onNavbarExport}
            onMenuToggle={() => setIsSidebarOpen((value) => !value)}
          />

          <main className="flex-1 min-w-0 px-4 pb-5 pt-2 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
