function CollisionMask(data) {
    this.w = data.width;
    this.h = data.height;
    this.mask = [];
    for (let y = 0; y < this.h; ++y) {
      this.mask[y] = new Uint32Array(Math.ceil(this.w / 32));
      for (let x = 0; x < this.w; x += 32) {
        let bits = 0;
        for (let bit = 0; bit < 32; ++bit) {
          bits <<= 1;
          if (x + bit < this.w) {
            if (data.data[(y * data.width + x + bit) * 4 + 3] > 5) {
              bits += 1;
            }
          }
        }
        this.mask[y][Math.floor(x / 32)] = bits;
      }
    }
}
  
CollisionMask.prototype.collidesWith = function (other, dx, dy) {
    if (dx < 0) return other.collidesWith(this, -dx, -dy);
    if (dx > this.w) return false;
  
    let y1, y2;
    if (dy < 0) {
      if (other.h < -dy) return false;
      y1 = 0; y2 = Math.min(other.h + dy, this.h);
    } else {
      if (this.h < dy) return false;
      y1 = dy; y2 = Math.min(other.h + dy, this.h);
    }
  
    const x1 = dx, x2 = Math.min(this.w, other.w + dx);
    const lshift = dx % 32;
    const rshift = 32 - lshift;
    const x1scaled = Math.floor(x1 / 32);
    const x2scaled = Math.ceil(x2 / 32);
  
    for (let y = y1; y < y2; ++y) {
      const trow = this.mask[y];
      const orow = other.mask[y - dy];
      for (let x = x1scaled; x < x2scaled; ++x) {
        let bits = trow[x] << lshift;
        if (rshift < 32) bits |= (trow[x + 1] >>> rshift);
        if (orow[x - x1scaled] & bits) return true;
      }
    }
  
    return false;
};
  
const game = document.getElementById("game");
const P1 = document.getElementById("P1");
const P2 = document.getElementById("P2");
const ball = document.getElementById("ball");
  
const paddleCanvas = document.getElementById("paddleCanvas");
const paddleCtx = paddleCanvas.getContext("2d");
paddleCtx.fillStyle = "black";
paddleCtx.fillRect(0, 0, 20, 100);
const paddleMask = new CollisionMask(paddleCtx.getImageData(0, 0, 20, 100));
  
const ballCanvas = document.getElementById("ballCanvas");
const ballCtx = ballCanvas.getContext("2d");
ballCtx.fillStyle = "black";
ballCtx.beginPath();
ballCtx.arc(10, 10, 10, 0, Math.PI * 2);
ballCtx.fill();
const ballMask = new CollisionMask(ballCtx.getImageData(0, 0, 20, 20));
  
  
let p1Y = game.clientHeight / 2 - 50;
let p2Y = game.clientHeight / 2 - 50;
let ballX = game.clientWidth / 2 - 10;
let ballY = game.clientHeight / 2 - 10;
let ballSpeedX = 150;
let ballSpeedY = 300;

const paddleSpeed = 250; 

const StartingballSpeedX = paddleSpeed * 2;
const StartingballSpeedY = paddleSpeed - 20;

let lastTime = performance.now();

let p1Score = 0;
let p2Score = 0;

let InputDetected = false

const p1ScoreDisplay = document.getElementById("P1Score");
const p2ScoreDisplay = document.getElementById("P2Score");
  
function resetGame() {
    ballX = game.clientWidth / 2 - 10;
    ballY = game.clientHeight / 2 - 10;

    p1Y = game.clientHeight / 2 - 50;
    p2Y = game.clientHeight / 2 - 50;

    InputDetected = false

    ballSpeedX = (Math.random() < 0.5 ? -1 : 1) * StartingballSpeedX;
    ballSpeedY = (Math.random() < 0.5 ? -1 : 1) * StartingballSpeedY;
}
  
let p1Up = false;
let p1Down = false;

function updatePositions(dt) {
    ballX += ballSpeedX * dt;
    ballY += ballSpeedY * dt;
    
    if (p1Up) p1Y = Math.max(50, p1Y - paddleSpeed * dt);
    if (p1Down) p1Y = Math.min(game.clientHeight - 50, p1Y + paddleSpeed * dt);

    const aiReactionDelay = 0.85 + Math.random() * 0.15; 
    const aiRandomness = Math.random() * 15;

    if (ballY + 10 < p2Y + 50 - aiRandomness) {
        p2Y = Math.max(50, p2Y - paddleSpeed * dt * aiReactionDelay);
    } else if (ballY + 10 > p2Y + 50 + aiRandomness) {
        p2Y = Math.min(game.clientHeight - 50, p2Y + paddleSpeed * dt * aiReactionDelay);
    }

    if (ballY <= 0 || ballY >= game.clientHeight - 20) {
        ballSpeedY *= -1;
        ballY = Math.max(0, Math.min(game.clientHeight - 20, ballY));
    }

    if (ballX <= 0 || ballX >= game.clientWidth - 20) {
        resetGame();
        if (ballX <= 0) p2Score++;
        else p1Score++;
        p1ScoreDisplay.textContent = p1Score;
        p2ScoreDisplay.textContent = p2Score;
    }
}
function collisionDetection() {
    const paddleWidth = 20; 
    const paddleHeight = 100;
    const ballSize = 20; 

    const p1X = game.clientWidth * 0.1; 
    const p1YAdjusted = p1Y - paddleHeight / 2; 

    const p2X = game.clientWidth * 0.9 - paddleWidth; 
    const p2YAdjusted = p2Y - paddleHeight / 2;

    const ballXAdjusted = ballX - ballSize / 2; 
    const ballYAdjusted = ballY - ballSize / 2; 

    if (ballSpeedX < 0) {
        if (
            ballXAdjusted <= p1X + paddleWidth &&
            ballXAdjusted + ballSize >= p1X &&
            ballYAdjusted + ballSize >= p1YAdjusted &&
            ballYAdjusted <= p1YAdjusted + paddleHeight
        ) {
            ballSpeedX *= -1.05; 
            ballSpeedY *= 1.05; 
            ballX = p1X + paddleWidth + ballSize / 2; 
        }
    } else {
        if (
            ballXAdjusted + ballSize >= p2X &&
            ballXAdjusted <= p2X + paddleWidth &&
            ballYAdjusted + ballSize >= p2YAdjusted &&
            ballYAdjusted <= p2YAdjusted + paddleHeight
        ) {
            ballSpeedX *= -1.05;
            ballSpeedY *= 1.05;
            ballX = p2X - ballSize / 2; 
        }
    }
}
  
function render() {
    P1.style.top = `${p1Y}px`;
    P2.style.top = `${p2Y}px`;
    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
}
  


function gameLoop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    if (!InputDetected) return; 
  
    updatePositions(dt);
    collisionDetection();
    render();
}
  
document.addEventListener("keydown", (e) => {
    InputDetected = true
    if (e.key === "w") p1Up = true;
    if (e.key === "s") p1Down = true;
  });
  
document.addEventListener("keyup", (e) => {
    if (e.key === "w") p1Up = false;
    if (e.key === "s") p1Down = false;
});

function StartGame() {
    resetGame();

    let nextGameTick = performance.now();
    const skipTicks = 1000 / 60; 
    const maxFrameSkip = 10;

    function loop(timestamp) {
        let Ticks = 0;

        while (performance.now() > nextGameTick && Ticks < maxFrameSkip) {
            gameLoop(nextGameTick);
            nextGameTick += skipTicks;
            Ticks++;
        }

        render();

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

StartGame();