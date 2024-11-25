document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const nameEntry = document.getElementById('nameEntry');
    const modeSelection = document.getElementById('modeSelection');
    const gameGallery = document.getElementById('gameGallery');
    const matchStatus = document.getElementById('matchStatus');
    const matchMessage = document.getElementById('matchMessage');

    let nickname = '';

    // Step 1: Handle name submission
    document.getElementById('submitName').addEventListener('click', () => {
        nickname = document.getElementById('playerName').value.trim();
        if (nickname === '') {
            alert('Please enter a name.');
            return;
        }

        // Send nickname to the server to create a session
        fetch('/set-nickname', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    nameEntry.style.display = 'none';
                    modeSelection.style.display = 'block';
                } else {
                    alert(data.message || 'Failed to set name.');
                }
            });
    });

    // Step 2: Handle 1 Player Mode
    document.getElementById('onePlayer').addEventListener('click', () => {
        modeSelection.style.display = 'none';
        gameGallery.style.display = 'block';
    });

    // Step 3: Handle Game Selection in 1 Player Mode
    document.querySelectorAll('.gameButton').forEach(button => {
        button.addEventListener('click', () => {
            const gameName = button.getAttribute('data-game');
            fetch(`/load-game/${gameName}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = `/${gameName}.html`;
                    } else {
                        alert(data.message || 'Failed to load the game.');
                    }
                });
        });
    });

    // Back to mode selection from game gallery
    document.getElementById('backToModeSelection').addEventListener('click', () => {
        gameGallery.style.display = 'none';
        modeSelection.style.display = 'block';
    });

    // Step 4: Handle 2 Player Mode
    document.getElementById('twoPlayer').addEventListener('click', () => {
        modeSelection.style.display = 'none';
        matchStatus.style.display = 'block';
        socket.emit('join-matchmaking');
    });

    // Handle Match Found
    socket.on('match-found', (data) => {
        matchMessage.innerText = `Match found! Welcome, ${data.nickname || 'Guest'}. ${data.message}`;
    });

    // Handle Errors
    socket.on('error', (errorMessage) => {
        alert(errorMessage);
    });
});
