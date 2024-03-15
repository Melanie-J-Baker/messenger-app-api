const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/userController");
const conversation_controller = require("../controllers/conversationController");
const message_controller = require("../controllers/messageController");

// USER ROUTES
router.get("/", user_controller.index);
router.get("/users", user_controller.user_list);
router.get("/users/:id", user_controller.user_detail);
router.post("/users/:id", user_controller.user_create_post);
router.delete("/users/:id", user_controller.user_delete);
router.put("users/:id", user_controller.user_update_put);

// MESSAGE ROUTES
router.get("/messages", message_controller.message_list);
router.get("/messages/:id", message_controller.message_detail);
router.post("/messages/:id", message_controller.message_create_post);
router.delete("/messages/:id", message_controller.message_delete);
router.put("messages/:id", message_controller.message_update_put);

// CONVERSATION ROUTES
router.get("/conversations", conversation_controller.conversation_list);
router.get("/conversations/:id", conversation_controller.conversation_detail);
router.post(
  "/conversations/:id",
  conversation_controller.conversation_create_post
);
router.delete(
  "/conversations/:id",
  conversation_controller.conversation_delete
);
router.put(
  "conversations/:id",
  conversation_controller.conversation_update_put
);

module.exports = router;
