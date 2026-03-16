import { formatINR } from "../../utils/currency";

const rows = [
  {
    _id: "emp-1",
    name: "Aarav Mehta",
    role: "HR Executive",
    department: "Human Resources",
    salary: 3200,
    status: "Active"
  },
  {
    _id: "emp-2",
    name: "Ishita Reddy",
    role: "Recruiter",
    department: "Talent Acquisition",
    salary: 2900,
    status: "Active"
  },
  {
    _id: "emp-3",
    name: "Rohan Nair",
    role: "Payroll Analyst",
    department: "Finance",
    salary: 3600,
    status: "On Leave"
  }
];

const EmployeesTable = () => {
  return (
    <section className="admin-fade-in rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-bold text-slate-900">Employee Records</h3>
        <button type="button" className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Designation</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Salary</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id} className="border-t border-slate-100">
                <td className="px-5 py-4 font-semibold text-slate-800">{row.name}</td>
                <td className="px-5 py-4 text-slate-600">{row.role}</td>
                <td className="px-5 py-4 text-slate-600">{row.department}</td>
                <td className="px-5 py-4 text-slate-700">{formatINR(row.salary)}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default EmployeesTable;
