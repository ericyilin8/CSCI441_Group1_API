const User = require('../model/user')

module.exports = function handleSocketEvents(io, state) {
  let i = 0;
  let sharedLocations = state.sharedLocations; //type {}
  let messages = state.messages; //type []
  
  io.on('connection', async (socket) => {
    socket.on('connect', () => {
      console.log(socket.id, 'connected to server.');
    });

    // Create a new user for the new connection
    // Right now just assign username based on socket.id, tiny chance of duplicates though
    const newUser = await User.create({ username: `User_${socket.id.slice(-3)}`, id: socket.id });
    console.log('Create new user: ', newUser.username);

    // Send connected device current messages array
    socket.emit('UpdateMessages', messages);
      
    // Listen for newMessage event
    socket.on('newMessage', (newMsg) => {
      messages.unshift(newMsg[0]);
      io.emit('UpdateMessages', messages);
    });

    // Listen for shareLocation event
    socket.on('shareLocation', (location) => {
      // update the location for this user in the sharedLocation object
      sharedLocations[newUser.id] = {
        location: location,
        username: newUser.username
      };

      // send the location change to other users
      io.emit('updateLocations', sharedLocations);
      console.log('Locations object: ', sharedLocations);
    });

    // Log user disconnected
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      // When the user disconnects, delete their location data
      delete sharedLocations[newUser.id];
      await User.delete(newUser.id);
    });
  });
}