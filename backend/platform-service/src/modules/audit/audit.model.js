import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Actor ID is required"],
      index: true,
    },
    actorEmail: {
      type: String,
      required: [true, "Actor email is required"],
      trim: true,
      lowercase: true,
    },
    actorRole: {
      type: String,
      required: [true, "Actor role is required"],
    },
    action: {
      type: String,
      required: [true, "Action event type is required"],
      enum: [
        "PROJECT_CREATED",
        "PROJECT_UPDATED",
        "PROJECT_STATUS_CHANGED",
        "PROJECT_SUBMITTED",
        "PHOTO_UPLOADED",
        "PHOTO_VALIDATED",
        "PHOTO_DELETED",
        "VENDOR_CREATED",
        "VENDOR_UPDATED",
        "VENDOR_STATUS_CHANGED",
        "SERVICE_CREATED",
        "SERVICE_UPDATED",
        "SERVICE_STATUS_CHANGED",
        "INVOICE_CREATED",
        "INVOICE_UPDATED",
        "INVOICE_STATUS_CHANGED",
        "SUPPORT_TICKET_CREATED",
        "SUPPORT_TICKET_UPDATED",
        "SUPPORT_TICKET_STATUS_CHANGED",
      ],
      index: true,
    },
    entityType: {
      type: String,
      required: [true, "Entity type is required"],
      enum: ["Project", "Vendor", "Service", "Invoice", "Support"],
    },
    entityId: {
      type: String,
      required: [true, "Entity ID is required"],
    },
    description: {
      type: String,
      required: [true, "Audit log description is required"],
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ actorId: 1, createdAt: -1 });

const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
