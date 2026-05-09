const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("bestScore");
const finalScoreEl = document.getElementById("finalScore");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const pauseButton = document.getElementById("pauseButton");
const touchButtons = document.querySelectorAll(".touch-btn");

const gridSize = 24;
const tileCount = canvas.width / gridSize;
const gameSpeed = 115;

let snake;
let food;
let direction;
let nextDirection;
let score;
let bestScore;
let gameLoop;
let isRunning;
let isPaused;

function getSavedBestScore() {
  return Number(localStorage.getItem("snakeBestScore")) || 0;
}

function saveBestScore() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("snakeBestScore", String(bestScore));
    bestScoreEl.textContent = bestScore;
  }
}

function resetGame() {
  snake = [
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  isRunning = false;
  isPaused = false;
  scoreEl.textContent = score;
  pauseButton.textContent = "Pause";
  placeFood();
  draw();
}

function startGame() {
  resetGame();
  isRunning = true;
  startScreen.classList.remove("is-visible");
  gameOverScreen.classList.remove("is-visible");
  clearInterval(gameLoop);
  gameLoop = setInterval(updateGame, gameSpeed);
}

function endGame() {
  clearInterval(gameLoop);
  isRunning = false;
  saveBestScore();
  finalScoreEl.textContent = score;
  gameOverScreen.classList.add("is-visible");
}

function togglePause() {
  if (!isRunning) {
    return;
  }

  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? "Resume" : "Pause";
}

function updateGame() {
  if (isPaused) {
    return;
  }

  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  if (hitWall(head) || hitSnake(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function hitWall(position) {
  return (
    position.x < 0 ||
    position.x >= tileCount ||
    position.y < 0 ||
    position.y >= tileCount
  );
}

function hitSnake(position) {
  return snake.some((segment) => segment.x === position.x && segment.y === position.y);
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
}

function draw() {
  drawBoard();
  drawFood();
  drawSnake();
}

function drawBoard() {
  ctx.fillStyle = "#0b0f16";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#252b39";
  ctx.lineWidth = 1;

  for (let position = 0; position <= canvas.width; position += gridSize) {
    ctx.beginPath();
    ctx.moveTo(position, 0);
    ctx.lineTo(position, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, position);
    ctx.lineTo(canvas.width, position);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    const inset = index === 0 ? 3 : 4;
    ctx.fillStyle = index === 0 ? "#38f27b" : "#22c767";
    ctx.fillRect(
      segment.x * gridSize + inset,
      segment.y * gridSize + inset,
      gridSize - inset * 2,
      gridSize - inset * 2
    );

    if (index === 0) {
      ctx.fillStyle = "#07100b";
      ctx.fillRect(segment.x * gridSize + 8, segment.y * gridSize + 8, 4, 4);
      ctx.fillRect(segment.x * gridSize + 15, segment.y * gridSize + 8, 4, 4);
    }
  });
}

function drawFood() {
  const centerX = food.x * gridSize + gridSize / 2;
  const centerY = food.y * gridSize + gridSize / 2;

  ctx.fillStyle = "#ff4d8d";
  ctx.beginPath();
  ctx.arc(centerX, centerY, gridSize * 0.34, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(centerX - 3, centerY - 3, gridSize * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

function setDirection(newDirection) {
  const isOpposite =
    newDirection.x + direction.x === 0 &&
    newDirection.y + direction.y === 0;

  if (!isOpposite) {
    nextDirection = newDirection;
  }
}

function handleKeydown(event) {
  const keyMap = {
    ArrowUp: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    W: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    S: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    A: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
    D: { x: 1, y: 0 }
  };

  if (keyMap[event.key]) {
    event.preventDefault();
    setDirection(keyMap[event.key]);
  }

  if (event.key === " " || event.key === "Escape") {
    event.preventDefault();
    togglePause();
  }
}

function handleTouchControl(event) {
  const directionName = event.currentTarget.dataset.direction;
  const directionMap = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };

  setDirection(directionMap[directionName]);
}

bestScore = getSavedBestScore();
bestScoreEl.textContent = bestScore;

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);
document.addEventListener("keydown", handleKeydown);
touchButtons.forEach((button) => button.addEventListener("click", handleTouchControl));

resetGame();
