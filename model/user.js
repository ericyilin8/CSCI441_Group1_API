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
  currentGroup:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  },
});

// Define the pre hook
userSchema.pre('save', function(next) {
  const self = this; // Capture the reference to the current user document.

  // Use a Set to store unique group IDs
  const uniqueGroups = new Set(self.groups.map(group => group.toString()));

  // Clear the groups array and repopulate it with unique group IDs
  self.groups = Array.from(uniqueGroups).map(groupId => mongoose.Types.ObjectId(groupId));

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;