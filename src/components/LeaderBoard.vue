<template>
  <div class="leaderboard">
    <h2>Local Leaderboard</h2>
    <ul>
      <li v-for="(score, index) in scores" :key="index">
        {{ index + 1 }}. {{ score.name }} — {{ score.points }}
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
  background: #111;
  border: 2px solid #00ffcc;
  padding: 1rem;
  border-radius: 12px;
}
</style>
