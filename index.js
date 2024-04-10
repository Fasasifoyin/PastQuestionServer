import app from "./app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => app.listen(6060, () => console.log("App connected")))
  .catch((error) => console.log(error));
