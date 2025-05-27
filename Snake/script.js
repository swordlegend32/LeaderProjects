const gameCanvas = document.getElementById("game");
const gameContext = gameCanvas.getContext("2d");

const ScoreP = document.getElementById("Score");
const HighScoreP = document.getElementById("High Score");

const cellSize = 20;
const gridCount = gameCanvas.width / cellSize;

let snakeBody = [{ x: 10, y: 10 }];
let movementDirection = { x: 0, y: 1 };
let foodPosition = { x: 15, y: 15 };
let currentScore = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let isGameActive = false;

let lastUpdateTime = 0;
let updateInterval = 100;


function gameLoop(currentTime) {
  if (!isGameActive) {
    requestAnimationFrame(gameLoop);
    return;
  }

  const timeElapsed = currentTime - lastUpdateTime;

  if (timeElapsed >= updateInterval) {
    lastUpdateTime = currentTime;
    updateGame();
  }

  renderGame();
  requestAnimationFrame(gameLoop);
}

function updateGame() {
  const snakeHead = { x: snakeBody[0].x + movementDirection.x, y: snakeBody[0].y + movementDirection.y };

  if (
    snakeHead.x < 0 || snakeHead.y < 0 ||
    snakeHead.x >= gridCount || snakeHead.y >= gridCount ||
    snakeBody.some(segment => segment.x === snakeHead.x && segment.y === snakeHead.y)
  ) {
    if (currentScore > bestScore) {
      bestScore = currentScore;
      localStorage.setItem("bestScore", bestScore);
    }
    alert(`Game Over! Score: ${currentScore} | Best Score: ${bestScore}`);
    resetGame();
    return;
  }



  snakeBody.unshift(snakeHead);

  if (snakeHead.x === foodPosition.x && snakeHead.y === foodPosition.y) {
    currentScore++;
    foodPosition = {
      x: Math.floor(Math.random() * gridCount),
      y: Math.floor(Math.random() * gridCount)
    };

    updateInterval = Math.max(50, 100 - currentScore * 2);
  } else {
    snakeBody.pop();
  }
}

function renderGame() {
  gameContext.fillStyle = "#111";
  gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  snakeBody.forEach((segment, index) => {
    if (index === 0) {
      gameContext.fillStyle = "yellow";
    } else {
      gameContext.fillStyle = "lime";
    }
    gameContext.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize - 2, cellSize - 2);
  });

  gameContext.fillStyle = "red";
  gameContext.fillRect(foodPosition.x * cellSize, foodPosition.y * cellSize, cellSize - 2, cellSize - 2);

  gameContext.fillStyle = "#0f0";
  gameContext.font = "16px Arial";
  ScoreP.innerHTML = `Score: ${currentScore}`;
  HighScoreP.innerHTML = `High Score: ${bestScore}`;
}

function resetGame() {
  snakeBody = [{ x: 10, y: 10 }];
  movementDirection = { x: 0, y: 0 };
  foodPosition = { x: 15, y: 15 };
  currentScore = 0;
  updateInterval = 100;
  isGameActive = false;
}

document.addEventListener("keydown", event => {
  if (!isGameActive) isGameActive = true;
  if (event.key === "ArrowUp" && movementDirection.y === 0) movementDirection = { x: 0, y: -1 };
  if (event.key === "ArrowDown" && movementDirection.y === 0) movementDirection = { x: 0, y: 1 };
  if (event.key === "ArrowLeft" && movementDirection.x === 0) movementDirection = { x: -1, y: 0 };
  if (event.key === "ArrowRight" && movementDirection.x === 0) movementDirection = { x: 1, y: 0 };
});

requestAnimationFrame(gameLoop);