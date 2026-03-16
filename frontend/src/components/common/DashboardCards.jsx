import { Banknote, Building2, GraduationCap, Users } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { formatINR } from "../../utils/currency";

const metrics = [
  {
    key: "totalEmployees",
    label: "Total Employees",
    description: "Active records",
    icon: Users,
    gradient: "from-blue-500 to-blue-600",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    strip: "from-blue-500 to-blue-600",
  },
  {
    key: "totalInterns",
    label: "Total Interns",
    description: "Current interns",
    icon: GraduationCap,
    gradient: "from-violet-500 to-violet-600",
    iconBg: "bg-gradient-to-br from-violet-500 to-violet-600",
    strip: "from-violet-500 to-violet-600",
  },
  {
    key: "totalDepartments",
    label: "Departments",
    description: "Configured units",
    icon: Building2,
    gradient: "from-indigo-500 to-indigo-600",
    iconBg: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    strip: "from-indigo-500 to-indigo-600",
  },
  {
    key: "totalTrainees",
    label: "Total Trainees",
    description: "Registered trainees",
    icon: Users,
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    strip: "from-amber-500 to-orange-600",
  },
  {
    key: "totalSalaryExpense",
    label: "Salary Expense",
    description: "Total monthly payout",
    icon: Banknote,
    gradient: "from-emerald-500 to-emerald-600",
    iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    strip: "from-emerald-500 to-emerald-600",
    format: true,
  },
];

const DashboardCards = ({ stats, totalTrainees = 0 }) => {
  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
      {metrics.map((m) => {
        const Icon = m.icon;
        const metricValue = m.key === "totalTrainees" ? totalTrainees : stats?.[m.key];
        const value = m.format
          ? formatINR(metricValue ?? 0)
          : (metricValue ?? 0);

        return (
          <Card
            key={m.key}
            className="group relative overflow-hidden border-0 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {/* coloured top strip */}
            <div className={`h-1 w-full bg-gradient-to-r ${m.strip}`} />
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {m.label}
                  </p>
                  <p className="mt-2 truncate text-3xl font-bold tracking-tight text-slate-800">
                    {stats != null || m.key === "totalTrainees" ? (
                      value
                    ) : (
                      <span className="inline-block h-8 w-24 animate-pulse rounded-md bg-slate-100" />
                    )}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500">{m.description}</p>
                </div>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-md ${m.iconBg}`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
};

export default DashboardCards;
