const mongoose = require("mongoose");
const { Counter } = require("./Counter");

const internSchema = new mongoose.Schema(
  {
    internId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: "INT00000"
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    department: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    internshipDuration: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED"],
      default: "ACTIVE",
      required: true
    }
  },
  { timestamps: true }
);

internSchema.index({ name: "text", email: "text", department: "text" });

internSchema.pre("save", async function generateInternId(next) {
  if (!this.isNew) return next();
  if (this.internId && this.internId !== "INT00000") return next();

  try {
    // Seed counter from existing records on first use
    const existing = await Counter.findById("intern");
    if (!existing) {
      const lastRecord = await this.constructor
        .findOne({}, { internId: 1 })
        .sort({ internId: -1 })
        .lean();
      const matched = lastRecord?.internId?.match(/^INT(\d{5})$/);
      const initSeq = matched ? Number(matched[1]) : 0;
      try {
        await Counter.create({ _id: "intern", seq: initSeq });
      } catch (_) {
        // Ignore duplicate-key if another request already created it
      }
    }

    const counter = await Counter.findOneAndUpdate(
      { _id: "intern" },
      { $inc: { seq: 1 } },
      { new: true }
    );

    this.internId = `INT${String(counter.seq).padStart(5, "0")}`;
    return next();
  } catch (error) {
    return next(error);
  }
});

const Intern = mongoose.model("Intern", internSchema);

module.exports = { Intern };
