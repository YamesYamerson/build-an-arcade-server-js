class Middleware {
    constructor(socket) {
      this.socket = socket;
    }
  
    handleServerRequests() {
      this.socket.on('startGame', (data) => {
        console.log(`Game starting in room: ${data.room}`);
      });
  
      this.socket.on('opponentMove', (data) => {
        this.updateGameState(data);
      });
  
      this.socket.on('waiting', (message) => {
        console.log(message);
      });
    }
  
    sendMove(moveData) {
      this.socket.emit('move', moveData);
    }
  
    updateGameState(data) {
      // Update game state based on opponent's move
    }
  }
  
  export default Middleware;
  