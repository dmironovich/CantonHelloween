// Canton Halloween Run - updated build
// Features:
// - Uses canton.png as player (scaled to ~1/6 of canvas height)
// - Double jump, slight bobbing while running
// - Speed increases every 15s by 10%
// - First obstacle appears 1s after start
// - Pumpkins 🎃 as pickups counted in leaderboard (localStorage)
// - English UI
// - Enhanced background (ground, grass, stones, clouds, sunset sky)
// - Title "Canton Halloween Run" drawn in orange at top center
// - Mobile optimizations and orientation hint

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const ui = document.getElementById('ui');
const startBtn = document.getElementById('startBtn');
const playerNameInput = document.getElementById('playerName');
const leaderboardList = document.getElementById('leaderboard');
const rotateHint = document.getElementById('rotateHint');

// High DPI support
function fixDPI(){
  const ratio = window.devicePixelRatio || 1;
  canvas.width = 900 * ratio;
  canvas.height = 300 * ratio;
  canvas.style.width = '900px';
  canvas.style.height = '300px';
  ctx.setTransform(ratio,0,0,ratio,0,0);
}
fixDPI();

// Load player image
const playerImg = new Image();
playerImg.src = 'canton.png'; // <- your image, must be in same folder

// Game variables
let playerName = '';
let groundY = 240;
let player = { x:50, y: groundY - 48, width:48, height:48, dy:0, jumpForce:14, grounded:false, jumpsLeft:2 };
let gravity = 0.8;
let obstacles = [];
let pumpkins = [];
let frame = 0;
let speed = 6;
let gameOver = false;
let lastSpawn = 0;
let gameStartTime = 0;
let pumpkinCount = 0;
let bobOffset = 0;
let bobDir = 1;
let speedBoostInterval = 15000;
let speedTimer = null;

// Leaderboard key
const LB_KEY = 'canton_halloween_leaderboard';

function updateLeaderboardUI(){
  const data = JSON.parse(localStorage.getItem(LB_KEY) || '[]');
  leaderboardList.innerHTML = data.map(d => `<li>${escapeHtml(d.name)} — ${d.score} 🎃</li>`).join('') || '<li>None yet</li>';
}
function saveScore(){
  const data = JSON.parse(localStorage.getItem(LB_KEY) || '[]');
  data.push({ name: playerName || 'Player', score: pumpkinCount });
  data.sort((a,b)=>b.score - a.score);
  localStorage.setItem(LB_KEY, JSON.stringify(data.slice(0,10)));
}

function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c => ({'&':'amp','<':'lt','>':'gt','"':'quot'}[c] ) ? ('&'+({'&':'amp','<':'lt','>':'gt','"':'quot'}[c])+';') : c); }

// Start game
startBtn.addEventListener('click', ()=>{
  playerName = (playerNameInput.value||'Player').trim();
  ui.style.display = 'none';
  canvas.style.display = 'block';
  resetGame();
  gameStartTime = performance.now();
  lastSpawn = performance.now() - 500; // so first obstacle at ~1s mark
  if(speedTimer) clearInterval(speedTimer);
  speedTimer = setInterval(()=>{ speed *= 1.10; }, speedBoostInterval);
  requestAnimationFrame(loop);
  updateLeaderboardUI();
});

function resetGame(){
  obstacles = []; pumpkins = []; frame = 0; speed = 6; gameOver = false; pumpkinCount = 0;
  player.height = Math.floor((300)/6); // scale to ~1/6 of canvas height
  player.width = Math.floor(player.height * (playerImg.width ? playerImg.width/playerImg.height : 1));
  if(player.width < 32) player.width = 32;
  player.y = groundY - player.height; player.dy = 0; player.grounded = true; player.jumpsLeft = 2; bobOffset = 0; bobDir = 1;
}

// Input: space and touch (double jump allowed)
function doJump(){
  if(player.jumpsLeft > 0){
    player.dy = -player.jumpForce - (player.jumpsLeft===1 ? 4 : 0); // second jump stronger
    player.jumpsLeft--;
    player.grounded = false;
  }
}
document.addEventListener('keydown', e => { if(e.code === 'Space'){ e.preventDefault(); doJump(); } });
document.addEventListener('touchstart', e => { e.preventDefault(); doJump(); });

// Spawn logic: first obstacle at ~1000ms after start
function spawnObstacle(){ const h = 100 + Math.random()*70; obstacles.push({ x:900, y: groundY - h, width: 20 + Math.random()*20, height: h }); }
function spawnPumpkin(){ const y = groundY - 80 - Math.random()*80; pumpkins.push({ x:900, y: y, size:32 }); }
function rectIntersect(a,b){ return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; }

// Draw background scene
function drawBackground(){
  // sky gradient (sunset)
  const g = ctx.createLinearGradient(0,0,0,300);
  g.addColorStop(0,'#2b2a2f'); g.addColorStop(0.5,'#5b3a5b'); g.addColorStop(1,'#1a1a1d'); ctx.fillStyle = g; ctx.fillRect(0,0,900,300);

  // clouds (gray)
  ctx.fillStyle = 'rgba(120,120,130,0.45)';
  for(let i=0;i<5;i++){ const cx = (i*180 + (frame*0.2 % 180)) % 1000 - 50; ctx.beginPath(); ctx.ellipse(cx, 50 + (i%2)*10, 80, 30, 0,0,Math.PI*2); ctx.fill(); }

  // Title at top center in orange
  ctx.font = '28px Georgia'; ctx.textAlign = 'center'; ctx.fillStyle = '#ff8a00'; ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 6; ctx.fillText('Canton Halloween Run', 450, 40); ctx.shadowBlur = 0; ctx.textAlign = 'left';

  // ground layered: soil with stones, grass on top
  ctx.fillStyle = '#3d2213'; ctx.fillRect(0, groundY, 900, 60);
  for(let i=0;i<12;i++){ ctx.fillStyle = '#2b2b2b'; const sx = (i*90 + frame*0.3) % 900; const sy = groundY + 20 + (i%3)*6; ctx.beginPath(); ctx.ellipse(sx, sy, 14, 8, 0, 0, Math.PI*2); ctx.fill(); }
  for(let i=0;i<18;i++){ const gx = i*50 - (frame*0.6 % 50); ctx.fillStyle = '#27522b'; ctx.beginPath(); ctx.ellipse(gx, groundY+2, 36, 12, 0, 0, Math.PI*2); ctx.fill(); }
  for(let i=0;i<25;i++){ const tx = (i*36 + (frame*0.4 % 36)) % 900; ctx.fillStyle = '#2b6b39'; ctx.fillRect(tx, groundY-6, 4, 8); }
}

// Main loop
function loop(t){
  if(gameOver) return;
  frame++;
  const now = performance.now();
  if(now - gameStartTime >= 1000 && now - lastSpawn >= 1000){ spawnObstacle(); lastSpawn = now; }
  if(frame % 150 === 0) spawnPumpkin();

  // physics
  player.dy += gravity; player.y += player.dy;
  if(player.y > groundY - player.height){ player.y = groundY - player.height; player.dy = 0; player.grounded = true; player.jumpsLeft = 2; }

  // bobbing while on ground
  if(player.grounded){ bobOffset += 0.4 * bobDir; if(bobOffset > 4 || bobOffset < -2) bobDir *= -1; } else { bobOffset *= 0.9; }

  // move obstacles & pumpkins
  for(let i=obstacles.length-1;i>=0;i--){ obstacles[i].x -= speed; if(obstacles[i].x + obstacles[i].width < -50) obstacles.splice(i,1); if(rectIntersect(player, obstacles[i])) gameOver = true; }
  for(let i=pumpkins.length-1;i>=0;i--){ pumpkins[i].x -= speed; if(pumpkins[i].x < -50) pumpkins.splice(i,1); const px = pumpkins[i].x, py = pumpkins[i].y - 24, psize = 28; if(player.x < px + psize && player.x + player.width > px && player.y < py + psize && player.y + player.height > py){ pumpkinCount++; pumpkins.splice(i,1); } }

  // draw
  ctx.clearRect(0,0,900,300);
  drawBackground();

  ctx.font = '28px Segoe UI Emoji'; ctx.textAlign = 'left';
  for(let p of pumpkins){ ctx.fillText('🎃', p.x, p.y); }

  ctx.fillStyle = '#543318';
  for(let o of obstacles){
    ctx.fillRect(o.x, o.y, o.width, o.height);
    ctx.fillStyle = '#6b3a20';
    ctx.fillRect(o.x - 6, o.y - 8, o.width + 12, 8);
    ctx.fillStyle = '#543318';
  }

  const drawX = player.x; const drawY = player.y + bobOffset;
  if(playerImg.complete){
    const pW = player.width; const pH = player.height;
    ctx.drawImage(playerImg, drawX, drawY, pW, pH);
    ctx.beginPath(); ctx.ellipse(drawX + pW/2, groundY + 6, pW/2 + 6, 6, 0,0,Math.PI*2); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
  } else {
    ctx.fillStyle = '#ffd54f'; ctx.fillRect(drawX, drawY, player.width, player.height);
  }

  // HUD
  ctx.fillStyle = '#fff'; ctx.font = '18px Arial';
  ctx.fillText(`🎃: ${pumpkinCount}`, 12, 26);
  ctx.fillText(`Score: ${Math.floor((performance.now()-gameStartTime)/1000)}`, 12, 46);

  if(gameOver){ endGame(); return; }
  requestAnimationFrame(loop);
}

function endGame(){ saveScore(); alert('Game Over! You collected ' + pumpkinCount + ' 🎃'); ui.style.display = 'block'; canvas.style.display = 'none'; updateLeaderboardUI(); if(speedTimer) clearInterval(speedTimer); }

// Init
updateLeaderboardUI();
canvas.style.display = 'none';

// Mobile orientation hint
function updateOrientationHint(){ if(window.innerHeight > window.innerWidth){ rotateHint.style.display = 'block'; } else { rotateHint.style.display = 'none'; } }
window.addEventListener('resize', updateOrientationHint); updateOrientationHint();

// quick start Enter
playerNameInput.addEventListener('keydown', e => { if(e.key === 'Enter') startBtn.click(); });
