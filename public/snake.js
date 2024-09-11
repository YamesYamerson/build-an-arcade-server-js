import Middleware from './middleware.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Snake, food, and direction initialization
let snake = [{ x: 200, y: 200 }];
let direction = { x: 0, y: 0 };
let food = { x: 100, y: 100 };

const socket = io();  // Socket.io initialization
const middleware = new Middleware(socket);  // Middleware setup
middleware.handleServerRequests();  // Handling server requests

// Draw the snake and food on the canvas
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas

  // Draw the snake
  snake.forEach((segment) => {
    ctx.fillStyle = 'green';
    ctx.fillRect(segment.x, segment.y, 20, 20);
  });

  // Draw the food
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x, food.y, 20, 20);
}

// Update snake's position based on direction
function updateSnake() {
  const newSegment = {
    x: snake[0].x + direction.x * 20,
    y: snake[0].y + direction.y * 20,
  };

  // Add new head position
  snake.unshift(newSegment);
  // Remove the tail segment
  snake.pop();
}

// Handle keyboard input for controlling the snake
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
      direction = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
      direction = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
      direction = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
      direction = { x: 1, y: 0 };
      break;
  }

  middleware.sendMove({ direction });  // Send move data to server
});

// Main game loop
function gameLoop() {
  updateSnake();
  draw();
  requestAnimationFrame(gameLoop);  // Keep the game running
}

gameLoop();  // Start the game loop
