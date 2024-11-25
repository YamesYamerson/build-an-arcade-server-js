const matchmakingQueue = [];

function addPlayerToMatchmaking(playerId, playerName) {
    matchmakingQueue.push({ id: playerId, name: playerName });

    if (matchmakingQueue.length >= 2) {
        // Create a match with the first two players
        const player1 = matchmakingQueue.shift();
        const player2 = matchmakingQueue.shift();
        return { player1, player2 };
    }

    return null; // Not enough players for a match yet
}

module.exports = { addPlayerToMatchmaking };
