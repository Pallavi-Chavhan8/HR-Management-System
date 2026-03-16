const mongoose = require("mongoose");

const { env } = require("../config/env.js");
const { Employee } = require("../models/Employee.js");
const { Intern } = require("../models/Intern.js");
const { Trainee } = require("../models/Trainee.js");

const buildId = (prefix, sequence) => `${prefix}${String(sequence).padStart(5, "0")}`;

const migrateCollection = async ({ Model, idField, prefix, dryRun }) => {
  const documents = await Model.find({}, { _id: 1, [idField]: 1, createdAt: 1 })
    .sort({ createdAt: 1, _id: 1 })
    .lean();

  if (documents.length === 0) {
    console.log(`[${Model.modelName}] No records found. Skipping.`);
    return;
  }

  const tempUpdates = [];
  const finalUpdates = [];

  documents.forEach((doc, index) => {
    const sequence = index + 1;
    const nextId = buildId(prefix, sequence);
    const tempId = `TMP-${prefix}-${String(sequence).padStart(5, "0")}`;

    if (doc[idField] !== nextId) {
      tempUpdates.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { [idField]: tempId } },
        },
      });

      finalUpdates.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { [idField]: nextId } },
        },
      });
    }
  });

  if (tempUpdates.length === 0) {
    console.log(`[${Model.modelName}] All ${documents.length} records already match ${prefix}##### format.`);
    return;
  }

  console.log(
    `[${Model.modelName}] ${tempUpdates.length}/${documents.length} records will be updated to sequential ${prefix}##### IDs.`
  );

  if (dryRun) {
    return;
  }

  // Phase 1: move changed records to temporary IDs to avoid unique key collisions.
  await Model.bulkWrite(tempUpdates, { ordered: true });

  // Phase 2: set final sequential IDs.
  await Model.bulkWrite(finalUpdates, { ordered: true });

  console.log(`[${Model.modelName}] Migration completed.`);
};

const run = async () => {
  if (!env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  const dryRun = process.argv.includes("--dry-run");

  await mongoose.connect(env.MONGO_URI);
  console.log(`Connected to MongoDB${dryRun ? " (dry run)" : ""}.`);

  await migrateCollection({ Model: Employee, idField: "employeeId", prefix: "EMP", dryRun });
  await migrateCollection({ Model: Intern, idField: "internId", prefix: "INT", dryRun });
  await migrateCollection({ Model: Trainee, idField: "traineeId", prefix: "TRN", dryRun });

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
};

run().catch(async (error) => {
  console.error("Serial ID migration failed:", error);

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  process.exit(1);
});
