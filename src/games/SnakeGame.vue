<template>
  <div class="game">
    <div class="top-bar">
      <button @click="goBack">⬅ Back to Hub</button>
      <h1>Snake</h1>
      <button @click="restart">⟳ Restart</button>
    </div>

    <canvas ref="canvas" width="400" height="400"></canvas>

    <div v-if="gameOver" class="overlay">
      <h2>Game Over!</h2>
      <p>Score: {{ score }}</p>
      <button @click="restart">Restart</button>
      <button @click="goBack">Back to Hub</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const canvas = ref(null)
const score = ref(0)
const gameOver = ref(false)

let ctx
const box = 20
let snake, food, dir, gameLoop
let audioCtx, bgGain, sfxGain, bgOscillator

// 🧠 Load saved audio settings
function loadSettings() {
  const saved = JSON.parse(localStorage.getItem('arcadeSettings')) || {}
  return {
    musicVolume: (saved.musicVolume ?? 60) / 100,
    sfxVolume: (saved.sfxVolume ?? 70) / 100,
  }
}

// 🎵 Initialize Web Audio API background music
function initAudio() {
  const { musicVolume, sfxVolume } = loadSettings()

  audioCtx = new (window.AudioContext || window.webkitAudioContext)()

  // Background music oscillator
  bgOscillator = audioCtx.createOscillator()
  bgOscillator.type = 'sine'
  bgOscillator.frequency.setValueAtTime(220, audioCtx.currentTime)

  bgGain = audioCtx.createGain()
  bgGain.gain.setValueAtTime(musicVolume * 0.15, audioCtx.currentTime) // soft background hum

  bgOscillator.connect(bgGain).connect(audioCtx.destination)
  bgOscillator.start()

  // SFX gain node for munch sounds
  sfxGain = audioCtx.createGain()
  sfxGain.gain.setValueAtTime(sfxVolume, audioCtx.currentTime)
  sfxGain.connect(audioCtx.destination)
}

// 🍎 Play “munch” sound when food is eaten
function playMunchSound() {
  if (!audioCtx) return
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(600, audioCtx.currentTime)
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime)
  osc.connect(gain).connect(sfxGain)
  osc.start()
  osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2)
  osc.stop(audioCtx.currentTime + 0.2)
}

// 🚫 Stop background music
function stopAudio() {
  if (bgOscillator) {
    try { bgOscillator.stop() } catch {}
    bgOscillator.disconnect()
  }
  if (audioCtx) audioCtx.close()
}

function goBack() {
  stopAudio()
  if (gameLoop) clearInterval(gameLoop)
  router.push('/hub')
}

function restart() {
  score.value = 0
  gameOver.value = false
  snake = [{ x: 9 * box, y: 10 * box }]
  dir = ['LEFT', 'RIGHT', 'UP', 'DOWN'][Math.floor(Math.random() * 4)]
  food = {
    x: Math.floor(Math.random() * 19 + 1) * box,
    y: Math.floor(Math.random() * 19 + 1) * box,
  }
  if (gameLoop) clearInterval(gameLoop)
  gameLoop = setInterval(draw, 100)
}

function draw() {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 400, 400)

  for (let i = 0; i < snake.length; i++) {
    const grad = ctx.createLinearGradient(0, 0, 400, 400)
    grad.addColorStop(0, 'lime')
    grad.addColorStop(1, 'cyan')
    ctx.fillStyle = i === 0 ? grad : '#aaffaa'
    ctx.shadowBlur = 8
    ctx.shadowColor = '#00ff99'
    ctx.fillRect(snake[i].x, snake[i].y, box, box)
  }

  const foodGrad = ctx.createRadialGradient(food.x + 10, food.y + 10, 2, food.x + 10, food.y + 10, 10)
  foodGrad.addColorStop(0, 'yellow')
  foodGrad.addColorStop(1, 'orange')
  ctx.shadowBlur = 15
  ctx.shadowColor = 'orange'
  ctx.fillStyle = foodGrad
  ctx.fillRect(food.x, food.y, box, box)

  let headX = snake[0].x
  let headY = snake[0].y

  if (dir === 'LEFT') headX -= box
  if (dir === 'UP') headY -= box
  if (dir === 'RIGHT') headX += box
  if (dir === 'DOWN') headY += box

  if (headX === food.x && headY === food.y) {
    score.value++
    playMunchSound() // 🍎 play sound on eat
    food = {
      x: Math.floor(Math.random() * 19 + 1) * box,
      y: Math.floor(Math.random() * 19 + 1) * box,
    }
    clearInterval(gameLoop)
    gameLoop = setInterval(draw, Math.max(60, 100 - score.value * 2))
  } else {
    snake.pop()
  }

  const newHead = { x: headX, y: headY }

  if (
    headX < 0 ||
    headY < 0 ||
    headX >= 400 ||
    headY >= 400 ||
    snake.some((s) => s.x === newHead.x && s.y === newHead.y)
  ) {
    clearInterval(gameLoop)
    gameOver.value = true
    stopAudio()
    return
  }

  snake.unshift(newHead)

  ctx.shadowBlur = 0
  ctx.fillStyle = 'white'
  ctx.font = '16px Orbitron'
  ctx.fillText(`Score: ${score.value}`, 10, 20)
}

function handleKey(e) {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault()
  if (e.key === 'ArrowLeft' && dir !== 'RIGHT') dir = 'LEFT'
  if (e.key === 'ArrowUp' && dir !== 'DOWN') dir = 'UP'
  if (e.key === 'ArrowRight' && dir !== 'LEFT') dir = 'RIGHT'
  if (e.key === 'ArrowDown' && dir !== 'UP') dir = 'DOWN'
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  document.addEventListener('keydown', handleKey)
  initAudio()
  restart()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKey)
  if (gameLoop) clearInterval(gameLoop)
  stopAudio()
})
</script>

<style scoped>
body {
  overflow: hidden;
}

.game {
  text-align: center;
  color: white;
  font-family: 'Orbitron', sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #000 60%, #020d10);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 400px;
  margin-bottom: 10px;
}

canvas {
  background: #000;
  border: 2px solid white;
  box-shadow: 0 0 20px #00ffcc;
}

button {
  background: #00ffcc;
  border: none;
  padding: 8px 16px;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  border-radius: 8px;
  color: black;
  transition: all 0.2s;
}

button:hover {
  background: #00cc99;
}

.overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  padding: 25px 40px;
  border: 2px solid #00ffcc;
  border-radius: 12px;
  box-shadow: 0 0 25px #00ffcc;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.overlay h2 {
  margin-bottom: 5px;
}

.overlay button {
  width: 150px;
}
</style>
