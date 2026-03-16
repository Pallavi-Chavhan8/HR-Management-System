const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true
    },
    basicSalary: {
      type: Number,
      required: true,
      min: 0
    },
    bonus: {
      type: Number,
      default: 0,
      min: 0
    },
    deductions: {
      type: Number,
      default: 0,
      min: 0
    },
    netSalary: {
      type: Number,
      required: true,
      min: 0
    },
    paymentDate: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

salarySchema.pre("validate", function computeNetSalary(next) {
  const basicSalary = Number(this.basicSalary || 0);
  const bonus = Number(this.bonus || 0);
  const deductions = Number(this.deductions || 0);

  this.netSalary = basicSalary + bonus - deductions;

  if (this.netSalary < 0) {
    this.invalidate("netSalary", "Net salary cannot be negative");
  }

  next();
});

const Salary = mongoose.model("Salary", salarySchema);

module.exports = { Salary };
