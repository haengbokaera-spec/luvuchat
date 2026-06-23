const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let waitingUser = null;

function pairUsers(socket1, socket2) {
  socket1.partner = socket2;
  socket2.partner = socket1;

  socket1.emit("matched");
  socket2.emit("matched");
}

function removeFromWaiting(socket) {
  if (waitingUser === socket) {
    waitingUser = null;
  }
}

function findPartner(socket) {
  if (waitingUser && waitingUser !== socket) {
    const partner = waitingUser;
    waitingUser = null;
    pairUsers(socket, partner);
  } else {
    waitingUser = socket;
    socket.emit("waiting");
  }
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("start", () => {
    findPartner(socket);
  });

  socket.on("message", (msg) => {
    if (!msg || !socket.partner) return;

    socket.partner.emit("message", msg);
  });

  socket.on("next", () => {
    if (socket.partner) {
      socket.partner.emit("stranger_left");
      socket.partner.partner = null;
      findPartner(socket.partner);
    }

    socket.partner = null;
    removeFromWaiting(socket);
    findPartner(socket);
  });

  socket.on("stop", () => {
    if (socket.partner) {
      socket.partner.emit("stranger_left");
      socket.partner.partner = null;
    }

    socket.partner = null;
    removeFromWaiting(socket);
    socket.emit("stopped");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (socket.partner) {
      socket.partner.emit("stranger_left");
      socket.partner.partner = null;
    }

    removeFromWaiting(socket);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Luvu running on port ${PORT}`);
});
