<template>
  <div class="game">
    <!-- 🎮 Top Bar -->
    <div class="top-bar">
      <button class="back-btn" @click="goBack">⬅ Back to Hub</button>
      <h1 class="title">Tetris</h1>
      <button class="restart-btn" @click="restart">⟳ Restart</button>
    </div>

    <!-- 🧮 Score Display -->
    <div class="score-display">
      <p>Score: <span>{{ score }}</span></p>
    </div>

    <!-- 🎮 Game Canvas -->
    <canvas ref="canvas" width="240" height="480"></canvas>

    <!-- 💀 Game Over Overlay -->
    <div v-if="gameOver" class="overlay">
      <h2>Game Over</h2>
      <p>Your Score: {{ score }}</p>
      <button @click="restart">Play Again</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const canvas = ref(null)
let ctx

const score = ref(0)
const gameOver = ref(false)
let board, piece, dropCounter, dropInterval, lastTime
let audioCtx, sfxGain

// Settings / audio
function loadSettings() {
  const saved = JSON.parse(localStorage.getItem("arcadeSettings")) || {}
  return { sfxVolume: (saved.sfxVolume ?? 70) / 100 }
}

function initAudio() {
  const { sfxVolume } = loadSettings()
  audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  sfxGain = audioCtx.createGain()
  sfxGain.gain.value = sfxVolume
  sfxGain.connect(audioCtx.destination)
}

function playSound(freq, duration = 0.1) {
  if (!audioCtx) return
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = "square"
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime)
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime)
  osc.connect(gain).connect(sfxGain)
  osc.start()
  osc.stop(audioCtx.currentTime + duration)
}

// Tetrominoes and colors
const pieces = "TJLOSZI".split("")
const colors = {
  T: "#FF00FF",
  J: "#00FFFF",
  L: "#FFA500",
  O: "#FFFF00",
  S: "#00FF00",
  Z: "#FF0000",
  I: "#00BFFF",
}

function createPiece(type) {
  switch (type) {
    case "T":
      return [
        [0, 1, 0],
        [1, 1, 1],
      ]
    case "O":
      return [
        [1, 1],
        [1, 1],
      ]
    case "L":
      return [
        [0, 0, 1],
        [1, 1, 1],
      ]
    case "J":
      return [
        [1, 0, 0],
        [1, 1, 1],
      ]
    case "I":
      return [[1, 1, 1, 1]]
    case "S":
      return [
        [0, 1, 1],
        [1, 1, 0],
      ]
    case "Z":
      return [
        [1, 1, 0],
        [0, 1, 1],
      ]
  }
}

function createMatrix(w, h) {
  return Array.from({ length: h }, () => Array(w).fill(0))
}

function collide(board, pieceObj) {
  const { matrix, pos } = pieceObj
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x] !== 0) {
        const by = y + pos.y
        const bx = x + pos.x
        if (
          by >= board.length ||
          bx < 0 ||
          bx >= board[0].length ||
          board[by][bx] !== 0
        ) {
          return true
        }
      }
    }
  }
  return false
}

function merge(board, pieceObj) {
  pieceObj.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) board[y + pieceObj.pos.y][x + pieceObj.pos.x] = pieceObj.color
    })
  })
}

function playerReset() {
  const type = pieces[Math.floor(Math.random() * pieces.length)]
  piece.matrix = createPiece(type)
  piece.color = colors[type]
  piece.pos.y = 0
  piece.pos.x =
    Math.floor(board[0].length / 2) - Math.floor(piece.matrix[0].length / 2)
  if (collide(board, piece)) {
    gameOver.value = true
  }
}

function clearLines() {
  let cleared = 0
  outer: for (let y = board.length - 1; y >= 0; y--) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] === 0) continue outer
    }
    board.splice(y, 1)
    board.unshift(Array(board[0].length).fill(0))
    cleared++
    y++
  }
  if (cleared > 0) {
    score.value += cleared * 5
    playSound(800, 0.3)
  }
}

function drawMatrix(matrix, offset, color) {
  const size = 24
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 8
        ctx.fillRect((x + offset.x) * size, (y + offset.y) * size, size, size)
        ctx.strokeStyle = "#111"
        ctx.strokeRect((x + offset.x) * size, (y + offset.y) * size, size, size)
      }
    })
  })
}

function draw() {
  const size = 24
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)
  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell !== 0) {
        ctx.fillStyle = cell
        ctx.shadowColor = cell
        ctx.shadowBlur = 6
        ctx.fillRect(x * size, y * size, size, size)
        ctx.strokeStyle = "#111"
        ctx.strokeRect(x * size, y * size, size, size)
      }
    })
  })
  drawMatrix(piece.matrix, piece.pos, piece.color)
}

function drop() {
  piece.pos.y++
  if (collide(board, piece)) {
    piece.pos.y--
    merge(board, piece)
    playSound(300, 0.1)
    clearLines()
    playerReset()
  }
  dropCounter = 0
}

function update(time = 0) {
  const deltaTime = time - lastTime
  lastTime = time
  dropCounter += deltaTime
  if (dropCounter > dropInterval) drop()
  draw()
  if (!gameOver.value) requestAnimationFrame(update)
}

function move(offset) {
  piece.pos.x += offset
  if (collide(board, piece)) piece.pos.x -= offset
  const maxX = board[0].length - piece.matrix[0].length
  piece.pos.x = Math.max(0, Math.min(piece.pos.x, maxX))
}

function rotate(matrix, dir) {
  const w = matrix[0].length
  const h = matrix.length
  const transposed = Array.from({ length: w }, (_, i) =>
    Array.from({ length: h }, (_, j) => matrix[j][i])
  )
  return dir > 0 ? transposed.map(row => row.reverse()) : transposed.reverse()
}

function rotatePiece(dir) {
  const oldMatrix = piece.matrix
  const newMatrix = rotate(piece.matrix, dir)
  piece.matrix = newMatrix
  let offset = 1
  while (collide(board, piece)) {
    piece.pos.x += offset
    offset = -(offset + (offset > 0 ? 1 : -1))
    if (Math.abs(offset) > board[0].length) {
      piece.matrix = oldMatrix
      return
    }
  }
  playSound(600, 0.05)
}

function handleKey(e) {
  const key = e.key
  if (key === "ArrowLeft" || key === "a") move(-1)
  else if (key === "ArrowRight" || key === "d") move(1)
  else if (key === "ArrowUp" || key === "w") rotatePiece(1)
  else if (key === "ArrowDown" || key === "s") drop()
}

function restart() {
  gameOver.value = false
  score.value = 0
  board = createMatrix(10, 20)
  piece = { pos: { x: 0, y: 0 }, matrix: null, color: "#fff" }
  playerReset()
  dropCounter = 0
  dropInterval = 700
  lastTime = performance.now()
  update(lastTime)
}

function goBack() {
  if (audioCtx) audioCtx.close()
  router.push("/hub")
}

onMounted(() => {
  ctx = canvas.value.getContext("2d")
  initAudio()
  restart()
  document.addEventListener("keydown", handleKey)
})

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKey)
  if (audioCtx) audioCtx.close()
})
</script>

<style scoped>
body {
  overflow: hidden;
}
.game {
  text-align: center;
  color: white;
  font-family: "Orbitron", sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #000 60%, #020d10);
  position: relative;
}

/* Back button */
.back-btn {
  position: fixed;
  top: 15px;
  left: 15px;
  background: #00ffcc;
  border: none;
  padding: 6px 12px;
  font-size: 0.9rem;
  font-family: "Orbitron", sans-serif;
  cursor: pointer;
  border-radius: 6px;
  color: black;
  transition: all 0.2s;
  z-index: 10;
}
.back-btn:hover {
  background: #00cc99;
}

/* Top bar */
.top-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 240px;
  margin-bottom: 10px;
  position: relative;
}
.title {
  flex: 1;
  text-align: center;
  font-size: 1.5rem;
  color: #00ffcc;
  text-shadow: 0 0 10px #00ffcc;
}
.restart-btn {
  background: #00ffcc;
  border: none;
  padding: 6px 12px;
  font-size: 0.9rem;
  font-family: "Orbitron", sans-serif;
  cursor: pointer;
  border-radius: 6px;
  color: black;
  position: absolute;
  right: -70px;
  transition: all 0.2s;
}
.restart-btn:hover {
  background: #00cc99;
}

/* Score Display */
.score-display {
  font-size: 1rem;
  color: #00ffcc;
  margin-bottom: 6px;
  text-shadow: 0 0 8px #00ffcc;
}
.score-display span {
  font-weight: bold;
  color: #fff;
}

canvas {
  border: 2px solid white;
  box-shadow: 0 0 20px #00ffcc;
  background: #000;
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
</style>
