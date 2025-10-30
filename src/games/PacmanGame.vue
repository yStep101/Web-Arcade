<template>
  <div class="game">
    <h1>Pac-Man</h1>
    <canvas ref="canvas" width="420" height="420"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const canvas = ref(null)

onMounted(() => {
  const ctx = canvas.value.getContext('2d')
  const gridSize = 20
  const rows = map.length
  const cols = map[0].length

  // 0 = dot, 1 = wall, 2 = empty
  const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 2, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 2, 1, 0, 1],
    [1, 0, 1, 2, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 0, 2, 1, 1, 1, 1, 1, 2, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 2, 1, 1, 1, 1, 1, 2, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 2, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ]

  const pacman = { x: 1, y: 1, dx: 0, dy: 0 }
  const ghost = { x: 10, y: 9, dx: 0, dy: 0 }
  let score = 0

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      pacman.dx = 0
      pacman.dy = -1
    }
    if (e.key === 'ArrowDown') {
      pacman.dx = 0
      pacman.dy = 1
    }
    if (e.key === 'ArrowLeft') {
      pacman.dx = -1
      pacman.dy = 0
    }
    if (e.key === 'ArrowRight') {
      pacman.dx = 1
      pacman.dy = 0
    }
  })

  function movePlayer() {
    const nextX = pacman.x + pacman.dx
    const nextY = pacman.y + pacman.dy
    if (map[nextY][nextX] !== 1) {
      pacman.x = nextX
      pacman.y = nextY
      if (map[nextY][nextX] === 0) {
        map[nextY][nextX] = 2
        score++
      }
    }
  }

  function moveGhost() {
    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ]
    const d = dirs[Math.floor(Math.random() * dirs.length)]
    const nx = ghost.x + d.dx
    const ny = ghost.y + d.dy
    if (map[ny][nx] !== 1) {
      ghost.x = nx
      ghost.y = ny
    }
  }

  function drawMap() {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (map[y][x] === 1) {
          ctx.fillStyle = 'blue'
          ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize)
        } else if (map[y][x] === 0) {
          ctx.fillStyle = 'white'
          ctx.beginPath()
          ctx.arc(x * gridSize + 10, y * gridSize + 10, 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }

  function drawPacman() {
    ctx.fillStyle = 'yellow'
    ctx.beginPath()
    ctx.arc(pacman.x * gridSize + 10, pacman.y * gridSize + 10, 9, 0.25 * Math.PI, 1.75 * Math.PI)
    ctx.lineTo(pacman.x * gridSize + 10, pacman.y * gridSize + 10)
    ctx.fill()
  }

  function drawGhost() {
    ctx.fillStyle = 'red'
    ctx.beginPath()
    ctx.arc(ghost.x * gridSize + 10, ghost.y * gridSize + 10, 9, Math.PI, 0)
    ctx.lineTo(ghost.x * gridSize + 1, ghost.y * gridSize + 10)
    ctx.fill()
  }

  function gameLoop() {
    ctx.clearRect(0, 0, 420, 420)
    drawMap()
    movePlayer()
    moveGhost()
    drawPacman()
    drawGhost()

    // check collision
    if (pacman.x === ghost.x && pacman.y === ghost.y) {
      alert(`Game Over! Score: ${score}`)
      window.location.reload()
    }

    // check win
    if (map.flat().every((v) => v !== 0)) {
      alert(`You win! Final score: ${score}`)
      window.location.reload()
    }

    ctx.fillStyle = 'white'
    ctx.fillText(`Score: ${score}`, 10, 15)

    setTimeout(gameLoop, 120)
  }

  gameLoop()
})
</script>

<style scoped>
canvas {
  background: black;
  display: block;
  margin: 20px auto;
  border: 2px solid white;
}
h1 {
  text-align: center;
  color: white;
}
</style>
