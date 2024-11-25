const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const chalk = require('chalk');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { logInfo, logError } = require('../utils/logger');
const { addPlayerToMatchmaking } = require('./matchmaking');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

let activePlayers = {};
let loadedGames = {};

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/lobby.html'));
});

// API to load game dynamically
app.get('/load-game/:gameName', (req, res) => {
    const gameName = req.params.gameName;

    try {
        const gamePath = path.join(__dirname, `../games/${gameName}.js`);
        const gameModule = require(gamePath);

        if (loadedGames[gameName]) {
            res.json({ success: false, message: `Game ${gameName} is already loaded.` });
        } else {
            loadedGames[gameName] = gameModule(io);
            logInfo(`Game ${gameName} loaded successfully.`);
            res.json({ success: true, message: `Game ${gameName} loaded.` });
        }
    } catch (error) {
        logError(`Failed to load game "${gameName}": ${error.message}`);
        res.status(404).json({ success: false, message: 'Game not found.' });
    }
});

// Handle matchmaking
io.on('connection', (socket) => {
    const playerId = uuidv4();
    logInfo(`Player connected: ${playerId} (${socket.id})`);
    activePlayers[playerId] = { socket, inGame: false };

    socket.on('join-matchmaking', ({ playerName, mode }) => {
        logInfo(`Player ${playerId} requested matchmaking as "${playerName}" in ${mode} mode.`);

        if (mode === '1-player') {
            // Create a match with AI
            const match = {
                player1: { id: playerId, name: playerName },
                player2: { id: 'AI', name: 'AI Opponent' },
                mode
            };
            socket.emit('match-found', match);
            logInfo(`1-player match created for ${playerName} against AI.`);
        } else if (mode === '2-player') {
            // Add to matchmaking queue
            const match = addPlayerToMatchmaking(playerId, playerName);

            if (match) {
                io.to(match.player1.id).emit('match-found', match);
                io.to(match.player2.id).emit('match-found', match);
                logInfo(`2-player match created: ${match.player1.name} vs ${match.player2.name}`);
            } else {
                socket.emit('match-status', 'Waiting for another player...');
            }
        }
    });

    socket.on('disconnect', () => {
        logInfo(`Player disconnected: ${playerId}`);
        delete activePlayers[playerId];
    });

    socket.on('error', (err) => {
        logError(`Error from player ${playerId}: ${err.message}`);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(chalk.green(`Server running on http://localhost:${PORT}`));
});
