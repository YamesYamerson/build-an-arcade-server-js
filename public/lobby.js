document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // DOM Elements
    const nameEntry = document.getElementById('nameEntry');
    const modeSelection = document.getElementById('modeSelection');
    const gameGallery = document.getElementById('gameGallery');
    const matchStatus = document.getElementById('matchStatus');
    const matchMessage = document.getElementById('matchMessage');
    const lobbyContainer = document.querySelector('.lobby-container');
    
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

        // Modify game buttons for one-player mode
        document.querySelectorAll('.gameButton').forEach((button) => {
            button.dataset.mode = 'one-player';
        });
    });

    // Handle 2 Player Mode
    document.getElementById('twoPlayer').addEventListener('click', () => {
        logInfo('2 Player Mode selected.');
        modeSelection.style.display = 'none';
        gameGallery.style.display = 'block';

        // Modify game buttons for two-player mode
        document.querySelectorAll('.gameButton').forEach((button) => {
            button.dataset.mode = 'two-player';
        });
    });

    // Handle Game Selection
    document.querySelectorAll('.gameButton').forEach((button) => {
        button.addEventListener('click', () => {
            const gameName = button.getAttribute('data-game');
            const mode = button.getAttribute('data-mode');
            logInfo(`Attempting to load game: ${gameName} in mode: ${mode}`);
            loadGame(gameName, mode);
        });
    });

    // Back to Mode Selection
    document.getElementById('backToModeSelection').addEventListener('click', () => {
        logInfo('Returning to mode selection from game gallery.');
        gameGallery.style.display = 'none';
        modeSelection.style.display = 'block';
    });

    // Handle Matchmaking
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

    // Load Game Function
    async function loadGame(gameName, mode) {
        logInfo(`Loading game: ${gameName}`);
        lobbyContainer.innerHTML = ''; // Clear the lobby content

        try {
            const gameModule = await import(`./games/${gameName}.js`); // Dynamically import the game module
            gameModule.initializeGame(lobbyContainer, socket, mode); // Pass the mode to the game logic
        } catch (error) {
            logError(`Failed to load game module: ${error.message}`);
            alert(`Game "${gameName}" is not available.`);
        }
    }

    // Handle Socket Errors
    socket.on('error', (errorMessage) => {
        logError(`Socket error: ${errorMessage}`);
        alert(errorMessage);
    });

    logInfo('All event listeners initialized.');
});
