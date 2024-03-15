const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  user1: { type: Schema.Types.ObjectId, ref: "User" },
  user2: { type: Schema.Types.ObjectId, ref: "User" },
});

ConversationSchema.virtual("url").get(function () {
  return `messenger/conversation/${this._id}`;
});

module.exports = mongoose.model("Conversation", ConversationSchema);
