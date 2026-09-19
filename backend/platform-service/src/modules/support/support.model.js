import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: [true, "Ticket ID is required"],
      unique: true,
      trim: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor ID is required"],
    },
    vendorName: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
    },
    initials: {
      type: String,
      trim: true,
    },
    avatarBg: {
      type: String,
      default: "#C87A65",
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: {
        values: ["Low", "Medium", "High", "Urgent"],
        message: "{VALUE} is not a valid priority",
      },
      default: "Medium",
    },
    status: {
      type: String,
      enum: {
        values: ["Open", "In Progress", "Resolved", "Closed"],
        message: "{VALUE} is not a valid ticket status",
      },
      default: "Open",
    },
    lastUpdate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
supportSchema.index({ status: 1 });
supportSchema.index({ priority: 1 });
supportSchema.index({ vendorId: 1 });
supportSchema.index({ createdAt: -1 });

const Support = mongoose.models.Support || mongoose.model("Support", supportSchema);

export default Support;
