<template>
  <div class="game">
    <h1>Pong</h1>
    <canvas ref="canvas" width="800" height="500"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const canvas = ref(null)

onMounted(() => {
  const ctx = canvas.value.getContext('2d')
  const paddleHeight = 80,
    paddleWidth = 10
  let leftY = 200,
    rightY = 200
  const ball = { x: 400, y: 250, dx: 4, dy: 4, size: 10 }

  const keys = {}

  window.addEventListener('keydown', (e) => (keys[e.key] = true))
  window.addEventListener('keyup', (e) => (keys[e.key] = false))

  function draw() {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, 800, 500)

    // paddles
    ctx.fillStyle = 'white'
    ctx.fillRect(20, leftY, paddleWidth, paddleHeight)
    ctx.fillRect(770, rightY, paddleWidth, paddleHeight)

    // ball
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2)
    ctx.fill()

    // movement
    if (keys['w'] && leftY > 0) leftY -= 6
    if (keys['s'] && leftY < 500 - paddleHeight) leftY += 6
    if (keys['ArrowUp'] && rightY > 0) rightY -= 6
    if (keys['ArrowDown'] && rightY < 500 - paddleHeight) rightY += 6

    ball.x += ball.dx
    ball.y += ball.dy

    // wall bounce
    if (ball.y + ball.size > 500 || ball.y - ball.size < 0) ball.dy *= -1

    // paddle bounce
    if (ball.x - ball.size < 30 && ball.y > leftY && ball.y < leftY + paddleHeight) ball.dx *= -1

    if (ball.x + ball.size > 770 && ball.y > rightY && ball.y < rightY + paddleHeight) ball.dx *= -1

    // reset if ball out of bounds
    if (ball.x < 0 || ball.x > 800) {
      ball.x = 400
      ball.y = 250
      ball.dx *= -1
    }

    requestAnimationFrame(draw)
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
