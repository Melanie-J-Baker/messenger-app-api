const User = require("../models/user");
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// Welcome page with counts of users, conversations and messages
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
    "_id username first_name last_name full_name"
  )
    .sort({ username: 1 })
    .exec();
  res.json(allUsers);
});

// Send details for a specific User
exports.user_detail = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userid).exec();
  if (user === null) {
    res.json({ error: "User not found" });
    return next(err);
  }
  res.json(user);
});

// Handle User signup on POST
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
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
    .isLength({ min: 8 })
    .escape(),
  body("password_confirm").custom(async (password_confirm, { req }) => {
    const password = req.body.password;
    // If passwords do not match throw error
    if (password !== password_confirm) {
      throw new Error("Passwords do not match");
    }
  }),
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
    if (!errors.isEmpty()) {
      res.json({ error: errors.array() });
      return;
    } else {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          res.json({ error: err });
          return;
        } else {
          const user = new User({
            username: req.body.username,
            password: hashedPassword,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
          });
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
      });
    }
  }),
];

//Handle User login on POST
exports.user_login_post = asyncHandler(async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err || !user) {
        const error = new Error("An error occurred");
        return next(error);
      }
      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);
        const body = {
          _id: user._id,
          username: user.username,
        };
        const token = jwt.sign({ user: body }, "TOP_SECRET", {
          expiresIn: "2h",
        });
        return res.json({ token: token, user: user });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

// Handle User logout on POST
exports.user_logout_post = (req, res, next) => {
  res.clearCookie("connect.sid"); // clear the session cookie
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy(function (err) {
      // destroy the session
      res.send(); // send to the client
    });
    res.json({ message: "You are now logged out" });
  });
};

// Handle User delete on DELETE
exports.user_delete = asyncHandler(async (req, res) => {
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
  if (allConversations) {
    await Conversation.deleteMany(
      { user1: req.params.id } || { user2: req.params.id }
    ).exec();
  }
  if (allMessagesInConversations) {
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
      if (!errors.isEmpty()) {
        res.json({ error: errors.array() });
        return;
      } else {
        bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
          if (err) {
            res.json({ err: err });
          } else {
            const user = new User({
              username: req.body.username,
              password: req.body.password,
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              _id: req.params.id, // Required to update user and not create new
            });
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
        });
      }
    }),
  ];
});
