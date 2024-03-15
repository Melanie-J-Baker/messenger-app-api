const User = require("../models/user");
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Send a list of all Messages
exports.message_list = asyncHandler(async (req, res, next) => {
  const allMessages = await Message.find(
    {},
    "author conversation timestamp_formatted text"
  )
    .populate("author")
    .populate("conversation")
    .sort({ conversation: 1 })
    .exec();
  res.json(allMessages);
});

// Send details for a specific Message
exports.message_detail = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id)
    .populate("author")
    .exec();
  if (message === null) {
    res.json({ error: "Message not found" });
    return next(err);
  }
  res.json(message);
});

// Handle Message create on POST
exports.message_create_post = [
  body("conversation", "Conversation selected not valid")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("text", "Message must not be empty or more than 500000 characters")
    .trim()
    .isLength({ min: 1, max: 500000 })
    .escape(),
  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract validation errors from request
    const errors = validationResult(req);
    const message = new Message({
      author: req.body.author,
      conversation: req.body.conversation,
      timestamp: Date.now(),
      text: req.body.text,
    });
    if (!errors.isEmpty()) {
      res.json({ error: errors.array() });
    } else {
      await message.save();
      res.json({
        status: "Message sent successfully",
        message: message,
      });
    }
  }),
];

// Handle Message delete on DELETE
exports.message_delete = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id).exec();
  if (message === null) {
    res.json({ error: "Message not found" });
  }
  await Message.findByIdAndDelete(req.params.id).exec();
  res.json({
    message: "Message deleted",
    message: message,
  });
});

// Handle Message update on PUT
exports.message_update_put = [
  body("conversation", "Conversation selected not valid")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("text", "Message must not be empty or more than 500000 characters")
    .trim()
    .isLength({ min: 1, max: 500000 })
    .escape(),
  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract validation errors from request
    const errors = validationResult(req);
    const message = new Message({
      author: req.body.author,
      conversation: req.body.conversation,
      timestamp: Date.now(),
      text: req.body.text,
      _id: req.params.id, // Required to update message and not create new
    });
    if (!errors.isEmpty()) {
      res.json({ error: errors.array() });
      return;
    } else {
      await Message.findByIdAndUpdate(req.params.id, message, {});
      res.json({
        status: "Message updated successfully",
        message: message,
      });
    }
  }),
];
