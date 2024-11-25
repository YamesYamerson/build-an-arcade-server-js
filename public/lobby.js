const socket = io();

document.getElementById('joinMatchmaking').addEventListener('click', () => {
    const playerName = document.getElementById('playerName').value;
    if (playerName.trim() === '') {
        alert('Please enter your name.');
        return;
    }

    socket.emit('join-matchmaking', playerName);
    document.getElementById('matchStatus').innerText = 'Searching for a match...';
});

// Listen for match-found event
socket.on('match-found', (match) => {
    document.getElementById('matchStatus').innerText = 
        `Match found! ${match.player1.name} vs ${match.player2.name}`;
});
