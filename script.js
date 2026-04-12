const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// SOUND
const engineSound = document.getElementById("engineSound");
const crashSound = document.getElementById("crashSound");

// GAME VARIABLES
let player = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 150,
    width: 80,
    height: 120
};

let obstacles = [];
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let lives = 3;
let gameRunning = false;
let isNight = false;
let moveLeft = false;
let moveRight = false;
let combo = 0;
let baseSpawnRate = 0.02;
let difficulty = "Easy";
let selectedLevel = null; // Track selected difficulty level

// LANE SYSTEM - divide road into lanes
const lanes = [
    canvas.width / 4 - 40,
    canvas.width / 2 - 40,
    (canvas.width * 3) / 4 - 40
];

// CONTROLS
window.addEventListener("keydown", (e) => {
    if (!gameRunning && e.key !== "n" && e.key !== "N") {
        if (e.key === " ") {
            startGame();
            return;
        }
    }

    if (e.key === "ArrowLeft") moveLeft = true;
    if (e.key === "ArrowRight") moveRight = true;

    if (e.key === "n" || e.key === "N") {
        isNight = !isNight;
    }
});

window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") moveLeft = false;
    if (e.key === "ArrowRight") moveRight = false;
});

// LEVEL SELECTION
document.getElementById("easyBtn").addEventListener("click", () => selectLevel("easy"));
document.getElementById("mediumBtn").addEventListener("click", () => selectLevel("medium"));
document.getElementById("hardBtn").addEventListener("click", () => selectLevel("hard"));

function selectLevel(level) {
    selectedLevel = level;

    // Remove selected class from all buttons
    document.querySelectorAll(".levelBtn").forEach(btn => btn.classList.remove("selected"));

    // Add selected class to clicked button
    if (level === "easy") document.getElementById("easyBtn").classList.add("selected");
    if (level === "medium") document.getElementById("mediumBtn").classList.add("selected");
    if (level === "hard") document.getElementById("hardBtn").classList.add("selected");

    // Show start button
    document.getElementById("startBtn").style.display = "inline-block";
}

// START GAME
function startGame() {
    if (!selectedLevel) return; // Don't start if no level selected

    document.getElementById("startScreen").style.display = "none";
    gameRunning = true;
    if (engineSound) engineSound.play().catch(() => { });

    // Set initial difficulty based on selected level
    updateDifficulty();
}

// UPDATE DIFFICULTY (now based on selected level, not score)
function updateDifficulty() {
    if (selectedLevel === "easy") {
        difficulty = "Easy";
        baseSpawnRate = 0.01;
    } else if (selectedLevel === "medium") {
        difficulty = "Medium";
        baseSpawnRate = 0.015;
    } else if (selectedLevel === "hard") {
        difficulty = "Hard";
        baseSpawnRate = 0.02;
    }
    document.getElementById("difficulty").innerText = difficulty;
}

// SPAWN OBSTACLE
function spawnObstacle() {
    const obstacleWidth = 60;
    const leftEdge = 20;
    const rightEdge = canvas.width - 20 - obstacleWidth;
    const x = leftEdge + Math.random() * (rightEdge - leftEdge);

    obstacles.push({
        x: x,
        y: -120,
        width: obstacleWidth,
        height: 120
    });
}

// DRAW ROAD WITH LANES
function drawRoad() {
    // background
    ctx.fillStyle = isNight ? "#0a0a1a" : "#333333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // road lanes separator
    ctx.strokeStyle = isNight ? "#444" : "#666";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo((canvas.width / 3) * i, 0);
        ctx.lineTo((canvas.width / 3) * i, canvas.height);
        ctx.stroke();
    }
    ctx.setLineDash([]);

    // center line
    ctx.strokeStyle = isNight ? "#ffff00" : "#ffff00";
    ctx.lineWidth = 4;
    ctx.setLineDash([30, 20]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // edges
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(0, 0, 15, canvas.height);
    ctx.fillRect(canvas.width - 15, 0, 15, canvas.height);

    // background decoration (road shadow)
    ctx.fillStyle = isNight ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.1)";
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.fillRect(0, y, canvas.width, 25);
    }
}

// DRAW PLAYER CAR
function drawPlayer() {
    // Car body
    ctx.fillStyle = "#290ce1";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Car windows
    ctx.fillStyle = "#f7f4f4";
    ctx.fillRect(player.x + 10, player.y + 15, 20, 25);
    ctx.fillRect(player.x + 50, player.y + 15, 20, 25);

    // Car headlights
    ctx.fillStyle = "#ffff00";
    ctx.fillRect(player.x + 15, player.y, 15, 5);
    ctx.fillRect(player.x + 50, player.y, 15, 5);

    // Car wheels
    ctx.fillStyle = "#000000";
    ctx.fillRect(player.x + 5, player.y + 30, 12, 20);
    ctx.fillRect(player.x + 63, player.y + 30, 12, 20);
    ctx.fillRect(player.x + 5, player.y + 70, 12, 20);
    ctx.fillRect(player.x + 63, player.y + 70, 12, 20);
}

// DRAW OBSTACLES (ENEMY CARS)
function drawObstacles() {
    obstacles.forEach((obs, i) => {
        obs.y += 5; // Fixed speed

        // Enemy car body
        ctx.fillStyle = "#d20a0a";
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Enemy car windows
        ctx.fillStyle = "#f8f6f6";
        ctx.fillRect(obs.x + 8, obs.y + 12, 18, 22);
        ctx.fillRect(obs.x + 34, obs.y + 12, 18, 22);

        // Enemy car taillights
        ctx.fillStyle = "#ffff00";
        ctx.fillRect(obs.x + 12, obs.y + obs.height - 8, 12, 5);
        ctx.fillRect(obs.x + 36, obs.y + obs.height - 8, 12, 5);

        // Enemy car wheels
        ctx.fillStyle = "#000000";
        ctx.fillRect(obs.x + 4, obs.y + 25, 10, 18);
        ctx.fillRect(obs.x + 46, obs.y + 25, 10, 18);
        ctx.fillRect(obs.x + 4, obs.y + 65, 10, 18);
        ctx.fillRect(obs.x + 46, obs.y + 65, 10, 18);

        // COLLISION DETECTION
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            if (crashSound) {
                crashSound.currentTime = 0;
                crashSound.play();
            }

            if (engineSound) engineSound.pause();

            obstacles.splice(i, 1);
            lives--;
            combo = 0;
            document.getElementById("lives").innerText = lives;
            document.getElementById("combo").innerText = combo;

            if (lives <= 0) {
                gameRunning = false;
                endGame();
            } else {
                setTimeout(() => {
                    if (engineSound) engineSound.play();
                }, 500);
            }
        }

        // Remove off screen & increase score + combo
        if (obs.y > canvas.height) {
            obstacles.splice(i, 1);
            score++;
            combo++;
            document.getElementById("combo").innerText = combo;
        }
    });
}

// END GAME
function endGame() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }
    document.getElementById("finalScore").innerText = score;
    document.getElementById("finalHighScore").innerText = highScore;
    document.getElementById("gameOver").style.display = "flex";
}

// GAME LOOP
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRoad();

    if (gameRunning) {
        // smooth movement
        if (moveLeft) player.x -= 8;
        if (moveRight) player.x += 8;

        // boundary checking
        player.x = Math.max(15, Math.min(canvas.width - 15 - player.width, player.x));

        drawPlayer();
        drawObstacles();

        if (Math.random() < baseSpawnRate) spawnObstacle();
    } else {
        drawPlayer();
        drawObstacles();
    }

    document.getElementById("score").innerText = score;
    document.getElementById("highScore").innerText = highScore;

    requestAnimationFrame(gameLoop);
}

gameLoop();

// START BUTTON
document.getElementById("startBtn").addEventListener("click", startGame);

// PLAY AGAIN BUTTON
document.getElementById("playAgain").addEventListener("click", () => {
    score = 0;
    lives = 3;
    combo = 0;
    gameRunning = false;
    moveLeft = false;
    moveRight = false;
    selectedLevel = null; // Reset level selection
    player.x = canvas.width / 2 - 40;
    obstacles = [];
    document.getElementById("score").innerText = score;
    document.getElementById("lives").innerText = lives;
    document.getElementById("combo").innerText = combo;
    document.getElementById("difficulty").innerText = "Easy";
    document.getElementById("gameOver").style.display = "none";
    document.getElementById("startScreen").style.display = "flex";
    document.getElementById("startBtn").style.display = "none"; // Hide start button
    // Remove selected class from all level buttons
    document.querySelectorAll(".levelBtn").forEach(btn => btn.classList.remove("selected"));
    if (engineSound) engineSound.pause();
});