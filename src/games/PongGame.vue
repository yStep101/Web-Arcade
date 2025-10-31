<template>
  <div class="game">
    <div class="top-bar">
      <button class="back-btn" @click="goBack">⬅ Back to Hub</button>
      <h1>Pong</h1>
    </div>

    <div class="controls">
      <button @click="startGame" :disabled="running">Start</button>
      <button @click="pauseGame" :disabled="!running">Pause</button>
      <button @click="resetGame">Reset</button>
      <label>
        <input type="checkbox" v-model="aiEnabled" />
        AI Opponent
      </label>
    </div>

    <canvas ref="canvas" width="800" height="500"></canvas>

    <div class="scoreboard">
      <span>{{ leftScore }}</span>
      <span> | </span>
      <span>{{ rightScore }}</span>
      <div class="highscore">High Score: {{ highScore }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useScoreSubmit } from '@/composables/useScoreSubmit'

const { trySubmit, resetBest } = useScoreSubmit('Pong')

const router = useRouter()
const canvas = ref(null)
const running = ref(false)
const aiEnabled = ref(true)
const leftScore = ref(0)
const rightScore = ref(0)
const highScore = ref(0)

// get current user (saved during login)
const currentUser = localStorage.getItem('currentUser') || 'guest'

let ctx, leftY, rightY, ball, keys, gameLoop, delayActive
const paddleHeight = 80
const paddleWidth = 10
let audioCtx
let ballMoving = false

function goBack() {
  if (gameLoop) cancelAnimationFrame(gameLoop)
  router.push('/hub')
}

function initGame() {
  leftY = 200
  rightY = 200
  ball = { x: 400, y: 250, dx: 0, dy: 0, size: 10 }
  keys = {}
  delayActive = false
  ballMoving = false
  draw()
  resetBall()
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  audioCtx = new (window.AudioContext || window.webkitAudioContext)()

  // Load user's saved high score
  const savedScore = localStorage.getItem(`${currentUser}_pong_highscore`)
  if (savedScore) highScore.value = parseInt(savedScore)

  window.addEventListener('keydown', (e) => (keys[e.key] = true))
  window.addEventListener('keyup', (e) => (keys[e.key] = false))
  initGame()
})

onUnmounted(() => {
  window.removeEventListener('keydown', (e) => (keys[e.key] = true))
  window.removeEventListener('keyup', (e) => (keys[e.key] = false))
})

function playSound(frequency, duration = 0.1, type = 'square', volume = 0.3) {
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = type
  osc.frequency.value = frequency
  gain.gain.value = volume
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start()
  osc.stop(audioCtx.currentTime + duration)
}

function playBounce() {
  playSound(400 + Math.random() * 100, 0.05, 'square', 0.2)
}
function playWall() {
  playSound(250, 0.08, 'sawtooth', 0.2)
}
function playScore() {
  playSound(180, 0.3, 'triangle', 0.3)
}

function startGame() {
  if (!running.value) {
    running.value = true
    gameLoop = requestAnimationFrame(update)
  }
}

function pauseGame() {
  running.value = false
  if (gameLoop) cancelAnimationFrame(gameLoop)
}

function resetGame() {
  pauseGame()
  leftScore.value = 0
  rightScore.value = 0
  resetBest()
  initGame()
}

function update() {
  draw()
  movePaddles()
  if (ballMoving && !delayActive) moveBall()
  if (running.value) gameLoop = requestAnimationFrame(update)
}

function draw() {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, 800, 500)

  ctx.strokeStyle = 'white'
  ctx.setLineDash([5, 15])
  ctx.beginPath()
  ctx.moveTo(400, 0)
  ctx.lineTo(400, 500)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = 'white'
  ctx.fillRect(20, leftY, paddleWidth, paddleHeight)
  ctx.fillRect(770, rightY, paddleWidth, paddleHeight)

  ctx.beginPath()
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2)
  ctx.fill()
}

function movePaddles() {
  if (keys['w'] && leftY > 0) leftY -= 6
  if (keys['s'] && leftY < 500 - paddleHeight) leftY += 6

  if (!aiEnabled.value) {
    if (keys['ArrowUp'] && rightY > 0) rightY -= 6
    if (keys['ArrowDown'] && rightY < 500 - paddleHeight) rightY += 6
  } else {
    const aiSpeed = 3.3
    const errorMargin = Math.random() * 70 - 35
    const targetY = ball.y - paddleHeight / 2 + errorMargin
    if (targetY < rightY) rightY -= aiSpeed
    if (targetY > rightY) rightY += aiSpeed
    rightY = Math.max(0, Math.min(500 - paddleHeight, rightY))
  }
}

function moveBall() {
  ball.x += ball.dx
  ball.y += ball.dy

  if (ball.y + ball.size > 500 || ball.y - ball.size < 0) {
    ball.dy *= -1
    playWall()
  }

  if (ball.x - ball.size < 30 && ball.y > leftY && ball.y < leftY + paddleHeight) {
    ball.dx *= -1.05
    ball.x = 30 + ball.size
    playBounce()
  }
  if (ball.x + ball.size > 770 && ball.y > rightY && ball.y < rightY + paddleHeight) {
    ball.dx *= -1.05
    ball.x = 770 - ball.size
    playBounce()
  }

  if (ball.x < 0) {
    rightScore.value++
    playScore()
    checkHighScore()
    scoreDelay(false)
    trySubmit(rightScore.value)
  } else if (ball.x > 800) {
    leftScore.value++
    playScore()
    checkHighScore()
    scoreDelay(true)
    trySubmit(leftScore.value)
  }
}

function checkHighScore() {
  // assuming player is left side
  if (leftScore.value > highScore.value) {
    highScore.value = leftScore.value
    localStorage.setItem(`${currentUser}_pong_highscore`, highScore.value)
  }
}

function scoreDelay(toLeft) {
  delayActive = true
  resetBall(toLeft)
  setTimeout(() => (delayActive = false), 1000)
}

function resetBall(toLeft) {
  ball.x = 400
  ball.y = 250
  const speed = 5
  const angle = (Math.random() * Math.PI) / 2 - Math.PI / 4
  const direction = toLeft ? -1 : Math.random() < 0.5 ? -1 : 1
  const verticalDir = Math.random() < 0.5 ? -1 : 1
  ball.dx = direction * speed * Math.cos(angle)
  ball.dy = verticalDir * speed * Math.sin(angle)
  ballMoving = false
  setTimeout(() => (ballMoving = true), 800)
}
</script>

<style scoped>
.game {
  text-align: center;
  color: white;
  font-family: 'Orbitron', sans-serif;
}

.top-bar {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.back-btn {
  position: absolute;
  left: 20px;
  top: 5px;
  background: #00ffcc;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  color: black;
  transition: 0.2s;
}

.back-btn:hover {
  background: #00cc99;
}

canvas {
  background: black;
  display: block;
  margin: 20px auto;
  border: 2px solid #00ffcc;
  box-shadow: 0 0 10px #00ffcc;
}

h1 {
  color: #00ffcc;
  text-shadow: 0 0 10px #00ffcc;
}

.scoreboard {
  margin-top: 10px;
  font-size: 24px;
  color: #00ffcc;
  text-shadow: 0 0 8px #00ffcc;
}

.highscore {
  margin-top: 5px;
  font-size: 18px;
  color: #ff66cc;
  text-shadow: 0 0 8px #ff66cc;
}

.controls {
  margin: 10px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

button {
  background: transparent;
  color: #00ffcc;
  border: 1px solid #00ffcc;
  padding: 6px 12px;
  cursor: pointer;
  font-family: inherit;
  transition: 0.2s;
}

button:hover:not(:disabled) {
  background: #00ffcc;
  color: black;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

label {
  font-size: 14px;
  color: #00ffcc;
}
</style>
