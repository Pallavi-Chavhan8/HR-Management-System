const app = require("./app.js");
const { connectDB } = require("./config/db.js");
const { env } = require("./config/env.js");

const listenWithFallback = (application, initialPort, maxAttempts = 10) =>
  new Promise((resolve, reject) => {
    const tryListen = (port, attemptsLeft) => {
      const server = application.listen(port, () => {
        resolve({ server, port });
      });

      server.on("error", (error) => {
        if (error.code === "EADDRINUSE" && attemptsLeft > 0) {
          tryListen(port + 1, attemptsLeft - 1);
          return;
        }

        reject(error);
      });
    };

    tryListen(initialPort, maxAttempts);
  });

const startServer = async () => {
  await connectDB();

  const { port } = await listenWithFallback(app, env.PORT);
  console.log(`Backend running on port ${port}`);
};

startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
