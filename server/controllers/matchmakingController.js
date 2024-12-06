const matchmakingService = require('../services/matchmakingService');

// Add a player to the matchmaking queue
function addToQueue(req, res) {
    const { playerId, gameType } = req.body;

    matchmakingService.addPlayerToQueue(playerId, gameType);
    res.json({ message: `Player ${playerId} added to ${gameType} queue.` });
}

// Find a match for a player
function getMatch(req, res) {
    const { playerId, gameType } = req.query;

    const match = matchmakingService.findMatch(playerId, gameType);
    if (match) {
        res.json({ message: 'Match found!', match });
    } else {
        res.status(404).json({ message: 'No match available yet.' });
    }
}

module.exports = { addToQueue, getMatch };
