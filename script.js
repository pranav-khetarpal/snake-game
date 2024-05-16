// script.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scale = 20;
const rows = 20;
const columns = 20;
let snake;
let fruit;
let gameInterval;
let isGameOver = false;
let currentScore = 0;
let topScore = localStorage.getItem('topScore') ? parseInt(localStorage.getItem('topScore')) : 0;

document.getElementById('topScore').innerText = topScore;

(function setup() {
    canvas.width = columns * scale;
    canvas.height = rows * scale;
    snake = new Snake();
    fruit = new Fruit();
    fruit.pickLocation();
    
    gameInterval = window.setInterval(gameLoop, 250);

    document.getElementById('restartButton').addEventListener('click', restartGame);

    window.addEventListener('keydown', (event) => {
        const direction = event.key.replace('Arrow', '');
        snake.changeDirection(direction);
    });

    // Add touch event listeners for swipe controls
    let touchStartX = 0;
    let touchStartY = 0;
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                snake.changeDirection('Right');
            } else {
                snake.changeDirection('Left');
            }
        } else {
            if (deltaY > 0) {
                snake.changeDirection('Down');
            } else {
                snake.changeDirection('Up');
            }
        }

        // Reset touch start positions
        touchStartX = touchEndX;
        touchStartY = touchEndY;
    });
})();

function gameLoop() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    fruit.draw();
    snake.update();
    snake.draw();
    
    if (snake.eat(fruit)) {
        fruit.pickLocation();
        currentScore++;
        document.getElementById('currentScore').innerText = currentScore;
    }
    
    if (snake.checkCollision()) {
        endGame();
    }
}

function restartGame() {
    snake = new Snake();
    fruit.pickLocation();
    isGameOver = false;
    currentScore = 0;
    document.getElementById('currentScore').innerText = currentScore;
    document.getElementById('restartButton').classList.add('hidden');
    gameInterval = window.setInterval(gameLoop, 250);
}

function endGame() {
    isGameOver = true;
    clearInterval(gameInterval);
    document.getElementById('restartButton').classList.remove('hidden');

    if (currentScore > topScore) {
        topScore = currentScore;
        localStorage.setItem('topScore', topScore);
        document.getElementById('topScore').innerText = topScore;
    }
}

function drawGrid() {
    ctx.strokeStyle = '#555';
    for (let i = 0; i < rows; i++) {
        ctx.beginPath();
        ctx.moveTo(i * scale, 0);
        ctx.lineTo(i * scale, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < columns; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * scale);
        ctx.lineTo(canvas.width, i * scale);
        ctx.stroke();
    }
}

function Snake() {
    this.x = 0;
    this.y = 0;
    this.xSpeed = scale * 1;
    this.ySpeed = 0;
    this.total = 0;
    this.tail = [];

    this.draw = function() {
        ctx.fillStyle = "#00FF00";
        
        for (let i=0; i<this.tail.length; i++) {
            ctx.fillRect(this.tail[i].x, this.tail[i].y, scale, scale);
        }
        
        ctx.fillRect(this.x, this.y, scale, scale);
    };

    this.update = function() {
        for (let i=0; i<this.tail.length - 1; i++) {
            this.tail[i] = this.tail[i + 1];
        }

        this.tail[this.total - 1] = { x: this.x, y: this.y };

        this.x += this.xSpeed;
        this.y += this.ySpeed;
    };

    this.changeDirection = function(direction) {
        switch(direction) {
            case 'Up':
                if (this.ySpeed === 0) {
                    this.xSpeed = 0;
                    this.ySpeed = -scale * 1;
                }
                break;
            case 'Down':
                if (this.ySpeed === 0) {
                    this.xSpeed = 0;
                    this.ySpeed = scale * 1;
                }
                break;
            case 'Left':
                if (this.xSpeed === 0) {
                    this.xSpeed = -scale * 1;
                    this.ySpeed = 0;
                }
                break;
            case 'Right':
                if (this.xSpeed === 0) {
                    this.xSpeed = scale * 1;
                    this.ySpeed = 0;
                }
                break;
        }
    };

    this.eat = function(fruit) {
        if (this.x === fruit.x && this.y === fruit.y) {
            this.total++;
            return true;
        }

        return false;
    };

    this.checkCollision = function() {
        // Check collision with walls
        if (this.x >= canvas.width || this.y >= canvas.height || this.x < 0 || this.y < 0) {
            return true;
        }

        // Check collision with tail
        for (let i=0; i<this.tail.length; i++) {
            if (this.x === this.tail[i].x && this.y === this.tail[i].y) {
                return true;
            }
        }

        return false;
    };
}

function Fruit() {
    this.x;
    this.y;

    this.pickLocation = function() {
        this.x = Math.floor(Math.random() * rows) * scale;
        this.y = Math.floor(Math.random() * columns) * scale;
    };

    this.draw = function() {
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(this.x, this.y, scale, scale);
    };
}
