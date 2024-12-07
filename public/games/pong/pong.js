export function initializeGame(container, socket, mode = 'one-player') {
    console.log('[INFO] Pong Game Initialized');

    // Game Variables
    let player1Score = 0;
    let player2Score = 0;
    let ballX = 300;
    let ballY = 200;
    let ballSpeedX = 5;
    let ballSpeedY = 5;

    const paddleWidth = 10;
    const paddleHeight = 100;
    const player1PaddleY = { value: 150 };
    const player2PaddleY = { value: 150 }; // AI Paddle

    // Create Game UI
    const title = document.createElement('h1');
    title.textContent = mode === 'one-player' ? 'Pong (1 Player)' : 'Pong (2 Players)';

    const scorecard = document.createElement('div');
    scorecard.id = 'scorecard';
    scorecard.innerHTML = `
        <p>Player 1: <span id="player1Score">0</span></p>
        <p>${mode === 'one-player' ? 'AI' : 'Player 2'}: <span id="player2Score">0</span></p>
    `;

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    canvas.id = 'pongCanvas';
    const ctx = canvas.getContext('2d');

    container.appendChild(title);
    container.appendChild(scorecard);
    container.appendChild(canvas);

    // Paddle and Ball Drawing
    function drawRect(x, y, width, height, color = 'white') {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    }

    function drawCircle(x, y, radius, color = 'white') {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, true);
        ctx.fill();
    }

    // Reset Ball
    function resetBall() {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = -ballSpeedX;
        ballSpeedY = 5;
    }

    // Update Game State
    function updateGameState() {
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // Ball Collision with Top and Bottom Walls
        if (ballY <= 0 || ballY >= canvas.height) {
            ballSpeedY = -ballSpeedY;
        }

        // Ball Collision with Player 1 Paddle
        if (
            ballX <= paddleWidth &&
            ballY >= player1PaddleY.value &&
            ballY <= player1PaddleY.value + paddleHeight
        ) {
            ballSpeedX = -ballSpeedX;
        }

        // Ball Collision with Player 2 (AI) Paddle
        if (
            ballX >= canvas.width - paddleWidth &&
            ballY >= player2PaddleY.value &&
            ballY <= player2PaddleY.value + paddleHeight
        ) {
            ballSpeedX = -ballSpeedX;
        }

        // Ball Out of Bounds
        if (ballX <= 0) {
            player2Score++;
            document.getElementById('player2Score').textContent = player2Score;
            resetBall();
        } else if (ballX >= canvas.width) {
            player1Score++;
            document.getElementById('player1Score').textContent = player1Score;
            resetBall();
        }

        // AI Paddle Movement
        if (mode === 'one-player') {
            if (player2PaddleY.value + paddleHeight / 2 < ballY) {
                player2PaddleY.value += 5;
            } else {
                player2PaddleY.value -= 5;
            }
        }
    }

    // Render Game Elements
    function render() {
        // Clear Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Background
        drawRect(0, 0, canvas.width, canvas.height, 'black');

        // Draw Paddles
        drawRect(0, player1PaddleY.value, paddleWidth, paddleHeight);
        drawRect(canvas.width - paddleWidth, player2PaddleY.value, paddleWidth, paddleHeight);

        // Draw Ball
        drawCircle(ballX, ballY, 10);

        // Draw Divider
        for (let i = 0; i < canvas.height; i += 20) {
            drawRect(canvas.width / 2 - 1, i, 2, 10, 'white');
        }
    }

    // Game Loop
    function gameLoop() {
        updateGameState();
        render();
        requestAnimationFrame(gameLoop);
    }

    // Player 1 Paddle Control
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp') {
            player1PaddleY.value = Math.max(0, player1PaddleY.value - 10);
        } else if (event.key === 'ArrowDown') {
            player1PaddleY.value = Math.min(canvas.height - paddleHeight, player1PaddleY.value + 10);
        }
    });

    // Start Game
    gameLoop();
}
