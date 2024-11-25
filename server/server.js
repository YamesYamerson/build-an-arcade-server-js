const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const chalk = require('chalk');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware for cookies and sessions
app.use(cookieParser());
app.use(session({
    secret: 'arcade-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const PORT = 3000;

// Store active sessions
const sessions = {};

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Root route
app.get('/', (req, res) => {
    if (!req.cookies.userId) {
        const userId = uuidv4();
        res.cookie('userId', userId, { httpOnly: true });
        sessions[userId] = { nickname: null, inGame: false };
        console.log(chalk.green(`Assigned new userId: ${userId}`));
    }
    res.sendFile(path.join(__dirname, '../public/lobby.html'));
});

// API to load games dynamically
app.get('/load-game/:gameName', (req, res) => {
    const userId = req.cookies.userId;

    if (!userId || !sessions[userId]) {
        return res.status(403).json({ success: false, message: 'User session not found.' });
    }

    console.log(chalk.green(`Game ${req.params.gameName} loaded for user: ${userId}`));
    sessions[userId].inGame = true;

    res.json({ success: true, message: `Game ${req.params.gameName} loaded.` });
});

// Handle WebSocket connections
io.on('connection', (socket) => {
    const userId = socket.handshake.headers.cookie?.split('; ').find(row => row.startsWith('userId='))?.split('=')[1];

    if (!userId || !sessions[userId]) {
        console.log(chalk.red('No valid user session found.'));
        socket.disconnect();
        return;
    }

    console.log(chalk.blue(`User connected: ${userId} (${socket.id})`));
    sessions[userId].socketId = socket.id;

    socket.on('join-matchmaking', () => {
        console.log(chalk.green(`User ${userId} joined matchmaking.`));
        socket.emit('match-found', { nickname: sessions[userId].nickname || 'Guest', message: 'You are matched!' });
    });

    socket.on('disconnect', () => {
        console.log(chalk.blue(`User disconnected: ${userId}`));
        delete sessions[userId].socketId;
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(chalk.green(`Server running on http://localhost:${PORT}`));
});
