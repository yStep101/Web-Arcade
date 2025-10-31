<template>
  <div class="leaderboard">
    <h1>🏆 Global Leaderboard</h1>

    <div v-if="loading" class="loading">Loading...</div>

    <div v-else>
      <div v-for="(entries, game) in groupedScores" :key="game" class="game-block">
        <h2>{{ game }}</h2>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(entry, i) in entries.slice(0, 10)" :key="i">
              <td>{{ i + 1 }}</td>
              <td>{{ entry.username }}</td>
              <td>{{ entry.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getLeaderboard } from '@/utils/leaderboard'

const scores = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    scores.value = await getLeaderboard()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

const groupedScores = computed(() => {
  const groups = {}
  for (const entry of scores.value) {
    if (!groups[entry.game]) groups[entry.game] = []
    groups[entry.game].push(entry)
  }
  for (const g in groups) {
    groups[g].sort((a, b) => b.score - a.score)
  }
  return groups
})
</script>

<style scoped>
.leaderboard {
  font-family: 'Orbitron', sans-serif;
  color: white;
  padding: 20px;
  text-align: center;
  background: radial-gradient(circle at center, #000 70%, #020d10);
  min-height: 100vh;
}
h1 {
  color: #00ffcc;
  margin-bottom: 20px;
}
.game-block {
  background: rgba(0, 0, 0, 0.8);
  margin: 20px auto;
  padding: 20px;
  width: 80%;
  border: 2px solid #00ffcc;
  border-radius: 12px;
  box-shadow: 0 0 25px #00ffcc;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 10px;
  border-bottom: 1px solid #00ffcc;
}
.loading {
  color: #00ffcc;
  font-size: 20px;
}
</style>
