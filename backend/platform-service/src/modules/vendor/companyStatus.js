import mongoose from "mongoose";
import Vendor from "./vendor.model.js";

/**
 * Validates company status for an authenticated user.
 * Blocks access if the user's company is SUSPENDED.
 *
 * @param {Object} user - User document or identity object
 * @returns {Promise<{ isExempt: boolean, company: Object|null }>}
 */
export const checkUserAndCompanyStatus = async (user) => {
  if (!user) {
    const error = new Error("User account not found");
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== "ACTIVE") {
    const error = new Error("Account is not active. Please contact administrator");
    error.statusCode = 403;
    error.code = "ACCOUNT_INACTIVE";
    throw error;
  }

  // SUPER_ADMIN and ADMIN are system/platform roles and are not tied to any company
  if (["SUPER_ADMIN", "ADMIN"].includes(user.role)) {
    return { isExempt: true, company: null };
  }

  if (user.role === "VENDOR") {
    const query = [{ userId: user._id || user.id }];
    const companyId = user.companyId?._id || user.companyId;
    if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
      query.push({ _id: companyId });
    }

    const company = await Vendor.findOne({ $or: query });

    if (!company) {
      const error = new Error("Vendor company profile not found. Access denied.");
      error.statusCode = 403;
      error.code = "COMPANY_NOT_FOUND";
      throw error;
    }

    if (company.status && company.status.toUpperCase() === "SUSPENDED") {
      const error = new Error("Your company has been suspended. Please contact administrator.");
      error.statusCode = 403;
      error.code = "COMPANY_SUSPENDED";
      throw error;
    }

    return { isExempt: false, company };
  }

  if (user.role === "STAFF") {
    const companyId = user.companyId?._id || user.companyId;
    if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
      const company = await Vendor.findOne({
        $or: [{ _id: companyId }, { userId: companyId }],
      });

      if (!company) {
        const error = new Error("Assigned company profile not found. Access denied.");
        error.statusCode = 403;
        error.code = "COMPANY_NOT_FOUND";
        throw error;
      }

      if (company.status && company.status.toUpperCase() === "SUSPENDED") {
        const error = new Error("Your company has been suspended. Please contact administrator.");
        error.statusCode = 403;
        error.code = "COMPANY_SUSPENDED";
        throw error;
      }

      return { isExempt: false, company };
    }

    // Preserve existing behavior for users without a company where permitted
    return { isExempt: false, company: null };
  }

  return { isExempt: false, company: null };
};
