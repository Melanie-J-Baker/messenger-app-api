#! /usr/bin/env node

console.log(
  'This script populates some test users, conversations and users to database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Conversation = require("./models/conversation");
const User = require("./models/user");
const Message = require("./models/message");

const users = [];
const conversations = [];
const messages = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createUsers();
  await createConversations();
  await createMessages();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

async function userCreate(index, username, password, first_name, last_name) {
  const userdetail = {
    username: username,
    password: password,
    first_name: first_name,
    last_name: last_name,
  };
  const user = new User(userdetail);
  await user.save();
  users[index] = user;
  console.log(`Added user: ${first_name} ${last_name}`);
}

async function conversationCreate(index, users) {
  const conversationdetail = {
    users: users,
  };

  const conversation = new Conversation(conversationdetail);
  await conversation.save();
  conversations[index] = conversation;
  console.log(`Added conversation: ${users}`);
}

async function messageCreate(index, author, conversation, timestamp, text) {
  const messagedetail = {
    author: author,
    conversation: conversation,
    timestamp: timestamp,
    text: text,
  };
  const message = new Message(messagedetail);
  await message.save();
  messages[index] = message;
  console.log(`Added message by author: ${author}`);
}

async function createUsers() {
  console.log("Adding users");
  await Promise.all([
    userCreate(0, "BrassEye", "Password1", "Chris", "Morris"),
    userCreate(1, "ITCrowd", "Password1", "Richard", "Ayoade"),
    userCreate(2, "DarkPlace", "Password1", "Garth", "Marenghi"),
    userCreate(3, "RHLSTP", "Password1", "Richard", "Herring"),
    userCreate(4, "Fubar", "Password1", "James", "Acaster"),
  ]);
}

async function createMessages() {
  console.log("Adding Messages");
  await Promise.all([
    messageCreate(
      0,
      users[0],
      conversations[0],
      Date.now(),
      "Hello! Thank you for adding me on the app"
    ),
    messageCreate(
      1,
      users[1],
      conversations[0],
      Date.now(),
      "Hello! Lovely to hear from you :)"
    ),
    messageCreate(
      2,
      users[0],
      conversations[0],
      Date.now(),
      "Are you going to the exhibition at the Grand on Thursday?"
    ),
    messageCreate(
      3,
      users[2],
      conversations[1],
      Date.now(),
      "Yo! How's it going? Have you finished this week's assignment yet?"
    ),
    messageCreate(
      4,
      users[3],
      conversations[1],
      Date.now(),
      "Heyy, afraid not. Had a crazy week. Hoping to get it done this evening. How comes? Is it difficult?"
    ),
    messageCreate(
      5,
      users[2],
      conversations[1],
      Date.now(),
      "Not particularly, was just hoping to compare answers as I'm not 100% on what I have done"
    ),
    messageCreate(
      6,
      users[3],
      conversations[2],
      Date.now(),
      "Good morning. What time do you think you'll be arriving tomorrow afternoon?"
    ),
    messageCreate(
      7,
      users[4],
      conversations[2],
      Date.now(),
      "Should be around 3.30pm. Looking forward to seeing you!"
    ),
    messageCreate(
      8,
      users[1],
      conversations[3],
      Date.now(),
      "Lovely to see you yesterday. Just wondering, are you interested in going to an art exhibition at the Grand on Thursday?"
    ),
    messageCreate(
      9,
      users[4],
      conversations[3],
      Date.now(),
      "Yes, that would be lovely. What time?"
    ),
  ]);
}

async function createConversations() {
  console.log("Adding conversations");
  await Promise.all([
    conversationCreate(0, users[0], users[1]),
    conversationCreate(1, users[2], users[3]),
    conversationCreate(2, users[3], users[4]),
    conversationCreate(3, users[1], users[4]),
  ]);
}
