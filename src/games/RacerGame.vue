<template>
  <div class="racer-game">
    <div class="hud">
      <div>Score: {{ score.toFixed(2) }}</div>
      <div>Lives: {{ lives }}</div>
      <div>Speed: {{ Math.floor(speed) }}</div>
      <div class="controls">← / → or A / D to steer • ↑ to boost</div>
    </div>

    <canvas ref="canvasRef" tabindex="0" @keydown="onKeyDown" @keyup="onKeyUp"></canvas>

    <div class="overlay" v-if="gameState !== 'playing'">
      <div class="panel">
        <h2>
          {{
            gameState === 'menu'
              ? 'Retro Road Racer'
              : gameState === 'paused'
                ? 'Paused'
                : 'Game Over'
          }}
        </h2>
        <br />
        <p v-if="gameState === 'menu'">
          Dodge incoming vehicles.<br />
          Collect coins if you can.<br />
          Beat the other cars.<br />
          Survive for as long as you can.<br />
        </p>
        <p v-if="gameState === 'over'">
          Final Score: {{ score.toFixed(2) }}<br />High Score: {{ highScore.toFixed(2) }}
        </p>
        <button @click="startGame">{{ gameState === 'menu' ? 'Start' : 'Restart' }}</button>
        <button v-if="gameState === 'paused'" @click="resumeGame">Resume</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// --- Config ---
const baseWidth = 720
const baseHeight = 960

// --- Reactive state ---
const canvasRef = ref(null)
let ctx = null
const score = ref(0)
const lives = ref(3)
const speed = ref(2)
const gameState = ref('menu') // 'menu' | 'playing' | 'paused' | 'over'
const highScoreKey = 'racer_highscore_v1'
const highScore = ref(parseInt(localStorage.getItem(highScoreKey) || '0'))
const spriteScale = {
  player: 1.2,
  enemy: 1.4,
  coin: 1.0,
}

// Player
const player = {
  x: baseWidth / 2,
  y: baseHeight - 80,
  w: 28,
  h: 48,
  vx: 0,
}

// Controls
const keys = { left: false, right: false, boost: false }

// Obstacles & pickups
let obstacles = []
let pickups = []
let frame = 0

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function resetGame() {
  score.value = 0
  lives.value = 3
  speed.value = 2
  player.x = baseWidth / 2
  player.vx = 0
  obstacles = []
  pickups = []
  frame = 0
}

function startGame() {
  resetGame()
  gameState.value = 'playing'
  requestAnimationFrame(loop)
  canvasRef.value.focus()
}

function resumeGame() {
  gameState.value = 'playing'
  canvasRef.value.focus()
}

function endGame() {
  gameState.value = 'over'
  if (score.value > highScore.value) {
    highScore.value = score.value
    localStorage.setItem(highScoreKey, String(highScore.value))
  }
}

function onKeyDown(e) {
  if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true
  if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true
  if (e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.boost = true
  if (e.code === 'Space') {
    if (gameState.value === 'menu') startGame()
    else if (gameState.value === 'playing') {
      gameState.value = 'paused'
    } else if (gameState.value === 'paused') resumeGame()
  }
}
function onKeyUp(e) {
  if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false
  if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false
  if (e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.boost = false
}

function spawnObstacle() {
  const laneCount = 3
  const laneWidth = (baseWidth - 96) / laneCount // same road size, just divided into lanes
  const laneXPositions = Array.from(
    { length: laneCount },
    (_, i) => 48 + i * laneWidth + laneWidth / 2,
  )

  const laneX = laneXPositions[Math.floor(Math.random() * laneXPositions.length)]
  const obsW = randInt(50, 80) * spriteScale.enemy
  const obsH = randInt(28, 48) * spriteScale.enemy

  obstacles.push({
    x: laneX - obsW / 2,
    y: -obsH,
    w: obsW,
    h: obsH,
    type: 'car',
  })
}

function spawnPickup() {
  const laneCount = 3
  const laneWidth = (baseWidth - 96) / laneCount
  const laneXPositions = Array.from(
    { length: laneCount },
    (_, i) => 48 + i * laneWidth + laneWidth / 2,
  )

  const laneX = laneXPositions[Math.floor(Math.random() * laneXPositions.length)]
  const coinSize = 14 * spriteScale.coin

  pickups.push({
    x: laneX - coinSize / 2,
    y: -coinSize,
    w: coinSize,
    h: coinSize,
    kind: 'coin',
  })
}

function loop() {
  if (!canvasRef.value || gameState.value !== 'playing') return

  // --- Per-type sprite scales ---
  const spriteScale = {
    player: 1.25,
    enemy: 1.4,
    coin: 1.1,
  }

  frame++

  // --- Speed ramp ---
  if (frame % 600 === 0) speed.value += 0.5

  // --- Spawns ---
  if (frame % Math.max(30, Math.floor(60 - speed.value * 5)) === 0) spawnObstacle()
  if (frame % 180 === 0) spawnPickup()

  // --- Movement / Control ---
  const accel = 0.4
  if (keys.left) player.vx -= accel
  if (keys.right) player.vx += accel
  player.vx *= 0.86
  player.x += player.vx

  const margin = 24
  player.x = Math.max(margin, Math.min(baseWidth - player.w - margin, player.x))

  // --- Boost control ---
  if (keys.boost) {
    speed.value = Math.min(8, speed.value + 0.06)
    score.value += 0.2
  } else {
    speed.value = Math.max(2, speed.value - 0.02)
  }

  // --- Update obstacles ---
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i]
    o.y += speed.value + o.h / 12
    o.wScaled = o.w * spriteScale.enemy
    o.hScaled = o.h * spriteScale.enemy

    if (o.y > baseHeight + 50) obstacles.splice(i, 1)
    if (
      rectIntersect(
        { ...o, w: o.wScaled, h: o.hScaled },
        { ...player, w: player.w * spriteScale.player, h: player.h * spriteScale.player },
      )
    ) {
      obstacles.splice(i, 1)
      lives.value--
      if (lives.value <= 0) endGame()
    }
  }

  // --- Update pickups ---
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i]
    p.y += speed.value
    p.wScaled = p.w * spriteScale.coin
    p.hScaled = p.h * spriteScale.coin

    if (p.y > baseHeight + 20) pickups.splice(i, 1)
    if (
      rectIntersect(
        { ...p, w: p.wScaled, h: p.hScaled },
        { ...player, w: player.w * spriteScale.player, h: player.h * spriteScale.player },
      )
    ) {
      pickups.splice(i, 1)
      score.value += 10
    }
  }

  score.value += 0.02

  // --- Render everything with shadows ---
  render(spriteScale)
  requestAnimationFrame(loop)
}

function rectIntersect(a, b, type = 'enemy') {
  const expand = type === 'coin' ? 12 : 8 // coin easier pickup, enemy fair hit
  return !(
    a.x + a.w < b.x - expand ||
    a.x > b.x + b.w + expand ||
    a.y + a.h < b.y - expand ||
    a.y > b.y + b.h + expand
  )
}

function render() {
  if (!ctx) return
  ctx.fillStyle = '#0b1220'
  ctx.fillRect(0, 0, baseWidth, baseHeight)

  const roadX = 48
  const roadW = baseWidth - roadX * 2
  ctx.fillStyle = '#262626'
  ctx.fillRect(roadX, 0, roadW, baseHeight)

  ctx.strokeStyle = '#e2b33c'
  ctx.lineWidth = 4
  ctx.setLineDash([24, 24])
  ctx.beginPath()
  ctx.moveTo(baseWidth / 2, -(frame * speed.value) % 48)
  ctx.lineTo(baseWidth / 2, baseHeight)
  ctx.stroke()
  ctx.setLineDash([])

  for (let y = -(frame * speed.value) % 32; y < baseHeight; y += 32) {
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(roadX - 24, y, 16, 20)
    ctx.fillRect(roadX + roadW + 8, y + 12, 16, 20)
  }

  pickups.forEach((p) => drawPixelCoin(p.x, p.y))
  obstacles.forEach((o) => drawPixelCar(o.x, o.y, o.w, o.h))
  drawPlayer(player.x, player.y)

  ctx.fillStyle = '#fff'
  ctx.font = '16px "Press Start 2P", monospace'
  ctx.fillText('S:' + score.value.toFixed(2), 12, 24)
}

function drawShadow(x, y, w, h) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
  ctx.fillRect(x + 4, y + 6, w, h / 10)
}

function drawPixelCar(x, y, w, h) {
  w *= spriteScale.enemy
  h *= spriteScale.enemy
  drawShadow(x, y, w, h)
  ctx.fillStyle = '#8b1e3f'
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = '#cfe8ff'
  ctx.fillRect(x + 8, y + 8, Math.max(12, w - 16), Math.max(12, h - 20))
  ctx.fillStyle = '#111'
  ctx.fillRect(x + 4, y + h - 8, 12, 6)
  ctx.fillRect(x + w - 16, y + h - 8, 12, 6)
}

function drawPlayer(x, y) {
  const w = player.w * spriteScale.player
  const h = player.h * spriteScale.player
  drawShadow(x, y, w, h)
  ctx.fillStyle = '#2dd4bf'
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = '#0369a1'
  ctx.fillRect(x + 6, y + 8, w - 12, 16)
  ctx.fillStyle = '#111'
  ctx.fillRect(x + 2, y + h - 8, 10, 6)
  ctx.fillRect(x + w - 12, y + h - 8, 10, 6)
}

function drawPixelCoin(x, y) {
  const s = 10 * spriteScale.coin
  ctx.fillStyle = '#f6c85f'
  ctx.fillRect(x, y, s, s)
  ctx.fillStyle = '#b8860b'
  ctx.fillRect(x + 2 * spriteScale, y + 4 * spriteScale, 6 * spriteScale, 2 * spriteScale)
}

function fitCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const baseWidth = 720
  const baseHeight = 960
  const pixelScale = 0.7 // ⬅️ adjust this for size (1 = smallest, 2 = default, etc.)

  canvas.width = baseWidth
  canvas.height = baseHeight

  // visually scale it down/up
  canvas.style.width = baseWidth * pixelScale + 'px'
  canvas.style.height = baseHeight * pixelScale + 'px'

  canvas.style.imageRendering = 'pixelated'
  canvas.style.display = 'block'
  canvas.style.margin = '0 auto'
}

onMounted(() => {
  fitCanvas()
  const canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = false
  canvas.setAttribute('tabindex', 0)
  canvas.focus()
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

* {
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}

.racer-game {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
  background: #000;
  font-family: 'Press Start 2P', monospace;
  user-select: none;
}
canvas {
  display: block;
  background: #071024;
  border: 8px solid #111;
  image-rendering: pixelated;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
canvas,
.racer-game,
.hud,
.panel {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.hud {
  display: flex;
  gap: 24px;
  justify-content: center;
  padding: 8px;
  color: #fff;
  font-size: 16px;
}
.overlay {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.panel {
  background: rgba(3, 7, 18, 0.95);
  color: #fff;
  padding: 24px;
  text-align: center;
  border: 4px solid #e2b33c;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
}
.panel button {
  margin: 12px 8px 0 8px;
  padding: 10px 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: #e2b33c;
  color: #000;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
}
.controls {
  color: #9ca3af;
  font-size: 12px;
  text-align: center;
}
</style>
