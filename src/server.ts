import express, { Request, Response, NextFunction } from "express";
import { PostgreSqlContainer } from "@testcontainers/postgresql";

import { getAppDataSource } from "@/data-source";

import { usersRouter } from "./routes/users";
import { healthRouter } from "./routes/health";
import dotenv from "dotenv";

dotenv.config();

const SERVER_PORT = parseInt(process.env.SERVER_PORT as string);

async function startServer() {

  const container = await new PostgreSqlContainer("postgres:18-alpine3.21").start();

  let host = container.getHost();
  let port = container.getPort()
  let username = container.getUsername();
  let password = container.getPassword();
  let database = container.getDatabase();

  let datasource = getAppDataSource(host, port, username, password, database, true);
  datasource = await datasource.initialize();
  
  const app = express();

  app.use(async function (req: Request, res: Response, next: NextFunction) {
    req.app.set("datasource", datasource);
    next();
  });

  app.use("/users", usersRouter);
  app.use("/", healthRouter);

  app
    .listen(SERVER_PORT, "127.0.0.1", () => {
      console.log("Server running at PORT: ", SERVER_PORT);
    })
    .on("error", (error) => {
      throw new Error(error.message);
    })
    .on("close", async (req: Request) => {
      req.app.get("datasource").destroy();
      await datasource.destroy();
      await container.stop();
    });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
