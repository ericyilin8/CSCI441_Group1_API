require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const server = require('http').createServer(app);
const io = require('socket.io')(server);


// built in middleware to handel urlencoded data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// To handle static files in main and Sub Dir
app.use(express.static(path.join(__dirname, "/public")));
//app.use("/subdir", express.static(path.join(__dirname, "/public")));

// API Routes
//app.use("/states", require("./routes/api/states"));

// 404 Route for un-defined
app.all("*", (req, res) => {
  res.status(404);
  res.type("txt").send("404 Not Found");
});

const messages = []
//test comment
io.on('connection', socket => {
  //io.emit('broadcast', /* … */); // emit an event to all connected sockets
  //socket.on('reply', () => { /* … */ }); // listen to the event
  socket.on('newMessage', (newMsg) => {
    messages.unshift(newMsg[0])
    io.emit('UpdateMessages', messages)
  })

});



const PORT = process.env.PORT || 3000;

server.listen(PORT);
console.log("server listening")