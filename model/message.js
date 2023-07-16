const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    //this id comes from react gifted chat
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
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      avatar: String 
      //If avatar is null, then there will be no avatar. If avatar is empty string '' then it will render initials for the avatar.
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