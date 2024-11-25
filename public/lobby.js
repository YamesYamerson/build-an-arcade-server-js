document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const nameEntry = document.getElementById('nameEntry');
    const modeSelection = document.getElementById('modeSelection');
    const gameGallery = document.getElementById('gameGallery');
    const matchStatus = document.getElementById('matchStatus');
    const matchMessage = document.getElementById('matchMessage');

    let nickname = '';

    // Utility function for logging
    const logInfo = (message) => console.log(`[INFO]: ${message}`);
    const logError = (message) => console.error(`[ERROR]: ${message}`);
    const logSuccess = (message) => console.log(`[SUCCESS]: ${message}`);

    logInfo('DOM fully loaded and parsed.');

    // Step 1: Handle name submission
    document.getElementById('submitName').addEventListener('click', () => {
        nickname = document.getElementById('playerName').value.trim();
        if (nickname === '') {
            logError('Name submission failed: No name entered.');
            alert('Please enter a name.');
            return;
        }

        logInfo(`Submitting name: ${nickname}`);
        fetch('/set-nickname', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    logSuccess(`Name set successfully: ${nickname}`);
                    nameEntry.style.display = 'none';
                    modeSelection.style.display = 'block';
                } else {
                    logError(`Name submission failed: ${data.message || 'Unknown error'}`);
                    alert(data.message || 'Failed to set name.');
                }
            })
            .catch(error => {
                logError(`Error in name submission: ${error.message}`);
                alert('An error occurred while setting your name. Please try again.');
            });
    });

    // Step 2: Handle 1 Player Mode
    document.getElementById('onePlayer').addEventListener('click', () => {
        logInfo('1 Player Mode selected.');
        modeSelection.style.display = 'none';
        gameGallery.style.display = 'block';
    });

    // Handle Game Selection
    document.querySelectorAll('.gameButton').forEach(button => {
        button.addEventListener('click', () => {
            const gameName = button.getAttribute('data-game');
            logInfo(`Attempting to load game: ${gameName}`);

            fetch(`/load-game/${gameName}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        logSuccess(`Game loaded successfully: ${gameName}`);
                        window.location.href = `/${gameName}.html`;
                    } else {
                        logError(`Failed to load game: ${gameName}. Message: ${data.message}`);
                        alert(data.message || 'Failed to load the game.');
                    }
                })
                .catch(error => {
                    logError(`Error loading game: ${gameName}. Error: ${error.message}`);
                    alert('An error occurred while loading the game. Please try again.');
                });
        });
    });

    // Back to mode selection
    document.getElementById('backToModeSelection').addEventListener('click', () => {
        logInfo('Returning to mode selection from game gallery.');
        gameGallery.style.display = 'none';
        modeSelection.style.display = 'block';
    });

    // Step 3: Handle 2 Player Mode
    document.getElementById('twoPlayer').addEventListener('click', () => {
        logInfo('2 Player Mode selected.');
        modeSelection.style.display = 'none';
        matchStatus.style.display = 'block';
        logInfo('Joining matchmaking...');
        socket.emit('join-matchmaking');
    });

    // Handle Match Found
    socket.on('match-found', (data) => {
        logSuccess(`Match found: ${data.nickname || 'Player'}`);
        matchMessage.innerText = `Match found! ${data.nickname || 'Player'} is ready to play with you.`;
    });

    // Handle Errors
    socket.on('error', (errorMessage) => {
        logError(`Socket error received: ${errorMessage}`);
        alert(errorMessage);
    });

    logInfo('Event listeners initialized.');
});
