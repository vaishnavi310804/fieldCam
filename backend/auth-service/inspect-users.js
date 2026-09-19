import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/modules/auth/auth.model.js";

dotenv.config();

async function inspectUsers() {
  await mongoose.connect(process.env.DATABASE_URL);
  const users = await User.find({}, "name email role status isVerified createdAt");
  console.log("Existing Users in DB:");
  users.forEach((u) => console.log(JSON.stringify(u)));
  await mongoose.disconnect();
}

inspectUsers().catch(console.error);
