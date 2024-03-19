const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: { type: String, required: true, minLength: 3, maxLength: 100 },
    password: {
      type: String,
      required: true,
    },
    first_name: { type: String, required: true, maxLength: 100 },
    last_name: { type: String, required: true, maxLength: 100 },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

UserSchema.virtual("full_name").get(function () {
  let fullname = "";
  if (this.first_name && this.last_name) {
    fullname = `${this.last_name}, ${this.first_name}`;
  }
  return fullname;
});

UserSchema.virtual("url").get(function () {
  return `messenger/user/${this._id}`;
});

UserSchema.pre("save", async function (next) {
  const user = this;
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

UserSchema.methods.isValidPassword = async function (password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.password);
  return compare;
};

module.exports = mongoose.model("User", UserSchema);
