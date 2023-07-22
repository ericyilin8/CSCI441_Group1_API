const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username : {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  avatar: {
    type: String, //image uri
    default: '',
  },
  status: String,
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  }],
  currentGroup: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;