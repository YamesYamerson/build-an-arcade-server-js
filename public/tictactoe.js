export function initializeGame(container, socket) {
    console.log('[INFO] Tic Tac Toe initialized.');

    // Create the Tic Tac Toe structure
    const title = document.createElement('h1');
    title.textContent = 'Tic Tac Toe';

    const board = document.createElement('div');
    board.id = 'board';

    const status = document.createElement('p');
    status.id = 'status';

    container.appendChild(title);
    container.appendChild(board);
    container.appendChild(status);

    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];

    // Render the board
    function renderBoard() {
        board.innerHTML = ''; // Clear the board
        gameState.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            cellElement.textContent = cell;
            cellElement.dataset.index = index;
            board.appendChild(cellElement);
        });
    }

    // Check for winner
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

    // Handle click events
    board.addEventListener('click', (event) => {
        const index = event.target.dataset.index;
        if (index && !gameState[index]) {
            gameState[index] = currentPlayer;
            renderBoard();

            const winner = checkWinner();
            if (winner) {
                status.textContent = winner === 'draw' ? 'It\'s a draw!' : `Player ${winner} wins!`;
                socket.emit('game-over', { winner });
                return;
            }

            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            socket.emit('move', { gameState, currentPlayer });
        }
    });

    // Listen for moves from other players
    socket.on('move', (data) => {
        gameState = data.gameState;
        currentPlayer = data.currentPlayer;
        renderBoard();
        status.textContent = `Player ${currentPlayer}'s turn`;
    });

    // Listen for game-over event
    socket.on('game-over', (data) => {
        status.textContent = data.winner === 'draw' ? 'It\'s a draw!' : `Player ${data.winner} wins!`;
    });

    // Initialize the board
    renderBoard();
}
