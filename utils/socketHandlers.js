const jwt = require('jsonwebtoken');
const User = require('../model/user');

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

// #region Message stuff
    socket.on('getMessages', (groupId) => {
      io.to(socket.currentRoom).emit('UpdateMessages', messages[groupId] || []);
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

      io.to(socket.currentRoom).emit('UpdateMessages', messages[newMsg.groupId]);
    });
// #endregion
    socket.on('setActiveGroup', async (groupId) => {
      console.log(socket.decoded.username, 'setting active group to ', groupId);
      
      // Query database for matching user belonging to groupId
      try {
        const user = await User.findOne({
          username: socket.decoded.username,
          groups: { $in: [groupId] }
         });

        if (!user) {
          console.error('Error: User belonging to groupId could not be found')
          return;
        }

        // set user's currentGroup to groupId
        user.currentGroup = groupId;
        await user.save();

        // socket leaves the current room
        if (socket.currentRoom) {
          socket.leave(socket.currentRoom);
        }

        // socket.join the groupId room
        socket.join(groupId);
        socket.currentRoom = groupId;

      } catch (error) {
        console.error ('Error setting active group:', error);
      }
    });

    socket.on('shareLocation', (location) => {
      console.log(socket.decoded.username, 'location received.');
      sharedLocations[socket.decoded.id] = {
        location: location,
        username: socket.decoded.username
      };

      // emit updateLocations to sockets in the room
      io.to(socket.currentRoom).emit('updateLocations', sharedLocations);
      console.log('Locations object: ', sharedLocations);
    });

    socket.on('getLocations', () => {
      io.to(socket.currentRoom).emit('updateLocations', sharedLocations);
    });

    socket.on('disconnect_request', () => {
      socket.disconnect();
    });
    
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.decoded.username);
      delete sharedLocations[socket.decoded.id];
    });
  });
};