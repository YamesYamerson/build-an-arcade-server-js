const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const chalk = require('chalk');
const { v4: uuidv4 } = require('uuid');
const { logInfo, logError } = require('../utils/logger');
const { addPlayerToMatchmaking, getMatch } = require('./matchmaking');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Serve static files from /public
app.use(express.static('public'));

// Root endpoint
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Active player connections
let activePlayers = {};

// Handle client connections
io.on('connection', (socket) => {
    const playerId = uuidv4();
    logInfo(`Player connected: ${playerId} (${socket.id})`);
    
    activePlayers[playerId] = { socket, inGame: false };

    // Handle matchmaking request
    socket.on('join-matchmaking', (playerName) => {
        logInfo(`Player ${playerId} requested matchmaking as "${playerName}"`);
        const match = addPlayerToMatchmaking(playerId, playerName);

        if (match) {
            logInfo(`Match found: ${match.player1.name} vs ${match.player2.name}`);
            io.to(match.player1.id).emit('match-found', match);
            io.to(match.player2.id).emit('match-found', match);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        logInfo(`Player disconnected: ${playerId}`);
        delete activePlayers[playerId];
    });

    // Error handling
    socket.on('error', (err) => {
        logError(`Error from player ${playerId}: ${err.message}`);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(chalk.green(`Server running on http://localhost:${PORT}`));
});
