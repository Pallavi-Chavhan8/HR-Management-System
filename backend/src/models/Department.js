const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: [true, "departmentName is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

departmentSchema.virtual("name")
  .get(function getDepartmentName() {
    return this.departmentName;
  })
  .set(function setDepartmentName(value) {
    this.departmentName = value;
  });

departmentSchema.set("toJSON", { virtuals: true });
departmentSchema.set("toObject", { virtuals: true });

const Department = mongoose.model("Department", departmentSchema);

module.exports = { Department };
