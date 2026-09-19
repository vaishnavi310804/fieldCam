import Vendor from "./vendor.model.js";
import User from "../users/user.model.js";
import mongoose from "mongoose";

/**
 * Creates a new Vendor profile linked to an existing platform VENDOR user.
 * @param {Object} vendorData 
 * @returns {Promise<Object>}
 */
export const createVendor = async (vendorData) => {
  if (!mongoose.Types.ObjectId.isValid(vendorData.userId)) {
    throw new Error("Invalid User ID format");
  }

  // 1. Verify referenced user exists
  const user = await User.findById(vendorData.userId);
  if (!user) {
    throw new Error("Referenced user does not exist");
  }

  // 2. Ensure user has role VENDOR
  if (user.role !== "VENDOR") {
    throw new Error("Referenced user must have VENDOR role");
  }

  // 3. Prevent duplicate vendor records for the same userId
  const existingVendor = await Vendor.findOne({ userId: vendorData.userId });
  if (existingVendor) {
    throw new Error("Vendor profile already exists for this user");
  }

  // Auto-generate initials if not supplied
  if (!vendorData.initials && vendorData.companyName) {
    const words = vendorData.companyName.trim().split(" ");
    if (words.length >= 2) {
      vendorData.initials = (words[0][0] + words[1][0]).toUpperCase();
    } else {
      vendorData.initials = vendorData.companyName.slice(0, 2).toUpperCase();
    }
  }

  const vendor = await Vendor.create(vendorData);
  return vendor;
};

/**
 * Retrieves vendors with optional filters and search functionality.
 * @param {Object} query - { status, search }
 * @returns {Promise<Array>}
 */
export const getVendors = async (query = {}) => {
  const filter = {};

  if (query.status && query.status !== "All") {
    filter.status = query.status;
  }

  if (query.search && query.search.trim()) {
    const searchRegex = new RegExp(query.search.trim(), "i");
    filter.$or = [
      { companyName: searchRegex },
      { contactName: searchRegex },
      { location: searchRegex },
    ];
  }

  const vendors = await Vendor.find(filter)
    .populate("userId", "name email phone role status")
    .sort({ createdAt: -1 });

  return vendors;
};

/**
 * Retrieves a single vendor profile by ID.
 * @param {string} id 
 * @returns {Promise<Object>}
 */
export const getVendorById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid vendor ID format");
  }

  const vendor = await Vendor.findById(id).populate(
    "userId",
    "name email phone role status"
  );

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  return vendor;
};

/**
 * Updates vendor information.
 * @param {string} id 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
export const updateVendor = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid vendor ID format");
  }

  // Do not allow modifying userId directly in vendor profile
  if (updateData.userId) {
    delete updateData.userId;
  }

  const updatedVendor = await Vendor.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("userId", "name email phone role status");

  if (!updatedVendor) {
    throw new Error("Vendor not found");
  }

  return updatedVendor;
};

/**
 * Updates vendor status (Active / Suspended / Inactive).
 * @param {string} id 
 * @param {string} status 
 * @returns {Promise<Object>}
 */
export const updateVendorStatus = async (id, status) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid vendor ID format");
  }

  if (!["Active", "Suspended", "Inactive"].includes(status)) {
    throw new Error("Status must be Active, Suspended, or Inactive");
  }

  const updatedVendor = await Vendor.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate("userId", "name email phone role status");

  if (!updatedVendor) {
    throw new Error("Vendor not found");
  }

  return updatedVendor;
};

/**
 * Calculates Vendor summary stats for the Admin Vendors page.
 * @returns {Promise<Object>}
 */
export const getVendorStats = async () => {
  const [totalVendors, activeVendors, suspendedVendors, inactiveVendors] =
    await Promise.all([
      Vendor.countDocuments({}),
      Vendor.countDocuments({ status: "Active" }),
      Vendor.countDocuments({ status: "Suspended" }),
      Vendor.countDocuments({ status: "Inactive" }),
    ]);

  return {
    totalVendors,
    activeVendors,
    suspendedVendors,
    inactiveVendors,
  };
};
