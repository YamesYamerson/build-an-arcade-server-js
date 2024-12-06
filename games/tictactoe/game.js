// Example Tic Tac Toe logic
export class TicTacToe {
    constructor() {
      this.board = Array(9).fill(null);
      this.currentPlayer = 'X';
    }
  
    makeMove(index) {
      if (this.board[index] === null) {
        this.board[index] = this.currentPlayer;
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      }
    }
  
    checkWinner() {
      // Check for a winner
    }
  }
  