import express from "express";
import cors from "cors";
import db from "./src/config/db.js";
import errorHandler from "./src/middleware/error.middleware.js";
import serviceRoutes from "./src/modules/service/service.routes.js";
import vendorRoutes from "./src/modules/vendor/vendor.routes.js";
import projectRoutes from "./src/modules/project/project.routes.js";
import invoiceRoutes from "./src/modules/invoice/invoice.routes.js";
import supportRoutes from "./src/modules/support/support.routes.js";

const app = express();

await db();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running");
});

// Module Routes
app.use("/api/services", serviceRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/support", supportRoutes);

// Global Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
