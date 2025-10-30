<template>
  <div class="leaderboard">
    <h2>🏆 Local Leaderboard 🏆</h2>
    <ul>
      <li v-for="(score, index) in scores" :key="index">
        <span class="rank">{{ index + 1 }}.</span>
        <span class="name">{{ score.name }}</span>
        <span class="points">{{ score.points }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
const scores = [
  { name: 'Rohan', points: 120 },
  { name: 'Diya', points: 90 },
  { name: 'Player3', points: 70 },
]
</script>

<style scoped>
.leaderboard {
  background: linear-gradient(180deg, #0f0f2d 0%, #0a0a0f 100%);
  border: 2px solid #ff00c8;
  padding: 1.5rem;
  border-radius: 16px;
  max-width: 400px;
  margin: 0 auto;
  color: #fff;
  box-shadow: 0 0 15px #ff00c8;
}

h2 {
  color: #ff00c8;
  text-shadow: 0 0 10px #ff00c8;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 0.5rem 0;
  font-size: 1rem;
  display: flex;
  justify-content: space-between;
  text-shadow: 0 0 5px #00fff7;
}

.rank {
  color: #ff00c8;
}
.points {
  color: #00fff7;
}
</style>
