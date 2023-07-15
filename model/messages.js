const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  text: {
    type: String
  },
  createdAt: {
    type: Date,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  image: String,
  video: String,
  audio: String,
  system: Boolean,
  sent: Boolean,
  received: Boolean,
  pending: Boolean,
  quickReplies: mongoose.Schema.Types.Mixed,
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;