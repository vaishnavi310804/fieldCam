import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Checklist item ID is required"],
    },
    label: {
      type: String,
      required: [true, "Checklist item label is required"],
      trim: true,
    },
    checked: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const photoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Photo URL is required"],
    },
    caption: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Attachment URL is required"],
    },
    filename: {
      type: String,
      required: [true, "Attachment filename is required"],
      trim: true,
    },
    size: {
      type: Number,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: [true, "Project ID is required"],
      unique: true,
      trim: true,
    },

    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },

    client: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service ID is required"],
    },

    serviceTypeName: {
      type: String,
      required: [true, "Service type name is required"],
      trim: true,
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },

    vendorName: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    deadline: {
      type: Date,
      required: [true, "Deadline date is required"],
    },

    description: {
      type: String,
      trim: true,
    },

    checklistItems: {
      type: [checklistItemSchema],
      default: [],
    },

    photos: {
      type: [photoSchema],
      default: [],
    },

    attachments: {
      type: [attachmentSchema],
      default: [],
    },

    status: {
      type: String,
      enum: {
        values: [
          "New",
          "In Progress",
          "Submitted",
          "Under Review",
          "Approved",
          "Rejected",
        ],
        message: "{VALUE} is not a valid project status",
      },
      default: "New",
    },

    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
projectSchema.index({ status: 1 });
projectSchema.index({ vendorId: 1 });
projectSchema.index({ serviceId: 1 });
projectSchema.index({ deadline: 1 });
projectSchema.index({ createdAt: -1 });

const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);

export default Project;
