const express = require('express');
const router = express.Router();
const Group = require('../model/group');
const jwt = require('jsonwebtoken');

// GET /api/group - Get all groups for a user
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find({username: req.jwt_payload.username});
    res.json(groups);
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

// POST /api/group - Create a new group
router.post('/', async (req, res) => {
  try {
    // Get user id from jwt payload
    const userId = req.jwt_payload.id;

    const group = new Group({
      ...req.body,
      leader: userId,
    });
    
    await group.save();
    res.status(201).json(group);
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
