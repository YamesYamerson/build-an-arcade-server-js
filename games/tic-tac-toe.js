module.exports = (io) => {
    const players = {};
    let board = Array(3).fill(null).map(() => Array(3).fill(''));
    let currentPlayer = 'X';

    function resetGame() {
        board = Array(3).fill(null).map(() => Array(3).fill(''));
        currentPlayer = 'X';
    }

    io.on('connection', (socket) => {
        console.log(`Tic Tac Toe: Player connected: ${socket.id}`);

        // Add player to the game
        players[socket.id] = currentPlayer;
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

        // Send board state to the player
        socket.emit('board-update', board);

        // Handle player move
        socket.on('make-move', ({ row, col }) => {
            if (board[row][col] === '' && players[socket.id] === currentPlayer) {
                board[row][col] = currentPlayer;

                // Check for a winner
                const winner = checkWinner();
                if (winner) {
                    io.emit('game-over', { winner });
                    resetGame();
                } else {
                    // Switch player turn
                    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                    io.emit('board-update', board);
                }
            }
        });

        // Handle player disconnect
        socket.on('disconnect', () => {
            console.log(`Tic Tac Toe: Player disconnected: ${socket.id}`);
            delete players[socket.id];
        });

        // Check for a winner
        function checkWinner() {
            const lines = [
                // Rows
                [ [0, 0], [0, 1], [0, 2] ],
                [ [1, 0], [1, 1], [1, 2] ],
                [ [2, 0], [2, 1], [2, 2] ],
                // Columns
                [ [0, 0], [1, 0], [2, 0] ],
                [ [0, 1], [1, 1], [2, 1] ],
                [ [0, 2], [1, 2], [2, 2] ],
                // Diagonals
                [ [0, 0], [1, 1], [2, 2] ],
                [ [0, 2], [1, 1], [2, 0] ]
            ];

            for (let line of lines) {
                const [a, b, c] = line;
                if (board[a[0]][a[1]] &&
                    board[a[0]][a[1]] === board[b[0]][b[1]] &&
                    board[a[0]][a[1]] === board[c[0]][c[1]]) {
                    return board[a[0]][a[1]];
                }
            }
            return null;
        }
    });
};
