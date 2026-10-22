import mongoose from "mongoose";

const companySubscriptionSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor ID is required"],
      unique: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: [true, "Plan ID is required"],
    },
    status: {
      type: String,
      enum: ["Active", "Past Due", "Cancelled", "Trial"],
      default: "Active",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    renewalDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    durationMonths: {
      type: Number,
      default: 1,
      min: [1, "Duration must be at least 1 month"],
    },
    expiryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

companySubscriptionSchema.index({ planId: 1 });
companySubscriptionSchema.index({ status: 1 });

const CompanySubscription =
  mongoose.models.CompanySubscription ||
  mongoose.model("CompanySubscription", companySubscriptionSchema);

export default CompanySubscription;
