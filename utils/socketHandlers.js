const jwt = require('jsonwebtoken');

module.exports = function(io, state) {
  let sharedLocations = state.sharedLocations;
  let messages = state.messages;

  io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token){
      jwt.verify(socket.handshake.query.token, process.env.jwt_secret_key, function(err, decoded) {
        if (err) return next(new Error('Authentication error'));
        socket.decoded = decoded;
        next();
      });
    }
    else {
      next(new Error('Authentication error'));
    }
  }).on('connection', async (socket) => {
    console.log(socket.decoded.username, 'connected to server.');

    socket.on('getMessages', () => {
      socket.emit('UpdateMessages', messages);
    })
    
    socket.on('newMessage', (newMsg) => {
      console.log(socket.decoded.username, 'sent msg id:', newMsg[0]._id);
      const message = {
        _id: newMsg[0]._id,
        text: newMsg[0].text,
        createdAt: new Date(),
        user: {
          _id: socket.decoded.id,
          name: socket.decoded.username,
          avatar: 'https://www.planetware.com/wpimages/2020/02/france-in-pictures-beautiful-places-to-photograph-eiffel-tower.jpg',
        },
      };

      messages.unshift(message);
      io.emit('UpdateMessages', messages);
    });

    socket.on('shareLocation', (location) => {
      console.log(socket.decoded.username, 'location received.');
      sharedLocations[socket.decoded.id] = {
        location: location,
        username: socket.decoded.username
      };

      io.emit('updateLocations', sharedLocations);
      console.log('Locations object: ', sharedLocations);
    });

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.decoded.username);
      delete sharedLocations[socket.decoded.id];
    });
  });
};