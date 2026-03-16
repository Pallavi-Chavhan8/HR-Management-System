const EmployeeForm = () => {
  return (
    <section className="admin-fade-in rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">Quick Add Employee</h3>
      <form className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-teal-500 focus:ring-2" placeholder="Full name" />
        <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-teal-500 focus:ring-2" placeholder="Email" type="email" />
        <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-teal-500 focus:ring-2" placeholder="Phone" />
        <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-teal-500 focus:ring-2" placeholder="Department" />
        <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-teal-500 focus:ring-2" placeholder="Designation" />
        <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-teal-500 focus:ring-2" placeholder="Salary (INR)" type="number" />
        <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-teal-500 focus:ring-2 sm:col-span-2" type="date" />
        <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-teal-500 focus:ring-2 sm:col-span-2" defaultValue="" required>
          <option value="" disabled>Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="On Leave">On Leave</option>
        </select>
        <button type="button" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 sm:col-span-2">
          Save Employee
        </button>
      </form>
    </section>
  );
};

export default EmployeeForm;
