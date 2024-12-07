const { logInfo, logSuccess, logWarning } = require('../utils/logger');

const matchmakingQueue = [];
const activeMatches = [];

/**
 * Adds a player to the matchmaking queue.
 * If two players are available, creates a match and returns it.
 * 
 * @param {string} playerId - The unique identifier of the player.
 * @param {string} playerName - The name of the player.
 * @returns {object|null} - Returns match object if a match is created, otherwise null.
 */
function addPlayerToMatchmaking(playerId, playerName) {
    // Check if the player is already in the queue
    const existingPlayer = matchmakingQueue.find(player => player.id === playerId);
    if (existingPlayer) {
        logWarning(`Player ${playerName} (${playerId}) is already in the matchmaking queue.`);
        return null;
    }

    // Add player to the matchmaking queue
    matchmakingQueue.push({ id: playerId, name: playerName });
    logInfo(`Player added to matchmaking: ${playerName} (${playerId}). Queue size: ${matchmakingQueue.length}`);

    // If there are at least two players, create a match
    if (matchmakingQueue.length >= 2) {
        const player1 = matchmakingQueue.shift();
        const player2 = matchmakingQueue.shift();

        const match = {
            id: `match_${Date.now()}_${player1.id}_${player2.id}`,
            player1,
            player2,
            mode: '2-player',
            createdAt: Date.now(),
        };

        activeMatches.push(match);

        logSuccess(`Match created: ${player1.name} vs ${player2.name}. Match ID: ${match.id}`);
        return match;
    }

    logInfo('Waiting for more players to join matchmaking.');
    return null;
}

/**
 * Gets the list of active matches.
 * 
 * @returns {Array} - The array of active matches.
 */
function getActiveMatches() {
    return activeMatches;
}

/**
 * Removes a match from active matches.
 * 
 * @param {string} matchId - The ID of the match to remove.
 * @returns {boolean} - Returns true if the match was removed, false otherwise.
 */
function removeMatch(matchId) {
    const index = activeMatches.findIndex(match => match.id === matchId);

    if (index === -1) {
        logWarning(`Match ID ${matchId} not found in active matches.`);
        return false;
    }

    activeMatches.splice(index, 1);
    logSuccess(`Match ID ${matchId} removed from active matches.`);
    return true;
}

module.exports = { addPlayerToMatchmaking, getActiveMatches, removeMatch };
