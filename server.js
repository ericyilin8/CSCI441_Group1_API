require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const fs = require('fs');
const multer = require('multer')

//Real-time data
const messages = []

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
        image: 'https://adventurous-pointed-ocean.glitch.me/' + imageName, //don't use path.join here
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



let i = 0;
//test comment
io.on('connection', socket => {
  //io.emit('broadcast', /* … */); // emit an event to all connected sockets
  //socket.on('reply', () => { /* … */ }); // listen to the event
  console.log('connected!', i++)

  socket.emit('UpdateMessages', messages)

  socket.on('newMessage', (newMsg) => {
    messages.unshift(newMsg[0])
    io.emit('UpdateMessages', messages)
  })

});



const PORT = process.env.PORT || 3000;

server.listen(PORT);
console.log("server listening")