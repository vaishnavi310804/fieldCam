import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.js";
import {
  sendMessageValidation,
  conversationIdParamValidation,
} from "./chat.validation.js";
import {
  getVendorConversationController,
  sendVendorMessageController,
  getAdminConversationsController,
  getAdminConversationMessagesController,
  sendAdminMessageController,
} from "./chat.controller.js";

const router = Router();

// Strictly protect all chat routes with authentication
router.use(protect);

// -------------------------------------------------------------
// Vendor Live Chat Endpoints (Strictly VENDOR role)
// -------------------------------------------------------------

// GET /api/chat/vendor/conversation - Read vendor's existing conversation & messages
router.get(
  "/vendor/conversation",
  authorize("VENDOR"),
  getVendorConversationController
);

// POST /api/chat/vendor/messages - Send vendor message & safely create conversation on first message
router.post(
  "/vendor/messages",
  authorize("VENDOR"),
  sendMessageValidation,
  validate,
  sendVendorMessageController
);

// -------------------------------------------------------------
// Admin Live Chat Endpoints (Strictly ADMIN role)
// -------------------------------------------------------------

// GET /api/chat/admin/conversations - List all vendor conversations
router.get(
  "/admin/conversations",
  authorize("ADMIN"),
  getAdminConversationsController
);

// GET /api/chat/admin/conversations/:id/messages - Read messages for a specific conversation
router.get(
  "/admin/conversations/:id/messages",
  authorize("ADMIN"),
  conversationIdParamValidation,
  validate,
  getAdminConversationMessagesController
);

// POST /api/chat/admin/conversations/:id/messages - Send Admin reply to a specific conversation
router.post(
  "/admin/conversations/:id/messages",
  authorize("ADMIN"),
  conversationIdParamValidation,
  sendMessageValidation,
  validate,
  sendAdminMessageController
);

export default router;
