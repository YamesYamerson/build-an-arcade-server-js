document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const nameEntry = document.getElementById('nameEntry');
    const modeSelection = document.getElementById('modeSelection');
    const matchStatus = document.getElementById('matchStatus');

    let playerName = '';

    // Step 1: Handle name submission
    document.getElementById('submitName').addEventListener('click', () => {
        playerName = document.getElementById('playerName').value.trim();
        if (playerName === '') {
            alert('Please enter your name.');
            return;
        }
        nameEntry.style.display = 'none';
        modeSelection.style.display = 'block';
    });

    // Step 2: Handle game mode selection
    document.getElementById('onePlayer').addEventListener('click', () => {
        startSinglePlayerGame();
    });

    document.getElementById('twoPlayer').addEventListener('click', () => {
        startMatchmaking();
    });

    // 1 Player Mode: Load the game directly
    function startSinglePlayerGame() {
        fetch('/load-game/tic-tac-toe')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/tic-tac-toe.html';
                } else {
                    alert(data.message || 'Failed to start the game.');
                }
            });
    }

    // 2 Player Mode: Enter matchmaking
    function startMatchmaking() {
        modeSelection.style.display = 'none';
        matchStatus.style.display = 'block';
        matchStatus.innerText = 'Searching for a match...';

        socket.emit('join-matchmaking', { playerName, mode: '2-player' });
    }

    // Handle match found
    socket.on('match-found', (match) => {
        matchStatus.innerText = 
            `Match found! Players: ${match.player1.name} vs ${match.player2?.name || 'Waiting...'}`;
    });
});
