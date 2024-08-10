const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Create a secondary canvas for tracking coverage
const coverageCanvas = document.createElement('canvas');
const coverageCtx = coverageCanvas.getContext('2d');
coverageCanvas.width = canvas.width;
coverageCanvas.height = canvas.height;
document.body.appendChild(coverageCanvas);
coverageCanvas.style.position = 'absolute';
coverageCanvas.style.top = '0';
coverageCanvas.style.left = '0';
coverageCanvas.style.pointerEvents = 'none'; // Prevent interactions with the coverage canvas
const scoreBoard = document.getElementById('scoreBoard');

// Player class
class Player {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.originalColor = color;
        this.radius = 20;
        this.speed = 5;
        this.direction = { x: 0, y: 0 };
        this.powerUpTime = 0;
        this.powerUpColor = null;
    }

    move() {
        this.x += this.direction.x * this.speed;
        this.y += this.direction.y * this.speed;
        this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
    }

    draw() {
        // Paint the canvas under the player
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        // Update coverage canvas
        coverageCtx.beginPath();
        coverageCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        coverageCtx.fillStyle = this.color;
        coverageCtx.globalCompositeOperation = 'source-over'; // Default composite operation
        coverageCtx.fill();
    }

    update() {
        this.move();
        this.draw();
        if (this.powerUpTime > 0) {
            this.powerUpTime--;
            if (this.powerUpTime <= 0) {
                this.color = this.originalColor;
                this.speed = 5; // Reset speed after power-up ends
            }
        }
    }

    activatePowerUp(color, duration, speedBoost = 0) {
        this.powerUpColor = color;
        this.powerUpTime = duration;
        this.originalColor = this.color;
        this.color = color;
        this.speed += speedBoost;
    }
}

// Create players
const player1 = new Player(100, canvas.height / 2, 'red');
const player2 = new Player(canvas.width - 100, canvas.height / 2, 'blue');

// Power-up class
class PowerUp {
    constructor(x, y, color, speedBoost = 0) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.speedBoost = speedBoost;
        this.radius = 10;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.draw();
    }
}

// Create power-ups
const powerUps = [
    new PowerUp(Math.random() * canvas.width, Math.random() * canvas.height, 'green', 2),
    new PowerUp(Math.random() * canvas.width, Math.random() * canvas.height, 'yellow', 2)
];

// Obstacle class
class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw() {
        ctx.fillStyle = 'grey';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.draw();
    }
}

// Create obstacles
const obstacles = [
    new Obstacle(canvas.width / 4, canvas.height / 4, 50, 50),
    new Obstacle(canvas.width / 2, canvas.height / 2, 100, 100)
];

// Handle player movement
window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'w': player1.direction.y = -1; break;
        case 's': player1.direction.y = 1; break;
        case 'a': player1.direction.x = -1; break;
        case 'd': player1.direction.x = 1; break;
        case 'ArrowUp': player2.direction.y = -1; break;
        case 'ArrowDown': player2.direction.y = 1; break;
        case 'ArrowLeft': player2.direction.x = -1; break;
        case 'ArrowRight': player2.direction.x = 1; break;
    }
});

window.addEventListener('keyup', e => {
    switch (e.key) {
        case 'w': case 's': player1.direction.y = 0; break;
        case 'a': case 'd': player1.direction.x = 0; break;
        case 'ArrowUp': case 'ArrowDown': player2.direction.y = 0; break;
        case 'ArrowLeft': case 'ArrowRight': player2.direction.x = 0; break;
    }
});

// Timer
let timeRemaining = 60; // 60 seconds
const timerElement = document.createElement('div');
timerElement.style.position = 'absolute';
timerElement.style.top = '10px';
timerElement.style.right = '10px';
timerElement.style.fontFamily = 'Arial, sans-serif';
timerElement.style.fontSize = '24px';
timerElement.style.color = 'black';
document.body.appendChild(timerElement);

// Function to calculate the percentage coverage
function calculateCoverage() {
    const imageData = coverageCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let redCoverage = 0;
    let blueCoverage = 0;
    let totalCoverage = 0;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a > 0) {
            totalCoverage++;
            if (r === 255 && g === 0 && b === 0) {
                redCoverage++;
            } else if (r === 0 && g === 0 && b === 255) {
                blueCoverage++;
            }
        }
    }

    const totalPixels = canvas.width * canvas.height;
    const redPercentage = (redCoverage / totalPixels) * 100;
    const bluePercentage = (blueCoverage / totalPixels) * 100;

    return { red: redPercentage, blue: bluePercentage };
}

// Function to draw the score
function updateScoreboard() {
    const { red, blue } = calculateCoverage();
    scoreBoard.textContent = `Red: ${red.toFixed(2)}% Blue: ${blue.toFixed(2)}%`;
}

// Function to update the timer
function updateTimer() {
    timeRemaining--;
    if (timeRemaining <= 0) {
        gameOver();
    }
    timerElement.textContent = `Time: ${timeRemaining}s`;
}

// Game Over Screen
function gameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
    const { red, blue } = calculateCoverage();
    ctx.font = '24px Arial';
    ctx.fillText(`Red: ${red.toFixed(2)}%`, canvas.width / 2, canvas.height / 2);
    ctx.fillText(`Blue: ${blue.toFixed(2)}%`, canvas.width / 2, canvas.height / 2 + 30);
}

// Check for power-up collection
function checkPowerUps() {
    powerUps.forEach((powerUp, index) => {
        const dx1 = player1.x - powerUp.x;
        const dy1 = player1.y - powerUp.y;
        const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

        const dx2 = player2.x - powerUp.x;
        const dy2 = player2.y - powerUp.y;
        const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        if (distance1 < player1.radius + powerUp.radius) {
            player1.activatePowerUp(powerUp.color, 100, powerUp.speedBoost); // 100 frames of power-up
            powerUps.splice(index, 1);
        } else if (distance2 < player2.radius + powerUp.radius) {
            player2.activatePowerUp(powerUp.color, 100, powerUp.speedBoost);
            powerUps.splice(index, 1);
        }
    });
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    coverageCtx.clearRect(0, 0, canvas.width, canvas.height);
    player1.update();
    player2.update();
    powerUps.forEach(powerUp => powerUp.update());
    obstacles.forEach(obstacle => obstacle.update());
    checkPowerUps();
    updateScoreboard();
    updateTimer();
    requestAnimationFrame(gameLoop);
}

gameLoop();
setInterval(updateTimer, 1000);
