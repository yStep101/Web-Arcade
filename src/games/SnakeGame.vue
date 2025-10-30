<template>
  <div class="game">
    <h1>Snake</h1>
    <canvas ref="canvas" width="400" height="400"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const canvas = ref(null)

onMounted(() => {
  const ctx = canvas.value.getContext('2d')
  const box = 20
  let snake = [{ x: 9 * box, y: 10 * box }]
  let food = {
    x: Math.floor(Math.random() * 19 + 1) * box,
    y: Math.floor(Math.random() * 19 + 1) * box,
  }
  let dir = null
  let score = 0

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && dir !== 'RIGHT') dir = 'LEFT'
    if (e.key === 'ArrowUp' && dir !== 'DOWN') dir = 'UP'
    if (e.key === 'ArrowRight' && dir !== 'LEFT') dir = 'RIGHT'
    if (e.key === 'ArrowDown' && dir !== 'UP') dir = 'DOWN'
  })

  function draw() {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, 400, 400)

    for (let i = 0; i < snake.length; i++) {
      ctx.fillStyle = i === 0 ? 'lime' : 'white'
      ctx.fillRect(snake[i].x, snake[i].y, box, box)
    }

    ctx.fillStyle = 'red'
    ctx.fillRect(food.x, food.y, box, box)

    let headX = snake[0].x
    let headY = snake[0].y

    if (dir === 'LEFT') headX -= box
    if (dir === 'UP') headY -= box
    if (dir === 'RIGHT') headX += box
    if (dir === 'DOWN') headY += box

    if (headX === food.x && headY === food.y) {
      score++
      food = {
        x: Math.floor(Math.random() * 19 + 1) * box,
        y: Math.floor(Math.random() * 19 + 1) * box,
      }
    } else {
      snake.pop()
    }

    const newHead = { x: headX, y: headY }

    // collision
    if (
      headX < 0 ||
      headY < 0 ||
      headX >= 400 ||
      headY >= 400 ||
      snake.some((s) => s.x === newHead.x && s.y === newHead.y)
    ) {
      alert(`Game Over! Score: ${score}`)
      snake = [{ x: 9 * box, y: 10 * box }]
      dir = null
      score = 0
      return draw()
    }

    snake.unshift(newHead)
    ctx.fillStyle = 'white'
    ctx.fillText(`Score: ${score}`, 10, 20)

    setTimeout(draw, 100)
  }

  draw()
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
