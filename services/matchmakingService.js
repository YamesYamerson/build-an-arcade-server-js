const waitingPlayers = {}; // Store waiting players by game type

function addPlayerToQueue(playerId, gameType) {
    if (!waitingPlayers[gameType]) {
        waitingPlayers[gameType] = [];
    }
    waitingPlayers[gameType].push(playerId);
}

function findMatch(playerId, gameType) {
    if (!waitingPlayers[gameType] || waitingPlayers[gameType].length < 2) {
        return null; // No match available
    }

    // Match the first two players in the queue
    const matchedPlayers = waitingPlayers[gameType].splice(0, 2);
    return matchedPlayers.includes(playerId) ? matchedPlayers : null;
}

module.exports = {
    addPlayerToQueue,
    findMatch,
};
