const express = require('express');
const router = express.Router();
const Message = require('../model/message');

const fs = require('fs');
const multer = require('multer')
// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET /api/messages - Get all messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messages/:id - Get a message by ID
router.get('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messages - Create a new message
router.post('/', async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/messages/:id - Update a message by ID
router.put('/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/messages/:id - Delete a message by ID
router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//upload image
router.post('/image',  upload.single('image'), (req, res) => {
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

module.exports = router;
