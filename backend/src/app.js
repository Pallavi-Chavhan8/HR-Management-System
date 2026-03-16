const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const { env } = require("./config/env.js");
const apiRoutes = require("./routes/index.js");
const departmentRoutes = require("./routes/departmentRoutes.js");
const { errorHandler } = require("./middleware/error.middleware.js");
const { notFoundHandler } = require("./middleware/notFound.middleware.js");

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "hrms-backend" });
});

app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
