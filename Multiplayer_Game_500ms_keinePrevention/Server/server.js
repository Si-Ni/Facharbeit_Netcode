const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app); //Node.js Webserver basierend auf dem HTTP-Modul und Express.js
const io = socketio(server); //low-latency, bidirectional and event-based communication between a client and a server

let players = [];

const canvasHeight = 900;
const canvasWidth = 1000;
const playerSize = 20;

class Player {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
  }

  moveLeft() {
    if (this.x > 0) {
      this.x -= 10;
    } else {
      this.x = canvasWidth;
    }
  }

  moveRight() {
    if (this.x < canvasWidth - playerSize) {
      this.x += 10;
    } else {
      this.x = 0 - playerSize;
    }
  }

  moveUp() {
    if (this.y > 0) {
      this.y -= 10;
    } else {
      this.y = canvasHeight;
    }
  }

  moveDown() {
    if (this.y < canvasHeight - playerSize) {
      this.y += 10;
    } else {
      this.y = 0 - playerSize;
    }
  }
}

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("connectedToGame", () => {
    const position = { x: Math.floor(Math.random() * 981), y: Math.floor(Math.random() * 881) }
    players.push(new Player(socket.id, position.x, position.y));
    socket.emit("setBeginningGameState", players);
  });

  socket.on("playerMoved", (data) => {
    setTimeout(() => {
      const index = players.findIndex((player) => player.id === socket.id);
      if(index != -1){
        switch (data.key) {
          case "ArrowLeft":
            players[index].moveLeft();
            break;

          case "ArrowUp":
            players[index].moveUp();
            break;

          case "ArrowRight":
            players[index].moveRight();
            break;

          case "ArrowDown":
            players[index].moveDown();
            break;
        }
        update();
      }
    }, 500); //Ping 500ms
  });

  socket.on("disconnect", () => {
    console.log("user disconnected " + socket.id);
    const index = players.findIndex((player) => player.id === socket.id);
    if (index !== -1) {
      players.splice(index, 1)[0];
    }
  });
});

function update() {
  io.emit("update", players);
}

server.listen(3000, "192.168.178.104", () => {
  console.log("listening on Port: 3000");
});
