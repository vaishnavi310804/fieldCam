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
  },
  {
    timestamps: true,
  }
);

companySubscriptionSchema.index({ vendorId: 1 });
companySubscriptionSchema.index({ planId: 1 });
companySubscriptionSchema.index({ status: 1 });

const CompanySubscription =
  mongoose.models.CompanySubscription ||
  mongoose.model("CompanySubscription", companySubscriptionSchema);

export default CompanySubscription;
