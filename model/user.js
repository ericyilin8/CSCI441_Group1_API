const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  //we use mongo's default _id, so no _id is here
  username: {
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