const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  //use mongo default _id to ensure unique id and automatic generation
  name: {
    type: String,
    required: true,
  },
  avatar: String,
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;