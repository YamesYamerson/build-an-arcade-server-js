const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let waitingPlayer = null;
const games = {};

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('A new player has connected');

  // Matchmaking logic
  if (waitingPlayer) {
    const room = `room-${socket.id}-${waitingPlayer.id}`;
    socket.join(room);
    waitingPlayer.join(room);

    games[room] = [waitingPlayer, socket];
    io.to(room).emit('startGame', { room });
    waitingPlayer = null;
  } else {
    waitingPlayer = socket;
    socket.emit('waiting', 'Waiting for another player...');
  }

  socket.on('move', (data) => {
    const gameRoom = data.room;
    socket.to(gameRoom).emit('opponentMove', data);
  });

  socket.on('disconnect', () => {
    console.log('A player has disconnected');
    if (waitingPlayer === socket) {
      waitingPlayer = null;
    }
  });
});

// Start server
server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
