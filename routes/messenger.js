const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/userController");
const conversation_controller = require("../controllers/conversationController");
const message_controller = require("../controllers/messageController");
const passport = require("passport");

// USER ROUTES

// Get index (counts of users, conversations and messages)
router.get("/", user_controller.index);

// Get all users
router.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  user_controller.user_list
);

// GET one user
router.get(
  "/users/:id",
  passport.authenticate("jwt", { session: false }),
  user_controller.user_detail
);

// POST route to signup user
router.post("/users/signup", user_controller.user_create_post);

//POST route to login user
router.post("/users/login", user_controller.user_login_post);

// DELETE route to delete user
router.delete(
  "/users/:id",
  passport.authenticate("jwt", { session: false }),
  user_controller.user_delete
);

// PUT route to update user
router.put(
  "/users/:id",
  passport.authenticate("jwt", { session: false }),
  user_controller.user_update_put
);

// GET request to logout User
router.get("/users/logout", user_controller.user_logout_get);

// CONVERSATION ROUTES

// GET all conversations by user
router.get(
  "/:userid/conversations",
  passport.authenticate("jwt", { session: false }),
  conversation_controller.conversation_list
);

// GET a specific conversation
router.get(
  "/conversations/:id",
  passport.authenticate("jwt", { session: false }),
  conversation_controller.conversation_detail
);

// POST a new conversation
router.post(
  "/:userid/conversations",
  passport.authenticate("jwt", { session: false }),
  conversation_controller.conversation_create_post
);

// DELETE a specific conversation
router.delete(
  "/conversations/:id",
  passport.authenticate("jwt", { session: false }),
  conversation_controller.conversation_delete
);

// Update a specific conversation
router.put(
  "/conversations/:id",
  passport.authenticate("jwt", { session: false }),
  conversation_controller.conversation_update_put
);

// MESSAGE ROUTES
router.get(
  "/conversations/:conversationid/messages",
  passport.authenticate("jwt", { session: false }),
  message_controller.message_list
);
router.get(
  "/messages/:id",
  passport.authenticate("jwt", { session: false }),
  message_controller.message_detail
);
router.post(
  "/:conversationid/messages",
  passport.authenticate("jwt", { session: false }),
  message_controller.message_create_post
);
router.delete(
  "/messages/:id",
  passport.authenticate("jwt", { session: false }),
  message_controller.message_delete
);
router.put(
  "/messages/:id",
  passport.authenticate("jwt", { session: false }),
  message_controller.message_update_put
);

module.exports = router;
