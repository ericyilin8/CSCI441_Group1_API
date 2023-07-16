require("dotenv").config();

//npm packages
const express = require("express");
const app = express();
const path = require("path");
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const mongoose = require('mongoose');

//Utils
const handleSocketEvents = require('./utils/socketHandlers');

//Controllers
const userController = require('./controller/UserController');
const messageController = require('./controller/MessageController');
const groupController = require('./controller/GroupController');

mongoose.connect(process.env.mongodb_uri)
  .then(() => console.log('Connected!'));

//Real-time data
const state = 
{
  sharedLocations: {},
  messages: []
}

let sharedLocations = state.sharedLocations;
let messages = state.messages;

// Set up CORS headers, allow cross origin ? not sure if needed
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// built in middleware to handle urlencoded data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/users', userController);
app.use('/api/message', messageController); 
app.use('/api/group', groupController); 

handleSocketEvents(io, state);

const PORT = process.env.PORT || 3000;

server.listen(PORT);
console.log("server listening")