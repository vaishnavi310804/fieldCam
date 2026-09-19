import mongoose from "mongoose";

const photoChecklistRequirementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Checklist item title is required"],
      trim: true,
    },
    requirementType: {
      type: String,
      enum: {
        values: ["REQUIRED", "OPTIONAL"],
        message: "{VALUE} is not a valid requirement type",
      },
      default: "REQUIRED",
    },
    photoType: {
      type: String,
      enum: {
        values: ["WIDE ANGLE", "CLOSE UP", "HIGH DETAIL", "GENERAL"],
        message: "{VALUE} is not a valid photo type",
      },
      default: "GENERAL",
    },
  },
  { _id: false }
);

const serviceSchema = new mongoose.Schema(
  {
    serviceCategory: {
      type: String,
      required: [true, "Service category is required"],
      enum: {
        values: [
          "Maintenance",
          "Inspection",
          "Survey",
          "Mapping",
          "Documentation",
        ],
        message: "{VALUE} is not a valid service category",
      },
    },

    serviceTypeName: {
      type: String,
      required: [true, "Service type name is required"],
      unique: true,
      trim: true,
    },

    defaultPrice: {
      type: Number,
      required: [true, "Default price is required"],
      min: [0, "Default price must be a non-negative number"],
    },

    photoChecklistRequirements: {
      type: [photoChecklistRequirementSchema],
      default: [],
    },

    serviceLogic: {
      type: String,
      trim: true,
    },

    requireSignature: {
      type: Boolean,
      default: true,
    },

    autoApprove: {
      type: Boolean,
      default: false,
    },

    notifyClient: {
      type: Boolean,
      default: true,
    },

    processingMode: {
      type: String,
      enum: {
        values: ["AUTOMATIC", "MANUAL"],
        message: "{VALUE} is not a valid processing mode",
      },
      default: "AUTOMATIC",
    },

    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "INACTIVE"],
        message: "{VALUE} is not a valid status",
      },
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ serviceCategory: 1 });

const Service = mongoose.models.Service || mongoose.model("Service", serviceSchema);

export default Service;
