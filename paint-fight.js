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

// Player class
class Player {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = 20;
        this.speed = 5;
        this.direction = { x: 0, y: 0 };
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
    }
}

// Create players
const player1 = new Player(100, canvas.height / 2, 'red');
const player2 = new Player(canvas.width - 100, canvas.height / 2, 'blue');

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
function drawScore() {
    const { red, blue } = calculateCoverage();
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.clearRect(0, 0, canvas.width, 50); // Clear previous score
    ctx.fillText(`Red: ${red.toFixed(2)}%`, canvas.width / 4, 10);
    ctx.fillText(`Blue: ${blue.toFixed(2)}%`, 3 * canvas.width / 4, 10);
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player1.update();
    player2.update();
    drawScore();
    requestAnimationFrame(gameLoop);
}

gameLoop();
