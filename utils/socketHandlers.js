const jwt = require('jsonwebtoken');

module.exports = function(io, state) {
  let sharedLocations = state.sharedLocations;
  let messages = state.messages;

  io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token){
      jwt.verify(socket.handshake.query.token, process.env.jwt_secret_key, function(err, decoded) {
        if (err) return next(new Error('Authentication error: Invalid token'));
        socket.decoded = decoded;
        next();
      });
    }
    else {
      next(new Error('Authentication error: No token'));
    }
  }).on('connection', async (socket) => {
    console.log(socket.decoded.username, 'connected to server.');

    socket.join(socket.handshake.query.groupId);

// #region Message stuff
    socket.on('getMessages', (groupId) => {
      socket.emit('UpdateMessages', messages[groupId] || []);
    })
    
    socket.on('newMessage', (newMsg) => {
      console.log(socket.decoded.username, 'sent msg: ', newMsg);
      
      // Check for valid message data
      if (newMsg === undefined || newMsg.groupId === undefined) {
        console.error('Invalid message: ', newMsg);
        return;
      }

      const message = {
        _id: newMsg._id,
        text: newMsg.text,
        createdAt: new Date(),
        user: {
          _id: socket.decoded.id,
          name: socket.decoded.username,
          avatar: '',
        },
      };

      if (Array.isArray(messages[newMsg.groupId])) {
        messages[newMsg.groupId].unshift(message);
      } else {
        messages[newMsg.groupId] = [message];
      }

      io.to(socket.handshake.query.groupId).emit('UpdateMessages', messages[newMsg.groupId]);
    });
// #endregion

    socket.on('shareLocation', (location) => {
      console.log(socket.decoded.username, 'location received.');
      sharedLocations[socket.decoded.id] = {
        location: location,
        username: socket.decoded.username
      };

      io.emit('updateLocations', sharedLocations);
      console.log('Locations object: ', sharedLocations);
    });

    socket.on('getLocations', () => {
      io.emit('updateLocations', sharedLocations);
    })

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.decoded.username);
      delete sharedLocations[socket.decoded.id];
    });
  });
};