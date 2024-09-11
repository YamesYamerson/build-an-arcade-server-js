const boardElement = document.getElementById('ticTacToeBoard');
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

// Render the board
function renderBoard() {
  boardElement.innerHTML = '';
  board.forEach((cell, index) => {
    const cellElement = document.createElement('div');
    cellElement.classList.add('cell');
    cellElement.textContent = cell;
    cellElement.addEventListener('click', () => makeMove(index));
    boardElement.appendChild(cellElement);
  });
}

function makeMove(index) {
  if (board[index] !== '') return; // Prevent overriding moves
  board[index] = currentPlayer;
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  renderBoard();
  checkWinner();
}

function checkWinner() {
  let winner = null;
  winningCombinations.forEach(combination => {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      winner = board[a];
    }
  });
  if (winner) {
    setTimeout(() => alert(`${winner} wins!`), 100);
    resetGame();
  } else if (!board.includes('')) {
    setTimeout(() => alert(`It's a draw!`), 100);
    resetGame();
  }
}

function resetGame() {
  board = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  renderBoard();
}

// Initial board render
renderBoard();
