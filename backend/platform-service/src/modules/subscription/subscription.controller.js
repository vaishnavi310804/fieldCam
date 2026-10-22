import {
  getSubscriptionPlans,
  getSubscribedCompanies,
  getSubscriptionStats,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  publishSubscriptionPlan,
  updateCompanySubscriptionStatus,
  assignSubscriptionToCompany,
} from "./subscription.service.js";

export const getPlansController = async (req, res, next) => {
  try {
    const plans = await getSubscriptionPlans(req.query.status);
    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscribedCompaniesController = async (req, res, next) => {
  try {
    const result = await getSubscribedCompanies({
      search: req.query.search,
      status: req.query.status,
      planId: req.query.planId,
      page: req.query.page,
      limit: req.query.limit,
    });
    res.status(200).json({
      success: true,
      data: result.subscriptions,
      pagination: {
        totalRecords: result.totalRecords,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        pageSize: result.pageSize,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionStatsController = async (req, res, next) => {
  try {
    const stats = await getSubscriptionStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const createPlanController = async (req, res, next) => {
  try {
    const plan = await createSubscriptionPlan(req.body, req.user);
    res.status(201).json({
      success: true,
      data: plan,
      message: "Subscription plan created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlanController = async (req, res, next) => {
  try {
    const plan = await updateSubscriptionPlan(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      data: plan,
      message: "Subscription plan updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const publishPlanController = async (req, res, next) => {
  try {
    const plan = await publishSubscriptionPlan(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: plan,
      message: "Subscription plan published successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubscriptionStatusController = async (req, res, next) => {
  try {
    const subscription = await updateCompanySubscriptionStatus(
      req.params.id,
      req.body.status,
      req.user
    );
    res.status(200).json({
      success: true,
      data: subscription,
      message: "Subscription status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const assignSubscriptionController = async (req, res, next) => {
  try {
    const subscription = await assignSubscriptionToCompany(
      {
        vendorId: req.body.vendorId,
        planId: req.body.planId,
        startDate: req.body.startDate,
        durationMonths: req.body.durationMonths,
        status: req.body.status,
      },
      req.user
    );
    res.status(201).json({
      success: true,
      data: subscription,
      message: "Subscription assigned to company successfully",
    });
  } catch (error) {
    next(error);
  }
};
