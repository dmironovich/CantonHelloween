document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let playerName = "";
  let score = 0;
  let pumpkins = [];
  let obstacles = [];
  let speed = 5;
  let gravity = 1;
  let jumpPower = 15;
  let doubleJumpUsed = false;
  let gameOver = false;
  let leaderboard = [];

  const characterImg = new Image();
  characterImg.src = "assets/character.png";

  const bgMusic = new Audio("assets/sounds/background.mp3");
  const jumpSound = new Audio("assets/sounds/jump.mp3");
  const collectSound = new Audio("assets/sounds/collect.mp3");

  bgMusic.loop = true;
  bgMusic.volume = 0.5;

  document.getElementById("start-button").onclick = () => {
    playerName = document.getElementById("player-name").value || "Anonymous";
    document.getElementById("start-screen").style.display = "none";
    bgMusic.play();
    startGame();
  };

  document.getElementById("restart-button").onclick = () => {
    location.reload();
  };

  class Player {
    constructor() {
      this.x = 100;
      this.y = canvas.height - 150;
      this.width = 80;
      this.height = 80;
      this.dy = 0;
      this.onGround = true;
    }

    draw() {
      ctx.drawImage(characterImg, this.x, this.y, this.width, this.height);
    }

    update() {
      this.y += this.dy;
      this.dy += gravity;

      if (this.y + this.height >= canvas.height - 50) {
        this.y = canvas.height - 50 - this.height;
        this.dy = 0;
        this.onGround = true;
        doubleJumpUsed = false;
      }
    }

    jump() {
      if (this.onGround || !doubleJumpUsed) {
        if (this.y > 50) {
          this.dy = -jumpPower;
          this.onGround = false;
          if (!this.onGround) doubleJumpUsed = true;
          jumpSound.play();
        }
      }
    }
  }

  const player = new Player();

  function spawnObstacle() {
    const height = Math.random() * 50 + 30;
    const width = Math.random() * 30 + 30;
    obstacles.push({ x: canvas.width, y: canvas.height - 50 - height, width, height });
  }

  function spawnPumpkin() {
    const y = canvas.height - 130;
    pumpkins.push({ x: canvas.width, y });
  }

  function drawPumpkins() {
    ctx.font = "30px Arial";
    pumpkins.forEach((p, index) => {
      ctx.fillText("🎃", p.x, p.y);
      p.x -= speed;
      if (
        p.x < player.x + player.width &&
        p.x + 30 > player.x &&
        p.y < player.y + player.height &&
        p.y + 30 > player.y
      ) {
        pumpkins.splice(index, 1);
        score++;
        collectSound.play();
      }
    });
  }

  function drawObstacles() {
    ctx.fillStyle = "#444";
    obstacles.forEach((obs, index) => {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      obs.x -= speed;

      if (
        player.x < obs.x + obs.width &&
        player.x + player.width > obs.x &&
        player.y < obs.y + obs.height &&
        player.y + player.height > obs.y
      ) {
        endGame();
      }
    });
  }

  function endGame() {
    gameOver = true;
    leaderboard.push({ name: playerName, score });
    leaderboard.sort((a, b) => b.score - a.score);
    document.getElementById("restart-button").style.display = "block";
  }

  function drawLeaderboard() {
    const board = document.getElementById("leaderboard");
    board.innerHTML = "<h3>Leaderboard</h3>";
    leaderboard.slice(0, 5).forEach(entry => {
      board.innerHTML += `<div>${entry.name}: 🎃 ${entry.score}</div>`;
    });
  }

  function gameLoop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.update();
    player.draw();
    drawPumpkins();
    drawObstacles();
    drawLeaderboard();

    if (score >= 100) {
      gameOver = true;
      ctx.font = "40px Arial";
      ctx.fillStyle = "orange";
      ctx.fillText("You are the real Canton Halloween Runner!", canvas.width / 2 - 300, canvas.height / 2);
      document.getElementById("restart-button").style.display = "block";
    }

    requestAnimationFrame(gameLoop);
  }

  function startGame() {
    setTimeout(spawnObstacle, 1000);
    setInterval(() => spawnObstacle(), Math.random() * 1000 + 1500);
    setInterval(() => spawnPumpkin(), Math.random() * 2000 + 1000);
    setInterval(() => speed *= 1.1, 15000);
    gameLoop();
  }

  window.addEventListener("keydown", e => {
    if (e.code === "Space") player.jump
