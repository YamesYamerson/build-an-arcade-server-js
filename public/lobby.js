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

    // Logging Utilities
    const logInfo = (message) => console.log(`[INFO] [${new Date().toISOString()}]: ${message}`);
    const logError = (message) => console.error(`[ERROR] [${new Date().toISOString()}]: ${message}`);
    const logSuccess = (message) => console.log(`[SUCCESS] [${new Date().toISOString()}]: ${message}`);

    logInfo('Lobby page loaded.');

    // Check for existing session and nickname
    fetch('/check-session')
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                logSuccess(`Session validated. Welcome back, ${data.nickname}`);
                nickname = data.nickname;
                nameEntry.style.display = 'none';
                modeSelection.style.display = 'block';
            } else {
                logInfo('No valid session found.');
                nameEntry.style.display = 'block';
            }
        })
        .catch((error) => {
            logError(`Error checking session: ${error.message}`);
            nameEntry.style.display = 'block';
        });

    // Handle nickname submission
    document.getElementById('submitName').addEventListener('click', () => {
        nickname = document.getElementById('playerName').value.trim();
        if (!nickname) {
            logError('No nickname provided.');
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
                    logSuccess(`Nickname set to: ${nickname}`);
                    nameEntry.style.display = 'none';
                    modeSelection.style.display = 'block';
                } else {
                    logError(`Error setting nickname: ${data.message}`);
                    alert(data.message || 'Failed to set name.');
                }
            })
            .catch((error) => {
                logError(`Nickname submission error: ${error.message}`);
                alert('An error occurred. Please try again.');
            });
    });

    // Handle game mode selection
    document.getElementById('onePlayer').addEventListener('click', () => {
        logInfo('1 Player Mode selected.');
        modeSelection.style.display = 'none';
        gameGallery.style.display = 'block';
        setGameMode('one-player');
    });

    document.getElementById('twoPlayer').addEventListener('click', () => {
        logInfo('2 Player Mode selected.');
        modeSelection.style.display = 'none';
        matchStatus.style.display = 'block';

        logInfo('Joining matchmaking...');
        socket.emit('join-matchmaking');
    });

    // Handle game selection
    document.querySelectorAll('.gameButton').forEach((button) => {
        button.addEventListener('click', () => {
            const gameName = button.getAttribute('data-game');
            const mode = button.dataset.mode;
            logInfo(`Loading game: ${gameName}, Mode: ${mode}`);
            loadGame(gameName, mode);
        });
    });

    // Handle matchmaking result
    socket.on('match-found', (data) => {
        logSuccess(`Match found: Opponent nickname is ${data.nickname}`);
        matchMessage.innerText = `Match found! Opponent: ${data.nickname}`;
    });

    // Load game dynamically
    async function loadGame(gameName, mode) {
        try {
            logInfo(`Attempting to load game module: ${gameName}`);
    
            // Hide the lobby UI
            const lobbyContainer = document.querySelector('.lobby-container');
            lobbyContainer.style.display = 'none';
    
            // Clear any existing game UI
            const gameContainer = document.getElementById('gameContainer');
            gameContainer.innerHTML = ''; // Clear previous game content
            gameContainer.style.display = 'block'; // Make the game container visible
    
            // Load the game module dynamically
            const gameModule = await import(`./games/${gameName}/${gameName}.js`);
            logSuccess(`Game module ${gameName} loaded successfully.`);
    
            // Initialize the game in the game container
            gameModule.initializeGame(gameContainer, socket, mode);
        } catch (error) {
            logError(`Error loading game ${gameName}: ${error.message}`);
            alert(`Failed to load game "${gameName}".`);
    
            // Show the lobby again if game loading fails
            document.querySelector('.lobby-container').style.display = 'block';
            document.getElementById('gameContainer').style.display = 'none';
        }
    }
    

    function setGameMode(mode) {
        logInfo(`Setting game mode to: ${mode}`);
        document.querySelectorAll('.gameButton').forEach((button) => {
            button.dataset.mode = mode;
        });
    }
});
