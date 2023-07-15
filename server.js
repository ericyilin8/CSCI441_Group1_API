require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const fs = require('fs');
const multer = require('multer')
const handleSocketEvents = require('./utils/socketHandlers');

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://root:group1@cluster0.qtwur9i.mongodb.net/?retryWrites=true&w=majority')
  .then(() => console.log('Connected!'));

//Real-time data
const state = 
{
  sharedLocations: {},
  messages: []
}

let sharedLocations = state.sharedLocations;
let messages = state.messages;

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Set up CORS headers
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
//app.use("/states", require("./routes/api/states"));
app.post('/image',  upload.single('image'), (req, res) => {
  const imageFile = req.file;
  if (!imageFile) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const destinationFolder = 'public';
  const imageName = Math.floor(Math.random()*100000) + '.jpg';
  const destinationPath = path.join(__dirname, destinationFolder, imageName);

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

handleSocketEvents(io, state);

const PORT = process.env.PORT || 3000;

server.listen(PORT);
console.log("server listening")