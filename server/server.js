const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const chalk = require('chalk');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware for cookies and JSON parsing
app.use(cookieParser());
app.use(express.json());

const SESSION_LIFETIME = 1000 * 60 * 30; // 30 minutes
const sessions = {};

// Middleware to manage sessions
app.use((req, res, next) => {
    let userId = req.cookies.userId;

    if (!userId || !sessions[userId]) {
        // Generate a new session if none exists
        userId = uuidv4();
        res.cookie('userId', userId, { maxAge: SESSION_LIFETIME, httpOnly: true });
        sessions[userId] = {
            userId,
            nickname: null,
            inGame: false,
            createdAt: Date.now()
        };
        console.log(chalk.green(`New session created for user: ${userId}`));
    } else {
        // Reset session expiration
        sessions[userId].createdAt = Date.now();
        console.log(chalk.yellow(`Session validated for user: ${userId}`));
    }

    req.session = sessions[userId];
    next();
});

// Clean up expired sessions
setInterval(() => {
    const now = Date.now();
    for (const userId in sessions) {
        if (now - sessions[userId].createdAt > SESSION_LIFETIME) {
            console.log(chalk.red(`Session expired for user: ${userId}`));
            delete sessions[userId];
        }
    }
}, 1000 * 60);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Root route: Serve lobby
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/lobby.html'));
});

// API to set nickname
app.post('/set-nickname', (req, res) => {
    const userId = req.session.userId;
    const { nickname } = req.body;

    if (!nickname || nickname.trim() === '') {
        return res.status(400).json({ success: false, message: 'Nickname cannot be empty.' });
    }

    req.session.nickname = nickname.trim();
    console.log(chalk.green(`User ${userId} set their nickname to: ${req.session.nickname}`));
    res.json({ success: true });
});

// API to load games dynamically
app.get('/load-game/:gameName', (req, res) => {
    const { userId } = req.session;

    if (!sessions[userId]) {
        return res.status(403).json({ success: false, message: 'Session not found.' });
    }

    console.log(chalk.green(`Game ${req.params.gameName} loaded for user: ${userId}`));
    req.session.inGame = true;

    res.json({ success: true, message: `Game ${req.params.gameName} loaded.` });
});

// Handle WebSocket connections
io.on('connection', (socket) => {
    const userId = socket.handshake.headers.cookie?.split('; ').find(row => row.startsWith('userId='))?.split('=')[1];

    if (!userId || !sessions[userId]) {
        socket.emit('error', 'Session not found or expired.');
        socket.disconnect();
        return;
    }

    console.log(chalk.blue(`User connected: ${userId} (${socket.id})`));
    sessions[userId].socketId = socket.id;

    // Handle matchmaking
    socket.on('join-matchmaking', () => {
        const session = sessions[userId];
        if (!session.nickname) {
            socket.emit('error', 'Nickname not set.');
            return;
        }

        console.log(chalk.green(`User ${userId} joined matchmaking as ${session.nickname}.`));
        socket.emit('match-found', { nickname: session.nickname, message: 'You are matched!' });
    });

    socket.on('disconnect', () => {
        console.log(chalk.blue(`User disconnected: ${userId}`));
        if (sessions[userId]) sessions[userId].inGame = false;
    });
});

// Start the server
server.listen(3000, () => {
    console.log(chalk.green('Server running on http://localhost:3000'));
});
