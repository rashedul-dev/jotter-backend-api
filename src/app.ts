import dotenv from 'dotenv';
dotenv.config();
import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import path from "path";
import router from "./app/routes"; // COMMENT THIS OUT FIRST
import { errorHandler, notFound } from "./app/middlewares/error.middleware"; // COMMENT THIS OUT TOO

const app: Application = express();

// Parsers
app.use(express.json());
app.use(cors());

// Static files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Application routes
app.use("/api/v1", router); // COMMENTED OUT

app.get("/", (req: Request, res: Response) => {
  res.send("Jotter API is running");
});

app.use(notFound); // COMMENTED OUT
app.use(errorHandler); // COMMENTED OUT

export default app;
