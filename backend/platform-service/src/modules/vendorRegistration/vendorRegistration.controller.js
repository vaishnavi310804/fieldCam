import {
  createRegistrationRequest,
  getRegistrationRequests,
  getRegistrationRequestById,
  approveRegistrationRequest,
  rejectRegistrationRequest,
} from "./vendorRegistration.service.js";

/**
 * Public controller: Submit a vendor registration request.
 */
export const submitRegistrationController = async (req, res) => {
  try {
    const result = await createRegistrationRequest(req.body);

    return res.status(201).json({
      success: true,
      message:
        "Vendor registration request submitted successfully. It is now awaiting administrator review.",
      data: {
        _id: result._id,
        contactName: result.contactName,
        companyName: result.companyName,
        email: result.email,
        phone: result.phone,
        location: result.location,
        services: result.services,
        description: result.description,
        status: result.status,
        createdAt: result.createdAt,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to submit registration request",
    });
  }
};

/**
 * Admin controller: List vendor registration requests.
 */
export const getRegistrationsController = async (req, res) => {
  try {
    const result = await getRegistrationRequests(req.query);

    return res.status(200).json({
      success: true,
      count: result.requests.length,
      totalRecords: result.totalRecords,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      pageSize: result.pageSize,
      data: result.requests,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch registration requests",
    });
  }
};

/**
 * Admin controller: Get a single vendor registration request.
 */
export const getRegistrationByIdController = async (req, res) => {
  try {
    const result = await getRegistrationRequestById(req.params.id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Registration request not found",
    });
  }
};

/**
 * Admin controller: Approve a pending vendor registration request.
 */
export const approveRegistrationController = async (req, res) => {
  try {
    const result = await approveRegistrationRequest(
      req.params.id,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.request,
      vendor: result.vendor,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to approve registration request",
    });
  }
};

/**
 * Admin controller: Reject a pending vendor registration request.
 */
export const rejectRegistrationController = async (req, res) => {
  try {
    const result = await rejectRegistrationRequest(
      req.params.id,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.request,
      emailOutcome: result.emailOutcome,
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to reject registration request",
    });
  }
};
