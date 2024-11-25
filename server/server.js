const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { logInfo, logWarning, logError, logSuccess } = require('./logger');
const { addPlayerToMatchmaking } = require('./matchmaking');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const SESSION_LIFETIME = 1000 * 60 * 30; // 30 minutes
const sessions = {};

// Middleware for cookies and JSON parsing
app.use(cookieParser());
app.use(express.json());

// Session Management Middleware
app.use((req, res, next) => {
    try {
        let userId = req.cookies.userId;

        if (!userId || !sessions[userId]) {
            userId = uuidv4();
            res.cookie('userId', userId, { maxAge: SESSION_LIFETIME, httpOnly: true });
            sessions[userId] = {
                userId,
                nickname: null,
                inGame: false,
                createdAt: Date.now(),
            };
            logSuccess(`New session created for user: ${userId}`);
        } else {
            sessions[userId].createdAt = Date.now();
            logInfo(`Session validated for user: ${userId}`);
        }

        req.session = sessions[userId];
        next();
    } catch (error) {
        logError(`Error in session middleware: ${error.message}`);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Clean up expired sessions
setInterval(() => {
    const now = Date.now();
    for (const userId in sessions) {
        if (now - sessions[userId].createdAt > SESSION_LIFETIME) {
            logWarning(`Session expired for user: ${userId}`);
            delete sessions[userId];
        }
    }
}, 1000 * 60);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
    try {
        logInfo('Serving index.html for the lobby.');
        res.sendFile(path.join(__dirname, 'public/index.html'));
    } catch (error) {
        logError(`Error serving lobby: ${error.message}`);
        res.status(500).send('Internal server error');
    }
});

// API to check session and nickname
app.get('/check-session', (req, res) => {
    const userId = req.cookies.userId;

    if (!userId || !sessions[userId]) {
        logWarning('Session validation failed: No session found.');
        return res.status(403).json({ success: false, message: 'Session not found.' });
    }

    const session = sessions[userId];
    if (!session.nickname) {
        logWarning(`Session validation failed: Nickname not set for user ${userId}`);
        return res.status(403).json({ success: false, message: 'Nickname not set.' });
    }

    logSuccess(`Session and nickname validated for user: ${userId}`);
    res.json({ success: true, nickname: session.nickname });
});

// API to set nickname
app.post('/set-nickname', (req, res) => {
    try {
        const userId = req.session.userId;
        const { nickname } = req.body;

        if (!nickname || nickname.trim() === '') {
            logWarning('Invalid nickname submitted.');
            return res.status(400).json({ success: false, message: 'Nickname cannot be empty.' });
        }

        req.session.nickname = nickname.trim();
        logSuccess(`User ${userId} set their nickname to: ${nickname}`);
        res.json({ success: true });
    } catch (error) {
        logError(`Error in /set-nickname: ${error.message}`);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// API to load a game
app.get('/load-game/:gameName', (req, res) => {
    try {
        const { userId } = req.session;

        if (!sessions[userId]) {
            logWarning('Session not found during game load.');
            return res.status(403).json({ success: false, message: 'Session not found.' });
        }

        req.session.inGame = true;
        logSuccess(`Game ${req.params.gameName} loaded for user: ${userId}`);
        res.json({ success: true, message: `Game ${req.params.gameName} loaded.` });
    } catch (error) {
        logError(`Error in /load-game: ${error.message}`);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// WebSocket connections
io.on('connection', (socket) => {
    try {
        const userId = socket.handshake.headers.cookie?.split('; ').find(row => row.startsWith('userId='))?.split('=')[1];

        if (!userId || !sessions[userId]) {
            logWarning('Invalid or expired session on socket connection.');
            socket.emit('error', 'Session not found or expired.');
            socket.disconnect();
            return;
        }

        logInfo(`User connected: ${userId} (${socket.id})`);
        sessions[userId].socketId = socket.id;

        // Matchmaking
        socket.on('join-matchmaking', () => {
            try {
                const session = sessions[userId];
                if (!session.nickname) {
                    logWarning(`User ${userId} attempted matchmaking without a nickname.`);
                    socket.emit('error', 'Nickname not set.');
                    return;
                }

                const match = addPlayerToMatchmaking(userId, session.nickname);
                if (match) {
                    logSuccess(`Match found: ${match.player1.name} vs ${match.player2.name}`);
                    io.to(match.player1.id).emit('match-found', { nickname: match.player2.name });
                    io.to(match.player2.id).emit('match-found', { nickname: match.player1.name });
                }
            } catch (error) {
                logError(`Error in matchmaking: ${error.message}`);
                socket.emit('error', 'Internal server error.');
            }
        });

        socket.on('disconnect', () => {
            logInfo(`User disconnected: ${userId}`);
            if (sessions[userId]) sessions[userId].inGame = false;
        });
    } catch (error) {
        logError(`Error in WebSocket connection: ${error.message}`);
    }
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    logSuccess(`Server running on http://localhost:${PORT}`);
});
    