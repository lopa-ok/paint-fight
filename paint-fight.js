const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

// Game loop
function gameLoop() {
    player1.update();
    player2.update();
    requestAnimationFrame(gameLoop);
}

gameLoop();
