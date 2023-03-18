const express = require("express");
const app = express();
const { Server } = require("socket.io");

// We are making http server because this socket.io doesn't support express server...

const http = require("http");
const httpServer = http.createServer(app);
httpServer.listen(8080);

const io = new Server(httpServer);

const users = {};
var count = 0;
io.on("connection", (socket) => {
  socket.on("new-user-joined", (name) => {
    count+=1;
    users[socket.id] = name;
    socket.broadcast.emit("user-joined", name);
    io.emit("user-online", count);
  });

  socket.on("send", (message) => {
    socket.broadcast.emit("receive", {
      message: message,
      name: users[socket.id],
    });
  });

  socket.on("disconnect", (message) => {
    socket.broadcast.emit("leave", users[socket.id])
    delete users[socket.id];
    count--;
    if(count < 0) count = 0;
    io.emit("user-online", count);
  });
});
