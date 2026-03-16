const mongoose = require("mongoose");

/**
 * Counter model – stores the current auto-increment sequence for each entity.
 * _id  : string key, e.g. "employee" | "intern" | "trainee"
 * seq  : current sequence value (incremented before use)
 */
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model("Counter", counterSchema);

module.exports = { Counter };
