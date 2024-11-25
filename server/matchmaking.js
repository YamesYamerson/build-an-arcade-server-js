const { logInfo, logSuccess } = require('../utils/logger');

const matchmakingQueue = [];

/**
 * Adds a player to the matchmaking queue.
 * If two players are available, returns a match.
 */
function addPlayerToMatchmaking(playerId, playerName) {
    matchmakingQueue.push({ id: playerId, name: playerName });

    logInfo(`Player added to matchmaking: ${playerName} (${playerId}). Queue size: ${matchmakingQueue.length}`);

    if (matchmakingQueue.length >= 2) {
        const player1 = matchmakingQueue.shift();
        const player2 = matchmakingQueue.shift();

        logSuccess(`Match created: ${player1.name} vs ${player2.name}`);
        return { player1, player2, mode: '2-player' };
    }

    logInfo('Waiting for more players to join matchmaking.');
    return null;
}

module.exports = { addPlayerToMatchmaking };
