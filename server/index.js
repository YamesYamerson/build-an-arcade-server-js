const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server); // Initialize Socket.IO

// Logger function
function logger(message) {
    const logMessage = `${new Date().toISOString()} - ${message}\n`;
    console.log(logMessage); // Log to console
    fs.appendFileSync('server.log', logMessage); // Append to log file
}

// Middleware to log all incoming requests
app.use((req, res, next) => {
    logger(`Request: ${req.method} ${req.url}`);
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Explicitly handle favicon.ico
app.get('/favicon.ico', (req, res) => {
    const faviconPath = path.join(__dirname, '../public/favicon.ico');
    if (fs.existsSync(faviconPath)) {
        res.sendFile(faviconPath);
    } else {
        logger('Favicon not found: /favicon.ico');
        res.status(404).send('Favicon not found');
    }
});

// Serve game files explicitly to handle MIME type issues
app.get('/games/:gameFile', (req, res) => {
    const filePath = path.join(__dirname, '../public/games', req.params.gameFile);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
        logger(`Game file served: ${filePath}`);
    } else {
        logger(`Game file not found: ${filePath}`);
        res.status(404).send('Game file not found');
    }
});

// Socket.IO connection
io.on('connection', (socket) => {
    logger(`Socket connected: ${socket.id}`);

    socket.on('message', (data) => {
        logger(`Message received from ${socket.id}: ${data}`);
        socket.emit('response', 'Hello from the server!');
    });

    socket.on('disconnect', () => {
        logger(`Socket disconnected: ${socket.id}`);
    });
});

// Global error handler
app.use((err, req, res, next) => {
    logger(`Error: ${err.message}`);
    res.status(500).send('Internal Server Error');
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    logger(`Server running on http://localhost:${PORT}`);
});
