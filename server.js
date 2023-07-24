require("dotenv").config();

//npm packages
const express = require("express");
const app = express();
const path = require("path");
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const secretKey = process.env.jwt_secret_key;

const routes_that_bypass_JWT = [ '/api/user/login' , '/api/user/register']

module.exports.verifyToken = function (req, res, next) {
  const token = req.headers.authorization;

    // Skip JWT verification for routes like login and register
    if (routes_that_bypass_JWT.includes(req.path)) {
      return next();
    }

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token.' });
    }

    req.jwt_payload = decoded; // Store the decoded user data in the request object
    next();
  });
}

//Real-time data
const state = 
{
  sharedLocations: {},
  messages: {}
}

// Initialize messages from state
let sharedLocations = state.sharedLocations;
let messages = state.messages;

//Utils
const socketHandler = require('./utils/socketHandlers');

//Controllers
const userController = require('./controller/UserController');
const messageController = require('./controller/MessageController');
const groupController = require('./controller/GroupController');
const imageController = require('./controller/ImageController');

mongoose.connect(process.env.mongodb_uri)
  .then(() => console.log('MongoDB Connected!'));

// built in middleware to handle urlencoded data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// other middleware
app.use(module.exports.verifyToken);
app.use((req, res, next) => {
  req.io = io;
  req.messages = messages;
  next();
});

// API Routes
app.use('/api/user', userController);
app.use('/api/message', messageController); 
app.use('/api/group', groupController);
app.use('/api/image', imageController);

socketHandler(io, state);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));