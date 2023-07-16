const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName : {
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
  phone_number: {
    type: String,
    required: true,
  },
  avatar: String, //image uri
  status: String,
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;