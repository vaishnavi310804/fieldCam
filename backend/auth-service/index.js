import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./src/config/db.js";
import errorHandler from "./src/middleware/error.middleware.js";
import authRoutes from "./src/modules/auth/auth.routes.js";

const app = express();

await db();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/auth", authRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
