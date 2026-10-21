import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Explicitly load .env from the service directory regardless of the execution working directory
dotenv.config({ path: path.resolve(__dirname, ".env") });

await import("./index.js");
