export function initializeGame(container, socket, mode = 'one-player') {
    console.log('[INFO] Tic Tac Toe initialized.');

    let playerPiece = '';
    let opponentPiece = '';
    let currentPlayer = ''; // 'player1' or 'player2/AI'
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let player1Score = 0;
    let player2Score = 0;

    // Create Game UI
    const title = document.createElement('h1');
    title.textContent = mode === 'one-player' ? 'Tic Tac Toe (1 Player)' : 'Tic Tac Toe (2 Players)';

    const scorecard = document.createElement('div');
    scorecard.id = 'scorecard';
    scorecard.innerHTML = `
        <p>Player 1: <span id="player1Score">0</span></p>
        <p>${mode === 'one-player' ? 'AI' : 'Player 2'}: <span id="player2Score">0</span></p>
    `;

    const board = document.createElement('div');
    board.id = 'board';

    const status = document.createElement('p');
    status.id = 'status';

    const modal = document.createElement('div');
    modal.id = 'gameModal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="modal-content">
            <p id="modalMessage"></p>
            <button id="playAgain">Play Again</button>
            <button id="backToGames">Back to Games</button>
        </div>
    `;

    // Append elements to the container
    container.innerHTML = ''; // Clear any existing content
    container.appendChild(title);
    container.appendChild(scorecard);
    container.appendChild(board);
    container.appendChild(status);
    container.appendChild(modal);

    // Function to Render the Board
    function renderBoard() {
        board.innerHTML = '';
        gameState.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            cellElement.textContent = cell;
            cellElement.dataset.index = index;
            board.appendChild(cellElement);
        });
    }

    // Check for Winner
    function checkWinner() {
        const winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];

        for (const combo of winningCombinations) {
            const [a, b, c] = combo;
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                return gameState[a];
            }
        }

        return gameState.includes('') ? null : 'draw';
    }

    // AI Logic
    function aiMove() {
        const availableSpaces = gameState
            .map((cell, index) => (cell === '' ? index : null))
            .filter((val) => val !== null);
        if (availableSpaces.length > 0) {
            const move = availableSpaces[Math.floor(Math.random() * availableSpaces.length)];
            gameState[move] = opponentPiece;
            currentPlayer = 'player1';
            renderBoard();
            const winner = checkWinner();
            if (winner) {
                handleGameOver(winner);
            } else {
                status.textContent = `Player 1 (${playerPiece})'s turn`;
            }
        }
    }

    // Handle Player Clicks
    function handleClick(event) {
        const index = event.target.dataset.index;
        if (index && !gameState[index]) {
            if (mode === 'one-player') {
                if (currentPlayer === 'player1') {
                    gameState[index] = playerPiece;
                    currentPlayer = 'AI';
                    renderBoard();
                    const winner = checkWinner();
                    if (winner) {
                        handleGameOver(winner);
                    } else {
                        status.textContent = `AI (${opponentPiece})'s turn`;
                        setTimeout(aiMove, 500);
                    }
                }
            } else {
                gameState[index] = currentPlayer === 'player1' ? playerPiece : opponentPiece;
                currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
                renderBoard();
                const winner = checkWinner();
                if (winner) {
                    handleGameOver(winner);
                } else {
                    status.textContent = `${currentPlayer === 'player1' ? 'Player 1' : 'Player 2'}'s turn`;
                }
            }
        }
    }

    board.addEventListener('click', handleClick);

    // Handle Game Over
    function handleGameOver(winner) {
        if (winner === 'draw') {
            status.textContent = 'It\'s a draw!';
        } else if (winner === playerPiece) {
            status.textContent = 'Player 1 wins!';
            player1Score++;
            document.getElementById('player1Score').textContent = player1Score;
        } else {
            status.textContent = `${mode === 'one-player' ? 'AI' : 'Player 2'} wins!`;
            player2Score++;
            document.getElementById('player2Score').textContent = player2Score;
        }

        showModal(winner === 'draw' ? 'It\'s a draw!' : `${winner === playerPiece ? 'Player 1' : (mode === 'one-player' ? 'AI' : 'Player 2')} wins!`);
    }

    // Show Modal
    function showModal(message) {
        document.getElementById('modalMessage').textContent = message;
        modal.style.display = 'block';
    }

    // Hide Modal
    function hideModal() {
        modal.style.display = 'none';
    }

    // Cleanup Function
    function cleanup() {
        // Remove board click listener
        board.removeEventListener('click', handleClick);

        // Clear the container
        container.innerHTML = '';

        // Restore the lobby
        const lobbyContainer = document.querySelector('.lobby-container');
        lobbyContainer.style.display = 'block';

        const gameGallery = document.getElementById('gameGallery');
        gameGallery.style.display = 'block'; // Show the game gallery
    }

    // Reset Game
    function resetGame() {
        gameState = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'player1';
        renderBoard();
        status.textContent = `${currentPlayer === 'player1' ? 'Player 1' : 'Player 2'}'s turn`;
        hideModal();
    }

    // Event Listeners for Modal Buttons
    modal.querySelector('#playAgain').addEventListener('click', resetGame);
    modal.querySelector('#backToGames').addEventListener('click', () => {
        cleanup(); // Perform cleanup and restore lobby
        socket.emit('back-to-games'); // Notify the server
    });

    // Initialize Game
    function startGame() {
        if (mode === 'one-player') {
            playerPiece = prompt('Choose your piece (X or O):', 'X').toUpperCase();
            while (!['X', 'O'].includes(playerPiece)) {
                playerPiece = prompt('Invalid choice. Please choose X or O:', 'X').toUpperCase();
            }
            opponentPiece = playerPiece === 'X' ? 'O' : 'X';
        } else {
            playerPiece = 'X';
            opponentPiece = 'O';
        }
        currentPlayer = 'player1';
        renderBoard();
        status.textContent = `${currentPlayer === 'player1' ? 'Player 1' : 'Player 2'}'s turn`;
    }

    startGame();
}
