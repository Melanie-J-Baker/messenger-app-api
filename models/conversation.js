const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ConversationSchema = new Schema(
  {
    user1: { type: Schema.Types.ObjectId, ref: "User" },
    user2: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

ConversationSchema.virtual("url").get(function () {
  return `messenger/conversations/${this._id}`;
});

module.exports = mongoose.model("Conversation", ConversationSchema);
