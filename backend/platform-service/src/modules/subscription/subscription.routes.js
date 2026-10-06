import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.js";
import {
  createPlanValidation,
  updatePlanValidation,
  updateSubscriptionStatusValidation,
} from "./subscription.validation.js";
import {
  getPlansController,
  getSubscribedCompaniesController,
  getSubscriptionStatsController,
  createPlanController,
  updatePlanController,
  publishPlanController,
  updateSubscriptionStatusController,
} from "./subscription.controller.js";

const router = Router();

// All routes require authentication and SUPER_ADMIN role
router.use(protect);
router.use(authorize("SUPER_ADMIN"));

// GET /api/subscriptions/plans - Read subscription plans
router.get("/plans", getPlansController);

// GET /api/subscriptions/stats - Read subscription overview metrics
router.get("/stats", getSubscriptionStatsController);

// GET /api/subscriptions/subscribed-companies - Read paginated subscribed companies
router.get("/subscribed-companies", getSubscribedCompaniesController);

// POST /api/subscriptions/plans - Create a subscription plan
router.post("/plans", createPlanValidation, validate, createPlanController);

// PUT /api/subscriptions/plans/:id - Update a subscription plan
router.put("/plans/:id", updatePlanValidation, validate, updatePlanController);

// PATCH /api/subscriptions/plans/:id/publish - Publish a draft subscription plan
router.patch("/plans/:id/publish", publishPlanController);

// PATCH /api/subscriptions/:id/status - Update subscription status
router.patch(
  "/:id/status",
  updateSubscriptionStatusValidation,
  validate,
  updateSubscriptionStatusController
);

export default router;
