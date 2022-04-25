const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

let players = [];
let LatencyTimeout;

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

  socket.on("connectedToGame", (position) => {
    players.push(new Player(socket.id, position.x, position.y));
    socket.emit("setBeginningGameState", players);
  });

  socket.on("playerMoved", (data) => {
    LatencyTimeout = setTimeout(() => {
      const index = players.findIndex((player) => player.id === socket.id);
      if (index != -1) {
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
        update(socket.id, data.sequenznummer);
      }
    }, 200); //Ping 200ms
  });

  socket.on("ping", () => {
    socket.emit("pong");
  });

  socket.on("highPing", (id) => {
    io.sockets.sockets.forEach((socket) => {
        if (socket.id === id) socket.disconnect(true);
    });
  })

  socket.on("disconnect", () => {
    clearTimeout(LatencyTimeout);
    console.log("user disconnected " + socket.id);
    const index = players.findIndex((player) => player.id === socket.id);
    if (index !== -1) {
      players.splice(index, 1)[0];
    }
  });
});

function update(id, sequenznummer) {
  io.emit("update", { players: players, updatedPlayerId: id, sequenznummer });
}

server.listen(3000, "192.168.178.104", () => {
  console.log("listening on Port: 3000");
});
