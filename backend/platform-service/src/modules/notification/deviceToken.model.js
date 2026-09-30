import mongoose from "mongoose";

const deviceTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    deviceToken: {
      type: String,
      required: [true, "Device token is required"],
      trim: true,
      unique: true,
      index: true,
    },
    platform: {
      type: String,
      required: [true, "Platform is required"],
      enum: {
        values: ["android", "ios"],
        message: "{VALUE} is not a valid platform",
      },
      default: "android",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to optimize fetching active device tokens for a user
deviceTokenSchema.index({ userId: 1, isActive: 1 });

const DeviceToken = mongoose.model("DeviceToken", deviceTokenSchema);

export default DeviceToken;
