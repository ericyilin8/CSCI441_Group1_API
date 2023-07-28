const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const fs = require('fs');
const verifyToken = require('../server').verifyToken;
const path = require("path");
const publicDirectory = path.resolve(__dirname, '../public');
const sharp = require('sharp');

router.post('/save', verifyToken, upload.single('image'), (req, res) => {
  try {
    // Get io and messages from app-level variables
    const io = req.io;
    const messages = req.messages;
    
    const imageFile = req.file;
    const imageType = req.body.imageType;
    if (!imageFile) {
      res.status(400).json({ error: 'No file uploaded' });
      return router;
    }

    const imageName = req.jwt_payload.username + '-' + Date.now() + '-' + uuid.v4() + '.jpg';
    const destinationPath = path.join(publicDirectory, imageName);
    console.log("Saving picture to:", destinationPath);

    if (imageType === 'avatar') {
      const imageBuffer = imageFile.buffer
      sharp(imageBuffer)
        .resize(100, 100) // width, height
        .toFile(destinationPath, (err, info) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to save image' });
          } else {
            res.json({ message: 'Image uploaded successfully', path: process.env.DIRECTORY + '/public/' + imageName });
          }
        });
    } else {
      fs.writeFile(destinationPath, imageFile.buffer, (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to save image' });
        } else {
          res.json({ message: 'Image uploaded successfully' });
    
          const imgMsg = {
            _id: uuid.v4(),
            createdAt: new Date(),
            user: {
              _id: req.jwt_payload.id,
              name: req.jwt_payload.name,
              avatar: '', // Add avatar uri to payload? Or not even needed?
            },
            image: process.env.DIRECTORY + '/public/' + imageName, //don't use path.join here
            // Mark the message as sent, using one tick
            sent: true,
            // Mark the message as received, using two tick
            pending: true
            // Any additional custom parameters are passed through
          }

          if (Array.isArray(messages[req.body.groupId])) {
            messages[req.body.groupId].unshift(imgMsg);
          } else {
            messages[req.body.groupId] = [imgMsg];
          }

          io.emit('UpdateMessages', messages[req.body.groupId]) 
          console.log(messages)
        }
      });
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send({ message: 'Error uploading image.' });
  }
});

router.get('/retrieve/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(publicDirectory, imageName);

  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if(err) {
      console.log(`${imageName} does not exist.`);
      return res.status(404).json({message: `${imageName} does not exist.`});
    }
    // Image exists, send it
    return res.sendFile(imagePath);
  });
});

module.exports = router;