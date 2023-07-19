const express = require('express');
const router = express.Router();
const User = require('../model/user');

// POST /api/user - Create a new user
router.post('/register', async (req, res) => {
  try {
    console.log(`Received registration request for user: ${req.body.username}`);
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/user/login - Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    //Find the user
    const user = await User.findOne({username, password});
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const secretKey = process.env.jwt_secret_key;
    const payload = {};
    const token = jwt.sign(payload, secretKey, { expiresIn: '24h' }); //expiration
    delete user.password;

    res.status(201).json( { user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/user/:id - Update a user by ID
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/user/:id - Delete a user by ID
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
