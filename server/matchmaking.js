const matchmakingQueue = [];

function addPlayerToMatchmaking(playerId, playerName) {
    matchmakingQueue.push({ id: playerId, name: playerName });

    if (matchmakingQueue.length >= 2) {
        const player1 = matchmakingQueue.shift();
        const player2 = matchmakingQueue.shift();
        return { player1, player2, mode: '2-player' };
    }

    return null; // Waiting for another player
}

module.exports = { addPlayerToMatchmaking };
