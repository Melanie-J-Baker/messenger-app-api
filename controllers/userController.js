const User = require("../models/user");
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
  const [numUsers, numConversations, numMessages] = await Promise.all([
    User.countDocuments({}).exec(),
    Conversation.countDocuments({}).exec(),
    Message.countDocuments({}).exec(),
  ]);
  res.json({
    numberOfUsers: numUsers,
    numberOfConversations: numConversations,
    numberOfMessages: numMessages,
  });
});

// Send a list of all Users
exports.user_list = asyncHandler(async (req, res, next) => {
  const allUsers = await User.find(
    {},
    "username first_name last_name full_name"
  )
    .sort({ last_name: 1 })
    .exec();
  res.json(allUsers);
});

// Send details for a specific User
exports.user_detail = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).exec();
  if (user === null) {
    res.json({ error: "User not found" });
    return next(err);
  }
  res.json(user);
});

// Handle User create on POST
exports.user_create_post = [
  body("username", "Username is not valid")
    .trim()
    .isLength({ min: 3, max: 100 })
    .escape(),
  body(
    "password",
    "Password must contain at least 8 characters (At least one uppercase letter, one lowercase letter and one number"
  )
    .trim()
    .isLength({ min: 8 })
    .escape(),
  body("first_name", "First name is not valid")
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),
  body("last_name", "Last name is not valid")
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    // Create User with validated and sanitised data
    const user = new User({
      username: req.body.username,
      password: req.body.password,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
    });
    if (!errors.isEmpty()) {
      res.json({ error: errors.array() });
      return;
    } else {
      const userExists = await User.findOne({
        username: req.body.username,
      }).exec();
      if (userExists) {
        res.json({ error: "Username already in use" });
      } else {
        await user.save();
        res.json({
          status: "Sign up successful",
          user: user,
        });
      }
    }
  }),
];

// Handle User delete on DELETE
exports.user_delete = asyncHandler(async (req, res, next) => {
  const [user, allConversations] = await Promise.all([
    User.findById(req.params.id).exec(),
    Conversation.find(
      { user1: req.params.id } || { user2: req.params.id }
    ).exec(),
  ]);
  const allMessagesInConversations = allConversations.forEach(
    async (conversation) => {
      await Message.find({ conversation: conversation._id }).exec();
    }
  );
  if (user === null) {
    res.json({ error: "User not found" });
  }
  if (allConversations.length > 0) {
    await Conversation.deleteMany(
      { user1: req.params.id } || { user2: req.params.id }
    ).exec();
  }
  if (allMessagesInConversations.length > 0) {
    allConversations.forEach(async (conversation) => {
      await Message.deleteMany({ conversation: conversation._id }).exec();
    });
  }
  await User.findByIdAndDelete(req.params.id).exec();
  res.json({
    message: "User deleted",
    user: user,
    conversationsDeleted: allConversations,
    messagesDeleted: allMessagesInConversations,
  });
});

// Handle User update on PUT
exports.user_update_put = asyncHandler(async (req, res, next) => {
  [
    body("username", "Username is not valid")
      .trim()
      .isLength({ min: 3, max: 100 })
      .escape(),
    body(
      "password",
      "Password must contain at least 8 characters (At least one uppercase letter, one lowercase letter and one number"
    )
      .trim()
      .isLength({ min: 8 })
      .escape(),
    body("first_name", "First name is not valid")
      .trim()
      .isLength({ min: 1, max: 100 })
      .escape(),
    body("last_name", "Last name is not valid")
      .trim()
      .isLength({ min: 1, max: 100 })
      .escape(),
    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);
      // Create User with validated and sanitised data
      const user = new User({
        username: req.body.username,
        password: req.body.password,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        _id: req.params.id, // Required to update user and not create new
      });
      if (!errors.isEmpty()) {
        res.json({ error: errors.array() });
        return;
      } else {
        const userExists = await User.findOne({
          username: req.body.username,
        }).exec();
        if (userExists) {
          res.json({ error: "New username already in use" });
        } else {
          await User.findByIdAndUpdate(req.params.id, user, {});
          res.json({
            status: "User details updated successfully",
            user: user,
          });
        }
      }
    }),
  ];
});
