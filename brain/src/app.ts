import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { appConfig } from "./config/envConfig";
import { errorHandler } from "./middlewares/error.middleware";
import { httpLogger } from "./middlewares/httpLogger.middleware";

/**
 * Express Application Instance.
 * 
 * Configures middleware, routes, and error handling.
 */
const app = express();

// app-level middleware config
app.use(cors({
    origin: appConfig.corsOrigin,
    credentials: appConfig.corsCredentials,
}));
app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// router imports
import healthCheckRouter from "./routes/healthcheck.routes"
import todoRouter from "./productivity/todo/router"

// url mapping
app.use("/healthcheck", healthCheckRouter)
app.use("/api/productivity/todo", todoRouter)


// global error handler
app.use(errorHandler);


export default app;