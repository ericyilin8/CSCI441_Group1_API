const express = require('express');
const router = express.Router();
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const authService = require('../utils/authService');

// POST /api/user - Create a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, phoneNumber, firstName, lastName } = req.body;

    console.log(`Received registration request for user: ${req.body.username}`);
    
    // hash password using authService
    const hashedPassword = await authService.hashPassword(password);
    
    // use hashed password when creating the user
    const user = new User({ username, password: hashedPassword, email, phoneNumber, firstName, lastName });
    await user.save();

    res.status(201).json({ message: 'User created', user: { id: user._id, username: user.username }});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/user/login - Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    //Find the user
    const user = await User.findOne({username}).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // use authService to compare passwords
    const isPasswordMatch = await authService.comparePassword(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    const secretKey = process.env.jwt_secret_key;
    const payload = {
      id: user._id,
      username: user.username 
    };
    const token = jwt.sign(payload, secretKey, { expiresIn: '24h' }); //expiration
    delete user.password;

    // User is authenticated
    res.status(201).json( { user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/user - Update a user
router.put('/', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.jwt_payload.id, req.body, { new: true }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    delete user.password;
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
