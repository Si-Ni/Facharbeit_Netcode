const socket = io("http://192.168.178.104:3000/", {
  transports: ["websocket"],
});

socket.emit("connectedToGame");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 900;

const playerSize = 20;

let localSocketId;
let players = [];

window.addEventListener("keydown", function (event) {
  socket.emit("playerMoved", { key: event.key, currentPlayerId: localSocketId });
});

socket.on("setBeginningGameState", (data) => {
  localSocketId = socket.id;
  players = data;
  updatePlayers();
});

socket.on("update", (data) => {
  players = data;
  updatePlayers();
});

function updatePlayers() {
  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  players.forEach((player) => draw(player));
}

function draw(player) {
  ctx.beginPath();
  ctx.rect(player.x, player.y, playerSize, playerSize);
  ctx.stroke();
  ctx.fillStyle = "blue";
  ctx.fill();
}
