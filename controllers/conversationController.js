const Conversation = require("../models/conversation");
const Message = require("../models/message");
const asyncHandler = require("express-async-handler");

// Send a list of all Conversations
exports.conversation_list = asyncHandler(async (req, res) => {
  const allConversations = await Conversation.find({
    $or: [{ user1: req.params.userid }, { user2: req.params.userid }],
  })
    .populate("user1")
    .populate("user2")
    .sort({ _id: 1 });
  res.json(allConversations);
});

// Send details for a specific Conversation
exports.conversation_detail = asyncHandler(async (req, res, next) => {
  const [conversation, messagesInConversation] = await Promise.all([
    Conversation.findById(req.params.id)
      .populate("user1")
      .populate("user2")
      .exec(),
    Message.find({ conversation: req.params.id })
      .sort({ timestamp: -1 })
      .populate("author")
      .exec(),
  ]);
  if (conversation === null) {
    res.json({ error: "Conversation not found" });
    return next(err);
  }
  res.json({
    conversation: conversation,
    messagesInConversation: messagesInConversation,
  });
});

// Handle conversation create on POST
exports.conversation_create_post = asyncHandler(async (req, res) => {
  const user1 = req.body.user1;
  const user2 = req.body.user2;
  const conversationExists = await Conversation.findOne({
    $or: [
      { user1: user1, user2: user2 },
      { user1: user2, user2: user1 },
    ],
  }).exec();
  if (!conversationExists || user1 !== "" || user2 !== "") {
    const conversation = new Conversation({
      user1: user1,
      user2: user2,
    });
    await conversation.save();
    res.json({
      status: "Conversation started",
      conversation: conversation,
    });
  } else {
    res.json({
      error: "Conversation already exists",
      conservationExists: conversationExists,
    });
  }
});

// Handle conversation delete on DELETE
exports.conversation_delete = asyncHandler(async (req, res) => {
  const [conversation, allMessagesInConversation] = await Promise.all([
    Conversation.findById(req.params.id).exec(),
    Message.find({ conversation: req.params.id }).exec(),
  ]);
  if (conversation === null) {
    res.json({ error: "Conversation not found" });
  }
  if (allMessagesInConversation.length > 0) {
    await Message.deleteMany({ conversation: req.params.id }).exec();
  }
  await Conversation.findByIdAndDelete(req.params.id).exec();
  res.json({
    message: "Conversation deleted",
    conversation: conversation,
    messagesDeleted: allMessagesInConversation,
  });
});

// Handle conversation update on PUT
exports.conversation_update_put = asyncHandler(async (req, res) => {
  const conversation = new Conversation({
    user1: req.params.userid,
    user2: req.body.user2,
    _id: req.params.id, // Ensure conversation is updated and a new one is not created
  });
  await Conversation.findByIdAndUpdate(req.params.id, conversation, {});
  res.json({
    status: "Conversation updated",
    conversation: conversation,
  });
});
