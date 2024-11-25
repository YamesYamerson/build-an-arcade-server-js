class GameBoard {
    constructor(canvasId, width, height, aspectRatio) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.aspectRatio = aspectRatio;
        this.currentGame = null;
    }

    initialize() {
        const scale = Math.min(window.innerWidth / this.width, window.innerHeight / this.height);
        this.canvas.width = this.width * scale;
        this.canvas.height = this.height * scale;
        this.ctx.scale(scale, scale);
        console.log(`Canvas initialized: ${this.canvas.width}x${this.canvas.height}`);
    }

    setGame(gameInstance) {
        if (typeof gameInstance.update !== 'function' || typeof gameInstance.render !== 'function') {
            throw new Error('Game instance must implement `update` and `render` methods.');
        }
        this.currentGame = gameInstance;
    }

    gameLoop() {
        if (!this.currentGame) return;

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.currentGame.update();
        this.currentGame.render(this.ctx);
        requestAnimationFrame(() => this.gameLoop());
    }

    start() {
        if (!this.currentGame) {
            throw new Error('No game set. Use `setGame` to load a game before starting.');
        }
        this.gameLoop();
    }
}
