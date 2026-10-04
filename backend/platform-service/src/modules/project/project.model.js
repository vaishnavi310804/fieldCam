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

const aiValidationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["PASSED", "FAILED", "PENDING"],
      default: "PENDING",
    },
    clarity: {
      passed: { type: Boolean },
      score: { type: Number },
    },
    lighting: {
      passed: { type: Boolean },
      score: { type: Number },
    },
    subject: {
      passed: { type: Boolean },
      confidence: { type: Number },
      expectedCategory: { type: String, trim: true },
      detectedDescription: { type: String, trim: true },
      reason: { type: String, trim: true },
    },
    reason: {
      type: String,
      trim: true,
    },
    validatedAt: {
      type: Date,
    },
  },
  { _id: false }
);

const photoSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
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
    checklistItemId: {
      type: String,
      trim: true,
    },
    capturedAt: {
      type: Date,
    },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      accuracy: { type: Number },
    },
    filename: {
      type: String,
      trim: true,
    },
    mimeType: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
    },
    dimensions: {
      width: { type: Number },
      height: { type: Number },
    },
    aiValidation: {
      type: aiValidationSchema,
      default: () => ({ status: "PENDING" }),
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }
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

const noteSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    text: {
      type: String,
      required: [true, "Note text is required"],
      trim: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    authorName: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
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

    locationCoordinates: {
      latitude: {
        type: Number,
        min: [-90, "Latitude must be between -90 and 90"],
        max: [90, "Latitude must be between -90 and 90"],
      },
      longitude: {
        type: Number,
        min: [-180, "Longitude must be between -180 and 180"],
        max: [180, "Longitude must be between -180 and 180"],
      },
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

    notes: {
      type: [noteSchema],
      default: [],
    },

    status: {
      type: String,
      enum: {
        values: [
          "New",
          "ASSIGNED",
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

    reviewComments: {
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
