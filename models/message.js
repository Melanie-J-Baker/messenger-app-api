const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User" },
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation" },
    timestamp: { type: Date, default: Date.now() },
    text: { type: String, required: true, maxLength: 500000 },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

MessageSchema.virtual("url").get(function () {
  return `messenger/message/${this._id}`;
});

MessageSchema.virtual("time_formatted").get(function () {
  return DateTime.fromJSDate(this.timestamp).toLocaleString(
    DateTime.TIME_24_SIMPLE
  );
});

MessageSchema.virtual("date_formatted").get(function () {
  return DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model("Message", MessageSchema);
