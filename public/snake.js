const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Constants for the game
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
let score = 0;

// Draw the snake and the food
function draw() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  snake.forEach((segment) => {
    ctx.fillStyle = 'green';
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
  });

  // Draw food
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  // Draw score
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 20);
}

// Update snake's position
function updateSnake() {
  // Move the snake's head
  const newHead = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  // Check if the snake eats the food
  if (newHead.x === food.x && newHead.y === food.y) {
    score += 1;
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } else {
    snake.pop(); // Remove the last segment if not eating food
  }

  // Check for wall collision
  if (newHead.x < 0 || newHead.x >= tileCount || newHead.y < 0 || newHead.y >= tileCount) {
    resetGame();
    return;
  }

  // Check for self-collision
  if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
    resetGame();
    return;
  }

  // Add the new head to the front of the snake
  snake.unshift(newHead);
}

// Handle keyboard input for controlling the snake
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
      if (direction.y === 0) direction = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
      if (direction.y === 0) direction = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
      if (direction.x === 0) direction = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
      if (direction.x === 0) direction = { x: 1, y: 0 };
      break;
  }
});

// Reset game function when the snake hits a wall or itself
function resetGame() {
  alert(`Game Over! Your score: ${score}`);
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  score = 0;
  food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
}

// Main game loop
function gameLoop() {
  updateSnake();
  draw();
  setTimeout(gameLoop, 100); // Adjust speed by changing the delay here
}

gameLoop(); // Start the game loop
