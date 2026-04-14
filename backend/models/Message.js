const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  user: String,
  receiver: String, // NEW FIELD
  text: String,
  time: Date,
});

module.exports = mongoose.model("Message", messageSchema);