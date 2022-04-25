const socket = io("http://192.168.178.104:3000/", {
  transports: ["websocket"],
});

socket.emit("connectedToGame", {x: Math.floor(Math.random() * 981), y: Math.floor(Math.random() * 881)})

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 900;

const playerSize = 20;

let localSocketId;
let players = [];

window.addEventListener('keydown', function(event) {
    socket.emit("playerMoved", {key: event.key, currentPlayerId: localSocketId});
    // switch (event.key) {
    //   case "ArrowLeft":
    //     players[0].moveLeft();
    //     break;
  
    //   case "ArrowUp":
    //     players[0].moveUp();
    //     break;
  
    //   case "ArrowRight":
    //     players[0].moveRight();
    //     break;
  
    //   case "ArrowDown":
    //     players[0].moveDown();
    //     break;
    // }
    // updateLocalPlayer();
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

function updatePlayers(){
    ctx.fillStyle = "grey"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    players.forEach(player => draw(player));
}

function draw(player){
    ctx.beginPath();
    ctx.rect(player.x, player.y, playerSize, playerSize);
    ctx.stroke();
    ctx.fillStyle = "blue";
    ctx.fill();
}