import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import Role, { FULL_ADMIN_PERMISSIONS } from "../modules/roles/role.model.js";
import User from "../modules/users/user.model.js";

export const FULL_ADMIN_ROLE_NAME = "FULL_ADMIN";
export const FULL_ADMIN_ROLE_DESCRIPTION =
  "System role granting full access to all FieldCam business modules (excluding platform user management and role administration)";

export async function seedFullAdminRole({ dryRun = false } = {}) {
  try {
    // 1. Lookup or create FULL_ADMIN system role
    let fullAdminRole = await Role.findOne({ name: FULL_ADMIN_ROLE_NAME });
    let roleCreated = false;
    let roleSynchronized = false;

    if (!fullAdminRole) {
      if (dryRun) {
        console.log(`[DRY RUN] Would create system role '${FULL_ADMIN_ROLE_NAME}'`);
        fullAdminRole = {
          _id: new mongoose.Types.ObjectId(),
          name: FULL_ADMIN_ROLE_NAME,
          description: FULL_ADMIN_ROLE_DESCRIPTION,
          isSystem: true,
          permissions: FULL_ADMIN_PERMISSIONS,
        };
        roleCreated = true;
      } else {
        try {
          fullAdminRole = await Role.create({
            name: FULL_ADMIN_ROLE_NAME,
            description: FULL_ADMIN_ROLE_DESCRIPTION,
            isSystem: true,
            permissions: FULL_ADMIN_PERMISSIONS,
            createdBy: null,
          });
          roleCreated = true;
          console.log(
            `[SEED] Created '${FULL_ADMIN_ROLE_NAME}' system role (ID: ${fullAdminRole._id.toString()})`
          );
        } catch (createErr) {
          // Handle concurrent execution race where another process created the role
          if (createErr.code === 11000) {
            fullAdminRole = await Role.findOne({ name: FULL_ADMIN_ROLE_NAME });
            if (!fullAdminRole) {
              throw createErr;
            }
          } else {
            throw createErr;
          }
        }
      }
    } else {
      // Role exists: synchronize permissions and system flag if needed
      const needsUpdate =
        !fullAdminRole.isSystem ||
        JSON.stringify(fullAdminRole.permissions) !== JSON.stringify(FULL_ADMIN_PERMISSIONS);

      if (needsUpdate) {
        if (dryRun) {
          console.log(`[DRY RUN] Would synchronize permissions for '${FULL_ADMIN_ROLE_NAME}'`);
          roleSynchronized = true;
        } else {
          fullAdminRole.isSystem = true;
          fullAdminRole.description = FULL_ADMIN_ROLE_DESCRIPTION;
          fullAdminRole.permissions = FULL_ADMIN_PERMISSIONS;
          await fullAdminRole.save();
          roleSynchronized = true;
          console.log(
            `[SEED] Synchronized permissions for existing '${FULL_ADMIN_ROLE_NAME}' system role (ID: ${fullAdminRole._id.toString()})`
          );
        }
      } else {
        console.log(
          `[SEED] '${FULL_ADMIN_ROLE_NAME}' system role is already up to date (ID: ${fullAdminRole._id.toString()})`
        );
      }
    }

    // 2. Query for existing unassigned ADMIN users
    const unassignedAdminFilter = {
      role: "ADMIN",
      $or: [{ roleId: null }, { roleId: { $exists: false } }],
    };

    let matchedCount = 0;
    let modifiedCount = 0;

    if (dryRun) {
      matchedCount = await User.countDocuments(unassignedAdminFilter);
      modifiedCount = 0;
      console.log(
        `[DRY RUN] Found ${matchedCount} ADMIN user(s) with missing or null roleId eligible for migration.`
      );
    } else {
      const updateResult = await User.updateMany(unassignedAdminFilter, {
        $set: { roleId: fullAdminRole._id },
      });

      matchedCount = updateResult.matchedCount ?? updateResult.n ?? 0;
      modifiedCount = updateResult.modifiedCount ?? updateResult.nModified ?? 0;

      console.log(
        `[MIGRATION] Matched ${matchedCount} unassigned ADMIN user(s); successfully updated ${modifiedCount} account(s) with roleId: ${fullAdminRole._id.toString()}`
      );
    }

    return {
      success: true,
      roleId: fullAdminRole._id.toString(),
      roleName: fullAdminRole.name,
      roleCreated,
      roleSynchronized,
      matchedAdmins: matchedCount,
      modifiedAdmins: modifiedCount,
      dryRun,
    };
  } catch (error) {
    console.error(
      "[SEED ERROR] Failed to seed FULL_ADMIN role or migrate admin accounts:",
      error.message || error
    );
    throw error;
  }
}

// Direct CLI execution guard
const isDirectExecution = () => {
  if (!process.argv[1]) return false;
  try {
    const currentFilePath = fileURLToPath(import.meta.url);
    return path.resolve(currentFilePath) === path.resolve(process.argv[1]);
  } catch {
    return false;
  }
};

if (isDirectExecution()) {
  const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env");
  dotenv.config({ path: envPath });

  const isDryRun = process.argv.includes("--dry-run");

  const runCli = async () => {
    if (!process.env.DATABASE_URL) {
      console.error("[SEED ERROR] DATABASE_URL is not set in environment.");
      process.exit(1);
    }

    try {
      console.log("[SEED] Connecting to database...");
      await mongoose.connect(process.env.DATABASE_URL);
      console.log("[SEED] Database connected successfully.");

      const result = await seedFullAdminRole({ dryRun: isDryRun });
      console.log("[SEED] Execution completed successfully:", JSON.stringify(result, null, 2));

      await mongoose.connection.close();
      process.exit(0);
    } catch (err) {
      console.error("[SEED FATAL] Script terminated with error.");
      try {
        await mongoose.connection.close();
      } catch {
        // Non-blocking cleanup
      }
      process.exit(1);
    }
  };

  runCli();
}
