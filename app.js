import express from "express";
import cors from "cors";
import createHttpError, { isHttpError } from "http-errors";
// import sendQuestion from "./Send/sendData.js";
import question from "./routes/Question.js";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// app.use("/api/import", sendQuestion);
app.use("/api", question);

app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"));
});

app.use((error, req, res, next) => {
  let errorMessage = "An unknown error occurred";
  let statusCode = 500;

  if (isHttpError(error)) {
    errorMessage = error.message;
    statusCode = error.status;
  }

  res.status(statusCode).json({ error: errorMessage });
  console.log(error);
});

export default app;
