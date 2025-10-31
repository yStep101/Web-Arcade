<template>
  <div class="racer-game">
    <div class="hud">
      <div>Score: {{ score.toFixed(2) }}</div>
      <div>Lives: {{ lives }}</div>
      <div>Speed: {{ Math.floor(speed) }}</div>
      <div>Mode: {{ difficulty.toUpperCase() }}</div>
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
          Survive for as long as you can.<br />
        </p>
        <p v-if="gameState === 'over'">
          Final Score: {{ score.toFixed(2) }}<br />High Score: {{ highScore.toFixed(2) }}
        </p>
        <button @click="startGame">{{ gameState === 'menu' ? 'Start' : 'Restart' }}</button>
        <button v-if="gameState === 'paused'" @click="resumeGame">Resume</button>
        <!-- Difficulty selector -->
        <div v-if="gameState === 'menu'" style="margin-top: 16px">
          <p style="font-size: 12px; color: #e2b33c; margin-bottom: 8px; text-align: center">
            Select Difficulty:
          </p>

          <div style="display: flex; gap: 10px; justify-content: center">
            <button
              v-for="mode in Object.keys(difficultySettings)"
              :key="mode"
              @click="setDifficulty(mode)"
              :class="['difficulty-btn', { selected: difficulty.value === mode }]"
              :style="{ '--btn-color': difficultySettings[mode].color }"
            >
              {{ mode.charAt(0).toUpperCase() + mode.slice(1) }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useScoreSubmit } from '@/composables/useScoreSubmit'

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
const { trySubmit, resetBest } = useScoreSubmit('Racer')
const spriteScale = {
  player: 1.5,
  enemy: 1.4,
  coin: 1.3,
}
const difficulty = ref('intermediate')
const difficultySettings = {
  easy: {
    speedMultiplier: 0.8,
    carSpawnInterval: 100, // frames
    coinSpawnInterval: 180,
    lives: 4,
    color: '#22c55e', // green
  },
  intermediate: {
    speedMultiplier: 1,
    carSpawnInterval: 60,
    coinSpawnInterval: 130,
    lives: 3,
    color: '#eab308', // yellow
  },
  hard: {
    speedMultiplier: 1.3,
    carSpawnInterval: 30,
    coinSpawnInterval: 90,
    lives: 2,
    color: '#ef4444', // red
  },
}

// Player
const player = {
  x: baseWidth / 2,
  y: baseHeight - 100,
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

// function randInt(min, max) {
//   return Math.floor(Math.random() * (max - min + 1)) + min
// }

function resetGame() {
  resetBest()
  const settings = difficultySettings[difficulty.value]
  score.value = 0
  lives.value = settings.lives
  speed.value = 2 * settings.speedMultiplier
  player.x = baseWidth / 2
  player.vx = 0
  obstacles = []
  pickups = []
  frame = 0
  invincible = false
  invincibleTimer = 0
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
  invincible = false
  invincibleTimer = 0
  speed.value = 0 // stop movement immediately
  obstacles = []
  pickups = []

  if (score.value > highScore.value) {
    highScore.value = score.value
    localStorage.setItem(highScoreKey, String(highScore.value))
  }
}

function setDifficulty(mode) {
  difficulty.value = mode
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
  const roadX = 48
  const roadW = baseWidth - roadX * 2
  const laneCount = 5
  const laneWidth = roadW / laneCount
  const carW = 80 * spriteScale.enemy

  const lanes = Array.from(
    { length: laneCount },
    (_, i) => roadX + laneWidth * i + laneWidth / 2 - carW / 2,
  )

  const usedLanes = obstacles.map((o) => o.lane)
  const available = lanes.filter((lane) => !usedLanes.includes(lane))
  if (available.length === 0) return

  const lane = available[Math.floor(Math.random() * available.length)]
  const o = {
    x: lane,
    y: -200 - Math.random() * 100,
    w: 80,
    h: 120,
    lane,
    type: 'enemy',
  }

  obstacles.push(o)
}

function spawnPickup() {
  const roadX = 48 // same value used in your spawnObstacle and spawnPickup
  const roadW = baseWidth - roadX * 2
  const laneCount = 5
  const laneWidth = roadW / laneCount
  const coinSize = 14 * spriteScale.coin

  // Lane center X positions (same as obstacles)
  const lanes = Array.from(
    { length: laneCount },
    (_, i) => roadX + laneWidth * i + laneWidth / 2 - coinSize / 2,
  )

  // Filter out lanes where an obstacle already exists nearby
  const safeLanes = lanes.filter((laneX) => {
    return !obstacles.some((o) => {
      const horizontalOverlap = Math.abs(o.x - laneX) < 40 // avoid same/close lane
      const verticalProximity = o.y < 200 // avoid spawning too close above a car
      return horizontalOverlap && verticalProximity
    })
  })

  // No free lane? Skip spawn
  if (safeLanes.length === 0) return

  // Pick a random safe lane
  const lane = safeLanes[Math.floor(Math.random() * safeLanes.length)]

  pickups.push({
    x: lane,
    y: -coinSize - Math.random() * 60,
    w: coinSize,
    h: coinSize,
    kind: 'coin',
  })
}

let roadOffset = 0
let invincible = false
let invincibleTimer = 0

function loop() {
  if (!canvasRef.value || gameState.value !== 'playing') return

  frame++

  const spriteScale = {
    player: 1.5,
    enemy: 1.4,
    coin: 1.5,
  }

  // --- Smooth speed (ease acceleration/deceleration) ---
  const targetSpeed = keys.boost ? 7 : 2.5
  speed.value += (targetSpeed - speed.value) * 0.05

  // --- Smooth continuous road motion ---
  // --- Smooth continuous road motion (downward) ---
  // Road scrolls consistently with speed, but scaled to look natural
  roadOffset = (roadOffset + speed.value * 2.2) % 48

  // --- Spawning (less frequent & well spaced) ---
  const settings = difficultySettings[difficulty.value]

  // --- Car spawn ---
  if (frame % settings.carSpawnInterval === 0) {
    spawnObstacle()
  }

  // --- Coin spawn ---
  if (frame % settings.coinSpawnInterval === 0) {
    spawnPickup()
  }
  // --- Player control ---
  const accel = 0.7 // faster response
  if (keys.left) player.vx -= accel
  if (keys.right) player.vx += accel
  player.vx *= 0.9 // less drag so it feels smooth
  player.x += player.vx

  // Prevent car from moving onto the pavement
  const roadX = 48
  const roadW = baseWidth - roadX * 2
  const playerWidth = player.w * spriteScale.player

  const minX = roadX // left edge of road
  const maxX = roadX + roadW - playerWidth // right edge of road

  if (player.x < minX) player.x = minX
  if (player.x > maxX) player.x = maxX

  // --- Update obstacles ---
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i]
    o.y += speed.value * 1.6
    o.wScaled = o.w * spriteScale.enemy
    o.hScaled = o.h * spriteScale.enemy

    // Remove offscreen
    if (o.y > baseHeight + 60) {
      obstacles.splice(i, 1)
      continue
    }

    // Collision only if not invincible
    // Collision only if not invincible
    if (
      !invincible &&
      rectIntersect(
        { ...o, w: o.wScaled, h: o.hScaled },
        { ...player, w: player.w * spriteScale.player, h: player.h * spriteScale.player },
      )
    ) {
      // --- Collision ---
      lives.value--
      invincible = true
      invincibleTimer = 120 // ~2 seconds at 60fps

      // --- Slow down player temporarily ---
      speed.value = Math.max(1.2, speed.value * 0.4)

      if (lives.value <= 0) endGame()
    }
  }

  // --- Update pickups ---
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i]
    p.y += speed.value * 1.4
    p.wScaled = p.w * spriteScale.coin
    p.hScaled = p.h * spriteScale.coin

    if (p.y > baseHeight + 20) {
      pickups.splice(i, 1)
      continue
    }

    if (
      rectIntersect(
        { ...p, w: p.wScaled, h: p.hScaled },
        { ...player, w: player.w * spriteScale.player, h: player.h * spriteScale.player },
        'coin',
      )
    ) {
      pickups.splice(i, 1)
      score.value += 10
    }
  }

  // --- Invincibility flicker ---
  if (invincible) {
    invincibleTimer--
    if (invincibleTimer <= 0) invincible = false
  }

  // --- Score growth ---
  score.value += 0.015 * speed.value
  trySubmit(score.value)

  // --- Render everything ---
  render(spriteScale)
  requestAnimationFrame(loop)
}

function render(spriteScale) {
  if (!ctx) return
  ctx.fillStyle = '#0b1220'
  ctx.fillRect(0, 0, baseWidth, baseHeight)

  const roadX = 48
  const roadW = baseWidth - roadX * 2
  ctx.fillStyle = '#262626'
  ctx.fillRect(roadX, 0, roadW, baseHeight)

  // --- Center dashed line ---
  ctx.strokeStyle = '#e2b33c'
  ctx.lineWidth = 4
  ctx.setLineDash([24, 24])
  ctx.beginPath()
  ctx.moveTo(baseWidth / 2, roadOffset)
  ctx.lineTo(baseWidth / 2, baseHeight + roadOffset)
  ctx.stroke()
  ctx.setLineDash([])

  // --- Pavement strips (synced with stripes) ---
  // --- Pavement strips (smooth + same direction + tighter spacing) ---
  // --- Pavement strips (synced speed + smooth motion) ---
  const pavementSpacing = 24
  const scroll = -(roadOffset % pavementSpacing)

  for (let y = -scroll; y < baseHeight + pavementSpacing; y += pavementSpacing) {
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(roadX - 24, y, 16, 16)
    ctx.fillRect(roadX + roadW + 8, y, 16, 16)
  }

  // Draw pickups and cars
  pickups.forEach((p) =>
    drawPixelCoin(ctx, p.x, p.y, p.w * spriteScale.coin, p.h * spriteScale.coin),
  )
  obstacles.forEach((o) =>
    drawPixelCar(ctx, o.x, o.y, o.w * spriteScale.enemy, o.h * spriteScale.enemy),
  )

  // Flicker player if invincible
  if (!invincible || frame % 6 < 3) {
    drawPlayer(
      ctx,
      player.x,
      player.y,
      player.w * spriteScale.player,
      player.h * spriteScale.player,
    )
  }

  ctx.fillStyle = '#fff'
  ctx.font = '16px "Press Start 2P", monospace'
  ctx.fillText('S:' + score.value.toFixed(2), 12, 24)
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

// function drawShadow(x, y, w, h) {
//   ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
//   ctx.fillRect(x + 4, y + 6, w, h / 10)
// }

function drawPixelCar(ctx, x, y, w, h, isEnemy = false) {
  ctx.save()

  if (isEnemy) {
    // Flip vertically around the car’s center
    ctx.translate(x + w / 2, y + h / 2)
    ctx.rotate(Math.PI) // 180 degrees
    ctx.translate(-x - w / 2, -y - h / 2)
  }

  // --- Shadow ---
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = 5

  // --- Body gradient ---
  const gradient = ctx.createLinearGradient(x, y, x, y + h)
  gradient.addColorStop(0, '#c40404')
  gradient.addColorStop(0.5, '#7d0b17')
  gradient.addColorStop(1, '#610a1a')

  ctx.fillStyle = gradient
  ctx.fillRect(x, y, w, h)

  // --- Border outline ---
  ctx.shadowColor = 'transparent'
  ctx.lineWidth = 4
  ctx.strokeStyle = '#111'
  ctx.strokeRect(x, y, w, h)

  // --- Roof highlight ---
  const roofGrad = ctx.createLinearGradient(x, y + h * 0.35, x, y + h * 0.65)
  roofGrad.addColorStop(0, 'rgba(255,255,255,0.15)')
  roofGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = roofGrad
  ctx.fillRect(x + w * 0.2, y + h * 0.35, w * 0.6, h * 0.3)

  // --- Windshield ---
  ctx.fillStyle = '#0d0d0d'
  ctx.fillRect(x + w * 0.15, y + h * 0.15, w * 0.7, h * 0.2)

  // --- Headlights ---
  ctx.fillStyle = '#e6e6e6'
  ctx.fillRect(x + w * 0.1, y + h * 0.02, w * 0.25, h * 0.05)
  ctx.fillRect(x + w * 0.65, y + h * 0.02, w * 0.25, h * 0.05)

  // --- Tail lights ---
  ctx.fillStyle = '#f2a305'
  ctx.fillRect(x + w * 0.1, y + h * 0.93, w * 0.25, h * 0.05)
  ctx.fillRect(x + w * 0.65, y + h * 0.93, w * 0.25, h * 0.05)

  ctx.restore()
}

function drawPlayer(ctx, x, y, w, h) {
  ctx.save()

  // --- Shadow ---
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 6

  // --- Car body with gradient ---
  const gradient = ctx.createLinearGradient(x, y, x, y + h)
  gradient.addColorStop(0, '#ffa84d')
  gradient.addColorStop(0.5, '#ff7b00')
  gradient.addColorStop(1, '#b35900')

  ctx.fillStyle = gradient
  ctx.fillRect(x, y, w, h)

  // --- Border outline ---
  ctx.shadowColor = 'transparent' // disable shadow for stroke
  ctx.lineWidth = 3
  ctx.strokeStyle = '#222'
  ctx.strokeRect(x, y, w, h)

  // --- Windshield ---
  ctx.fillStyle = '#1c1c1c'
  ctx.fillRect(x + w * 0.15, y + h * 0.15, w * 0.7, h * 0.2)

  // --- Roof reflection ---
  const roofGrad = ctx.createLinearGradient(x, y + h * 0.4, x, y + h * 0.7)
  roofGrad.addColorStop(0, 'rgba(255,255,255,0.3)')
  roofGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = roofGrad
  ctx.fillRect(x + w * 0.2, y + h * 0.4, w * 0.6, h * 0.3)

  // --- Headlights ---
  ctx.fillStyle = '#ffffcc'
  ctx.fillRect(x + w * 0.1, y + h * 0.02, w * 0.25, h * 0.05)
  ctx.fillRect(x + w * 0.65, y + h * 0.02, w * 0.25, h * 0.05)

  // --- Tail lights ---
  ctx.fillStyle = '#ff3333'
  ctx.fillRect(x + w * 0.1, y + h * 0.93, w * 0.25, h * 0.05)
  ctx.fillRect(x + w * 0.65, y + h * 0.93, w * 0.25, h * 0.05)

  ctx.restore()
}

function drawPixelCoin(ctx, x, y, w, h) {
  ctx.save()

  // --- Shadow ---
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetY = 3

  // --- Coin body ---
  const gradient = ctx.createRadialGradient(
    x + w / 2,
    y + h / 2,
    w * 0.2,
    x + w / 2,
    y + h / 2,
    w / 2,
  )
  gradient.addColorStop(0, '#fff6b3')
  gradient.addColorStop(0.4, '#ffd633')
  gradient.addColorStop(1, '#b38f00')

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2)
  ctx.fill()

  // --- Rim outline ---
  ctx.shadowColor = 'transparent'
  ctx.lineWidth = 2
  ctx.strokeStyle = '#996600'
  ctx.stroke()

  // --- Inner shine curve ---
  ctx.beginPath()
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.lineWidth = 1
  ctx.arc(x + w / 2, y + h / 2, w * 0.35, -Math.PI / 3, Math.PI / 6)
  ctx.stroke()

  ctx.restore()
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
  text-shadow: none;
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
.difficulty-btn {
  background-color: v-bind('--btn-color'); /* key part */
  border: 2px solid transparent;
  color: #fff;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.25s ease;
}

.difficulty-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 0 10px var(--btn-color);
}

.difficulty-btn.selected {
  border: 3px solid #fff;
  transform: scale(1.15);
  box-shadow:
    0 0 16px var(--btn-color),
    0 0 32px var(--btn-color);
}

.difficulty-btn:active {
  transform: scale(1.05);
  filter: brightness(1.2);
}
</style>
