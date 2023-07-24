const express = require('express');
const router = express.Router();
const Group = require('../model/group');
const User = require('../model/user');
const jwt = require('jsonwebtoken');

// GET /api/group - Get all groups for a user
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.jwt_payload.id).populate('groups').lean();
    res.json(user.groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/group/:id - Get a group by ID
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/group - Create a new group, set creator as leader
//Then add the group to the user's groups
router.post('/', async (req, res) => {
  try {
    // Get user id from jwt payload
    const userId = req.jwt_payload.id;

    const group = new Group({
      ...req.body,
      leader: userId,
    });
    
    await group.save();

    const user = await User.findById(req.jwt_payload.id);
    user.groups.push(group._id);
    await user.save();

    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/group - add user to a group
router.put('/addUser', async (req, res) => {
  try {
    // Get user from username
    const user = await User.findOneAndUpdate(
      { username: req.body.username },
      { $addToSet: { groups: req.body.groupId } }, // Using $addToSet to avoid duplicates
      { new: true } // Return the updated document
    );

    res.status(201).json(true);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/group/:id - Update a group by ID
router.put('/:id', async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/group/:id - Delete a group by ID
router.delete('/:id', async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json({ message: 'Group deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
