// Rialo Halloween Run - simple Chrome Dino-like game with pumpkin pickups and leaderboard.
// Place your character image named "player.png" in the same folder as index.html.
// The provided ZIP includes a placeholder player.png which you can replace.

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const startBtn = document.getElementById('startBtn');
const playerNameInput = document.getElementById('playerName');
const leaderboardList = document.getElementById('leaderboard');

let playerName = "";
let playerImg = new Image();
playerImg.src = 'player.png'; // <-- Put your image here (recommended size ~64x64)

/* Game state */
let player = { x: 50, y: 200, width: 64, height: 64, dy: 0, jumpForce: 14, grounded: false };
let gravity = 0.8;
let obstacles = [];
let pumpkins = [];
let score = 0;
let pumpkinCount = 0;
let speed = 6;
let gameOver = false;
let frame = 0;
let groundY = 240;

/* Resize canvas for high DPI */
function fixDPI() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = 900 * ratio;
  canvas.height = 300 * ratio;
  canvas.style.width = '900px';
  canvas.style.height = '300px';
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
fixDPI();

/* Menu and leaderboard */
function updateLeaderboard() {
  const data = JSON.parse(localStorage.getItem('rialo_leaderboard') || '[]');
  leaderboardList.innerHTML = data.map(d => `<li>${escapeHtml(d.name)} — ${d.score} 🎃</li>`).join('');
}
function saveScore() {
  const data = JSON.parse(localStorage.getItem('rialo_leaderboard') || '[]');
  data.push({ name: playerName, score: pumpkinCount });
  data.sort((a,b) => b.score - a.score);
  localStorage.setItem('rialo_leaderboard', JSON.stringify(data.slice(0, 10)));
}
function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c=>'&'+{ '&':'amp','<':'lt','>':'gt','"':'quot'}[c]+';'); }

/* Start/reset */
function startGame() {
  playerName = (playerNameInput.value || 'Игрок').trim();
  menu.style.display = 'none';
  canvas.style.display = 'block';
  resetGame();
  requestAnimationFrame(loop);
}

function resetGame() {
  player.y = groundY - player.height;
  player.dy = 0;
  obstacles = [];
  pumpkins = [];
  score = 0;
  pumpkinCount = 0;
  speed = 6;
  gameOver = false;
  frame = 0;
}

/* Input */
function jump() {
  if (player.grounded) {
    player.dy = -player.jumpForce;
    player.grounded = false;
  }
}
document.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); jump(); } });
document.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });

/* Game loop */
function loop() {
  if (gameOver) return endGame();
  frame++;
  // Clear
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Background sky
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0,0,900,300);

  // Ground
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(0, groundY, 900, 60);

  // Player physics
  player.dy += gravity;
  player.y += player.dy;
  if (player.y > groundY - player.height) {
    player.y = groundY - player.height;
    player.dy = 0;
    player.grounded = true;
  }

  // Spawn obstacles
  if (frame % Math.max(60, 120 - Math.floor(frame/500)) === 0) {
    const h = 30 + Math.random()*50;
    obstacles.push({ x: 900, y: groundY - h, width: 20 + Math.random()*20, height: h });
  }

  // Spawn pumpkins
  if (frame % 150 === 0) {
    pumpkins.push({ x: 900, y: groundY - 80 - Math.random()*80, size: 32 });
  }

  // Move & draw obstacles
  ctx.fillStyle = '#5b3a2e';
  for (let i = obstacles.length-1; i >= 0; i--) {
    const o = obstacles[i];
    o.x -= speed;
    ctx.fillRect(o.x, o.y, o.width, o.height);
    if (o.x + o.width < -50) obstacles.splice(i,1);

    // Collision
    if (rectIntersect(player, o)) gameOver = true;
  }

  // Move & draw pumpkins (use emoji)
  ctx.font = '28px Segoe UI Emoji';
  for (let i = pumpkins.length-1; i >= 0; i--) {
    const p = pumpkins[i];
    p.x -= speed;
    ctx.fillText('🎃', p.x, p.y);
    if (p.x < -50) pumpkins.splice(i,1);

    // Approx collision using bounding-box
    const px = p.x, py = p.y-28, psize = 28;
    if (player.x < px + psize && player.x + player.width > px && player.y < py + psize && player.y + player.height > py) {
      pumpkinCount++;
      pumpkins.splice(i,1);
    }
  }

  // Draw player image (fallback to rectangle if not loaded)
  if (playerImg.complete) {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
  } else {
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  // HUD
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px Arial';
  ctx.fillText(`🎃: ${pumpkinCount}`, 12, 26);
  ctx.fillText(`Score: ${Math.floor(frame/10)}`, 12, 46);

  // Increase difficulty slowly
  if (frame % 600 === 0) speed += 0.5;

  requestAnimationFrame(loop);
}

function rectIntersect(a,b){
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function endGame(){
  saveScore();
  setTimeout(()=>{ alert('Игра окончена. Ты собрал ' + pumpkinCount + ' 🎃'); }, 50);
  menu.style.display = 'block';
  canvas.style.display = 'none';
  updateLeaderboard();
}

startBtn.addEventListener('click', startGame);
updateLeaderboard();
