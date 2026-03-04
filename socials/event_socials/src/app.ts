import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { errorHandler } from "./middlewares/error.middleware";
import { httpLogger } from "./middlewares/httpLogger.middleware";

/**
 * Express Application Instance.
 * 
 * Configures middleware, routes, and error handling.
 */
const app = express();

// app-level middleware config
app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// router imports
import whatsappRouter from "./whatsapp/route"


app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Event Socials is up and running!",
    })
})
app.get("/healthcheck", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Event Socials is up and running!",
    })
})


// url mappings
app.use("/whatsapp", whatsappRouter)


// global error handler
app.use(errorHandler);


export default app;