document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // DOM Elements
    const nameEntry = document.getElementById('nameEntry');
    const modeSelection = document.getElementById('modeSelection');
    const gameGallery = document.getElementById('gameGallery');
    const matchStatus = document.getElementById('matchStatus');
    const matchMessage = document.getElementById('matchMessage');

    let nickname = '';

    // Utility Functions for Logging
    const logInfo = (message) => console.log(`[INFO] [${new Date().toISOString()}]: ${message}`);
    const logError = (message) => console.error(`[ERROR] [${new Date().toISOString()}]: ${message}`);
    const logSuccess = (message) => console.log(`[SUCCESS] [${new Date().toISOString()}]: ${message}`);

    logInfo('Lobby page loaded and DOM fully parsed.');

    // Check for an existing session and nickname
    fetch('/check-session')
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                logSuccess(`Session validated. Welcome back, ${data.nickname}`);
                nickname = data.nickname;
                nameEntry.style.display = 'none';
                modeSelection.style.display = 'block';
            } else {
                logInfo('No valid session or nickname found.');
                nameEntry.style.display = 'block';
            }
        })
        .catch((error) => {
            logError(`Error checking session: ${error.message}`);
            nameEntry.style.display = 'block';
        });

    // Handle Name Submission
    document.getElementById('submitName').addEventListener('click', () => {
        nickname = document.getElementById('playerName').value.trim();
        if (nickname === '') {
            logError('Name submission failed: No name entered.');
            alert('Please enter a name.');
            return;
        }

        logInfo(`Submitting nickname: ${nickname}`);
        fetch('/set-nickname', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    logSuccess(`Nickname successfully set: ${nickname}`);
                    nameEntry.style.display = 'none';
                    modeSelection.style.display = 'block';
                    logInfo('Navigated to game mode selection.');
                } else {
                    logError(`Failed to set nickname: ${data.message || 'Unknown error'}`);
                    alert(data.message || 'Failed to set name.');
                }
            })
            .catch((error) => {
                logError(`Error during nickname submission: ${error.message}`);
                alert('An error occurred while setting your name. Please try again.');
            });
    });

    // Handle 1 Player Mode
    document.getElementById('onePlayer').addEventListener('click', () => {
        logInfo('1 Player Mode selected.');
        modeSelection.style.display = 'none';
        gameGallery.style.display = 'block';
        logInfo('Navigated to game gallery.');
    });

    // Handle Game Selection
    document.querySelectorAll('.gameButton').forEach((button) => {
        button.addEventListener('click', () => {
            const gameName = button.getAttribute('data-game');
            logInfo(`Attempting to load game: ${gameName}`);

            fetch(`/load-game/${gameName}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        logSuccess(`Game loaded successfully: ${gameName}`);
                        window.location.href = `/${gameName}.html`;
                    } else {
                        logError(`Failed to load game: ${gameName}. Message: ${data.message}`);
                        alert(data.message || 'Failed to load the game.');
                    }
                })
                .catch((error) => {
                    logError(`Error loading game: ${gameName}. Error: ${error.message}`);
                    alert('An error occurred while loading the game. Please try again.');
                });
        });
    });

    // Back to Mode Selection
    document.getElementById('backToModeSelection').addEventListener('click', () => {
        logInfo('Returning to mode selection from game gallery.');
        gameGallery.style.display = 'none';
        modeSelection.style.display = 'block';
    });

    // Handle 2 Player Mode
    document.getElementById('twoPlayer').addEventListener('click', () => {
        logInfo('2 Player Mode selected.');
        modeSelection.style.display = 'none';
        matchStatus.style.display = 'block';

        logInfo('Joining matchmaking...');
        socket.emit('join-matchmaking');
    });

    // Handle Match Found
    socket.on('match-found', (data) => {
        logSuccess(`Match found! Opponent: ${data.nickname || 'Player'}`);
        matchMessage.innerText = `Match found! ${data.nickname || 'Player'} is ready to play with you.`;
    });

    // Handle Socket Errors
    socket.on('error', (errorMessage) => {
        logError(`Socket error: ${errorMessage}`);
        alert(errorMessage);
    });

    logInfo('All event listeners initialized.');
});
