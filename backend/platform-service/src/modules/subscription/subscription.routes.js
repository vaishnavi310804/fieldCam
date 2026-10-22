import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.js";
import {
  createPlanValidation,
  updatePlanValidation,
  updateSubscriptionStatusValidation,
  assignSubscriptionValidation,
} from "./subscription.validation.js";
import {
  getPlansController,
  getSubscribedCompaniesController,
  getSubscriptionStatsController,
  createPlanController,
  updatePlanController,
  publishPlanController,
  updateSubscriptionStatusController,
  assignSubscriptionController,
} from "./subscription.controller.js";

const router = Router();

// All subscription routes require authentication
router.use(protect);

// GET /api/subscriptions/plans - Read subscription plans (SUPER_ADMIN and ADMIN)
router.get("/plans", authorize("SUPER_ADMIN", "ADMIN"), getPlansController);

// POST /api/subscriptions/assign - Assign subscription to an existing company (SUPER_ADMIN and ADMIN)
router.post(
  "/assign",
  authorize("SUPER_ADMIN", "ADMIN"),
  assignSubscriptionValidation,
  validate,
  assignSubscriptionController
);

// All subsequent management routes require SUPER_ADMIN role
router.use(authorize("SUPER_ADMIN"));

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
