const socket = io("http://192.168.178.104:3000/", {
  transports: ["websocket"],
});

socket.emit("connectedToGame", { x: Math.floor(Math.random() * 981), y: Math.floor(Math.random() * 881) });

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 900;

const playerSize = 20;

let localSocketId;
let players = [];
let playerMoves = [];
let sequenznummer = 0;
let startTime;
sequenznummer++;

window.addEventListener("keydown", function (event) {
  socket.emit("playerMoved", { key: event.key, sequenznummer: sequenznummer });
  setTimeout(() => {
    //Timeout auskommentieren, um Verzögerung zu zeigen
    const index = players.findIndex((player) => player.id === localSocketId);
    switch (event.key) {
      case "ArrowLeft":
        moveLeft(players[index]);
        break;

      case "ArrowUp":
        moveUp(players[index]);
        break;

      case "ArrowRight":
        moveRight(players[index]);
        break;

      case "ArrowDown":
        moveDown(players[index]);
        break;
    }
    playerMoves[sequenznummer] = { x: players[index].x, y: players[index].y };
    updateLocalPlayer(players[index]);
    sequenznummer++;
  }, 180);
});

socket.on("setBeginningGameState", (data) => {
  localSocketId = socket.id;
  players = data;
  updatePlayers();
});

socket.on("update", (data) => {
  if (data.updatedPlayerId == localSocketId && sequenznummer != 0) {
    const index = data.players.findIndex((player) => player.id === localSocketId);
    if (data.players[index].x == playerMoves[data.sequenznummer].x && data.players[index].y == playerMoves[data.sequenznummer].y) {
      for (let i = 0; i < data.players.length; i++) {
        if (data.players[i].id != localSocketId) {
          players[i] = data.players[i];
        }
      }
    } else {
      players = data.players;
    }
  } else {
    players = data.players;
  }
  updatePlayers();
});

function updatePlayers() {
  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  players.forEach((player) => draw(player));
}

function updateLocalPlayer(player) {
  ctx.fillStyle = "grey";
  ctx.fillRect(player.x - playerSize, player.y - playerSize, 60, 60);
  draw(player);
}

function draw(player) {
  ctx.beginPath();
  ctx.rect(player.x, player.y, playerSize, playerSize);
  ctx.stroke();
  ctx.fillStyle = "blue";
  ctx.fill();
}

function moveLeft(player) {
  if (player.x > 0) {
    player.x -= 10;
  } else {
    player.x = canvas.width;
  }
}

function moveRight(player) {
  if (player.x < canvas.width - playerSize) {
    player.x += 10;
  } else {
    player.x = 0 - playerSize;
  }
}

function moveUp(player) {
  if (player.y > 0) {
    player.y -= 10;
  } else {
    player.y = canvas.height;
  }
}

function moveDown(player) {
  if (player.y < canvas.height - playerSize) {
    player.y += 10;
  } else {
    player.y = 0 - playerSize;
  }
}

//Ping-Time
setInterval(function () {
  startTime = Date.now();
  socket.emit("ping");
}, 2000);

socket.on("pong", function () {
  latency = Date.now() - startTime; //latency + die des Remote-Spielers könnte als Input-Delay verwendet werden
  if(latency >= 400){
    socket.emit("highPing", (localSocketId));
  }
  document.getElementById("ping").innerText = "Ping: " + latency
});