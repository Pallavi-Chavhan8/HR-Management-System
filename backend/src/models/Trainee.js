const mongoose = require("mongoose");
const { Counter } = require("./Counter");

const traineeSchema = new mongoose.Schema(
  {
    traineeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: "TRN00000"
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

traineeSchema.index({ name: "text", email: "text", department: "text", course: "text" });

traineeSchema.pre("save", async function generateTraineeId(next) {
  if (!this.isNew) return next();
  if (this.traineeId && this.traineeId !== "TRN00000") return next();

  try {
    // Seed counter from existing records on first use
    const existing = await Counter.findById("trainee");
    if (!existing) {
      const lastRecord = await this.constructor
        .findOne({}, { traineeId: 1 })
        .sort({ traineeId: -1 })
        .lean();
      const matched = lastRecord?.traineeId?.match(/^TRN(\d{5})$/);
      const initSeq = matched ? Number(matched[1]) : 0;
      try {
        await Counter.create({ _id: "trainee", seq: initSeq });
      } catch (_) {
        // Ignore duplicate-key if another request already created it
      }
    }

    const counter = await Counter.findOneAndUpdate(
      { _id: "trainee" },
      { $inc: { seq: 1 } },
      { new: true }
    );

    this.traineeId = `TRN${String(counter.seq).padStart(5, "0")}`;
    return next();
  } catch (error) {
    return next(error);
  }
});

const Trainee = mongoose.model("Trainee", traineeSchema);

module.exports = { Trainee };
