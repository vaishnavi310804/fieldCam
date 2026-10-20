import mongoose from "mongoose";

const lineItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Line item description is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Line item quantity is required"],
      validate: {
        validator: function (val) {
          return Number.isInteger(val) && val >= 1;
        },
        message: "Quantity must be a positive whole number",
      },
      min: [1, "Quantity must be at least 1"],
    },
    rate: {
      type: Number,
      required: [true, "Line item rate is required"],
      min: [0, "Rate cannot be negative"],
      validate: {
        validator: function (val) {
          if (!Number.isFinite(val) || val < 0) return false;
          const str = String(val);
          const dotIndex = str.indexOf(".");
          return dotIndex === -1 || str.length - dotIndex - 1 <= 2;
        },
        message: "Line item rate cannot have more than 2 decimal places",
      },
    },
    amount: {
      type: Number,
      required: [true, "Line item amount is required"],
      min: [0, "Amount cannot be negative"],
    },
  },
  { _id: true }
);

const reviewHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        "CREATED",
        "DRAFT_SAVED",
        "SUBMITTED",
        "RESUBMITTED",
        "APPROVED",
        "REJECTED",
        "SENT",
        "PAID",
        "STATUS_CHANGED",
      ],
      required: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    actorRole: {
      type: String,
      default: null,
    },
    actorEmail: {
      type: String,
      default: null,
    },
    reason: {
      type: String,
      trim: true,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      required: [true, "Invoice ID is required"],
      unique: true,
      trim: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
    },
    projectTitle: {
      type: String,
      required: [true, "Project title is required"],
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
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    items: {
      type: [lineItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      min: [0, "Subtotal cannot be negative"],
      default: 0,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    tax: {
      type: Number,
      required: [true, "Tax is required"],
      min: [0, "Tax cannot be negative"],
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    status: {
      type: String,
      enum: {
        values: [
          "Draft",
          "Submitted",
          "Pending",
          "Approved",
          "Sent",
          "Paid",
          "Rejected",
        ],
        message: "{VALUE} is not a valid invoice status",
      },
      default: "Draft",
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    sentTo: {
      type: String,
      trim: true,
      default: null,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: null,
    },
    paymentNotes: {
      type: String,
      trim: true,
      default: null,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewHistory: {
      type: [reviewHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
invoiceSchema.index({ projectId: 1 }, { unique: true });
invoiceSchema.index({ vendorId: 1 });
invoiceSchema.index({ companyId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ paymentDate: 1 });
invoiceSchema.index({ createdAt: -1 });

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

export default Invoice;
