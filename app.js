const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const RateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const passport = require("passport");
require("./auth/auth");

// get config vars
dotenv.config();

const indexRouter = require("./routes/index");
const messengerRouter = require("./routes/messenger");

const app = express();

//let cache = apicache.middleware;
//app.use(cache("10 minutes")); // cache results for 5 mins

// Set up rate limiter: max of 20 reqs per min
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});

// mongoose setup
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const dev_db_url =
  "mongodb+srv://bakermel:P9Y6lWc9PgCgIK3O@cluster0.ecsu2h1.mongodb.net/messaging-app-api-dev?retryWrites=true&w=majority&appName=Cluster0";
const mongoDB = process.env.MONGODB_URI || dev_db_url;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

app.use(limiter);
app.use(helmet());
app.use(compression()); //compress all routes
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(cors());

// enable CORS pre-flight
app.options("*", cors());

app.use("/", indexRouter);
app.use("/messenger", messengerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Send error object
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err,
  });
});

module.exports = app;
