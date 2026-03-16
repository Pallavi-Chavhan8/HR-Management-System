const mongoose = require("mongoose");
const { Counter } = require("./Counter");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: "EMP00000"
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    department: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    basicSalary: { type: Number, min: 0 },
    salary: { type: Number, required: true, min: 0 },
    joiningDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave"],
      default: "Active"
    }
  },
  { timestamps: true }
);

employeeSchema.index({ name: "text", email: "text", designation: "text", department: "text" });

employeeSchema.pre("validate", function syncBasicSalary(next) {
  if ((this.basicSalary === undefined || this.basicSalary === null) && this.salary !== undefined) {
    this.basicSalary = this.salary;
  }

  if ((this.salary === undefined || this.salary === null) && this.basicSalary !== undefined) {
    this.salary = this.basicSalary;
  }

  return next();
});

employeeSchema.pre("save", async function generateEmployeeId(next) {
  if (!this.isNew) return next();
  if (this.employeeId && this.employeeId !== "EMP00000") return next();

  try {
    // Seed counter from existing records on first use
    const existing = await Counter.findById("employee");
    if (!existing) {
      const lastRecord = await this.constructor
        .findOne({}, { employeeId: 1 })
        .sort({ employeeId: -1 })
        .lean();
      const matched = lastRecord?.employeeId?.match(/^EMP(\d{5})$/);
      const initSeq = matched ? Number(matched[1]) : 0;
      try {
        await Counter.create({ _id: "employee", seq: initSeq });
      } catch (_) {
        // Ignore duplicate-key if another request already created it
      }
    }

    const counter = await Counter.findOneAndUpdate(
      { _id: "employee" },
      { $inc: { seq: 1 } },
      { new: true }
    );

    this.employeeId = `EMP${String(counter.seq).padStart(5, "0")}`;
    return next();
  } catch (error) {
    return next(error);
  }
});

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = { Employee };
