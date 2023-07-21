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
const fs = require('fs');
const multer = require('multer')
// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

const routes_that_bypass_JWT = [ '/api/user/login' , '/api/user/register']

function verifyToken(req, res, next) {
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
  messages: []
}

//Utils
const socketHandler = require('./utils/socketHandlers');

//Controllers
const userController = require('./controller/UserController');
const messageController = require('./controller/MessageController');
const groupController = require('./controller/GroupController');

mongoose.connect(process.env.mongodb_uri)
  .then(() => console.log('MongoDB Connected!'));

let sharedLocations = state.sharedLocations;
let messages = state.messages;



// built in middleware to handle urlencoded data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// other middleware
//app.use(verifyToken);

// API Routes
app.use('/api/user', userController);
app.use('/api/message', messageController); 
app.use('/api/group', groupController); 

socketHandler(io, state);

//upload image
app.post('/image',  upload.single('image'), (req, res) => {
  const imageFile = req.file;
  if (!imageFile) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const destinationFolder = 'public';
  const imageName = Math.floor(Math.random()*100000) + '.jpg';
  const destinationPath = path.join(__dirname, '..', destinationFolder, imageName);

  fs.writeFile(destinationPath, imageFile.buffer, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to save image' });
    } else {
      res.json({ message: 'Image uploaded successfully' });

      const imgMsg = {
        _id: Math.floor(Math.random()*100000),
        createdAt: new Date(Date.UTC(2016, 5, 11, 17, 20, 0)),
        user: {
          _id: Math.floor(Math.random()*100),
          name: 'Lucy Jean',
          avatar: 'https://cdn.stocksnap.io/img-thumbs/960w/camera-girl_WJL4RY6N6Z.jpg',
        },
        image: process.env.DIRECTORY + '/' + imageName, //don't use path.join here
        // Mark the message as sent, using one tick
        sent: true,
        // Mark the message as received, using two tick
        pending: true
        // Any additional custom parameters are passed through
      }
      messages.unshift(imgMsg)
      io.emit('UpdateMessages', messages)
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));