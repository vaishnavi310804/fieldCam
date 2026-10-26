import mongoose from "mongoose";

export const PERMISSION_MODULES = Object.freeze({
  DASHBOARD: "DASHBOARD",
  PROJECTS: "PROJECTS",
  VENDORS: "VENDORS",
  INVOICES: "INVOICES",
  ANALYTICS: "ANALYTICS",
  SERVICES: "SERVICES",
  SUPPORT: "SUPPORT",
});

export const MODULE_ACTIONS = Object.freeze({
  DASHBOARD: Object.freeze(["VIEW"]),
  PROJECTS: Object.freeze(["VIEW", "CREATE", "EDIT", "ASSIGN", "REVIEW", "EXPORT"]),
  VENDORS: Object.freeze(["VIEW", "CREATE", "EDIT", "STATUS", "REGISTRATIONS_REVIEW"]),
  INVOICES: Object.freeze(["VIEW", "CREATE", "EDIT", "REVIEW", "SEND", "RECORD_PAYMENT"]),
  ANALYTICS: Object.freeze(["VIEW"]),
  SERVICES: Object.freeze(["VIEW", "CREATE", "EDIT", "STATUS"]),
  SUPPORT: Object.freeze(["VIEW", "CREATE", "EDIT", "STATUS", "CHAT"]),
});

export const FULL_ADMIN_PERMISSIONS = Object.freeze([
  { module: PERMISSION_MODULES.DASHBOARD, actions: [...MODULE_ACTIONS.DASHBOARD] },
  { module: PERMISSION_MODULES.PROJECTS, actions: [...MODULE_ACTIONS.PROJECTS] },
  { module: PERMISSION_MODULES.VENDORS, actions: [...MODULE_ACTIONS.VENDORS] },
  { module: PERMISSION_MODULES.INVOICES, actions: [...MODULE_ACTIONS.INVOICES] },
  { module: PERMISSION_MODULES.ANALYTICS, actions: [...MODULE_ACTIONS.ANALYTICS] },
  { module: PERMISSION_MODULES.SERVICES, actions: [...MODULE_ACTIONS.SERVICES] },
  { module: PERMISSION_MODULES.SUPPORT, actions: [...MODULE_ACTIONS.SUPPORT] },
]);

const permissionSubSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: [true, "Permission module is required"],
      trim: true,
      uppercase: true,
      enum: {
        values: Object.values(PERMISSION_MODULES),
        message: "{VALUE} is not a valid permission module",
      },
    },
    actions: {
      type: [String],
      required: [true, "Permission actions array is required"],
      default: [],
    },
  },
  { _id: false }
);

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Role name must be at least 2 characters"],
      maxlength: [50, "Role name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    isSystem: {
      type: Boolean,
      default: false,
      index: true,
    },
    permissions: {
      type: [permissionSubSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

roleSchema.index({ name: 1 }, { unique: true });

const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);

export default Role;
