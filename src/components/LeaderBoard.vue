<template>
  <div class="leaderboard">
    <h1>🏆 Global Leaderboard</h1>

    <div v-if="loading" class="loading">Loading...</div>

    <div v-else>
      <!-- 🌍 Overall Total Scores -->
      <div class="game-block">
        <h2>Overall Ranking</h2>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Total Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(player, i) in totalScores" :key="player.username">
              <td>{{ i + 1 }}</td>
              <td>{{ player.username }}</td>
              <td>{{ player.total.toFixed(0) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 🕹️ Per-Game Leaderboards -->
      <div v-for="(entries, game) in filteredScores" :key="game" class="game-block">
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
              <td>{{ entry.score.toFixed(0) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { getLeaderboard } from '@/utils/leaderboard'

const scores = ref([])
const loading = ref(true)

async function loadScores() {
  try {
    scores.value = await getLeaderboard()
  } catch (err) {
    console.error('Error loading leaderboard:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadScores()
  window.addEventListener('storage', loadScores)
  window.addEventListener('leaderboardUpdated', loadScores)
})

onUnmounted(() => {
  window.removeEventListener('storage', loadScores)
  window.removeEventListener('leaderboardUpdated', loadScores)
})

/* 🕹️ Grouped per-game leaderboard */
const groupedScores = computed(() => {
  const groups = {}
  for (const entry of scores.value) {
    const gameName = entry.game || 'Unknown Game'
    if (!groups[gameName]) groups[gameName] = []
    groups[gameName].push(entry)
  }
  for (const g in groups) {
    groups[g].sort((a, b) => b.score - a.score)
  }
  return groups
})
const filteredScores = computed(() => {
  const validGroups = {}
  for (const [game, entries] of Object.entries(groupedScores.value)) {
    if (game !== 'Unknown Game') {
      validGroups[game] = entries
    }
  }
  return validGroups
})

/* 🌍 Overall total score (sum of highscores per player across all games) */
const totalScores = computed(() => {
  const totals = {}

  for (const entry of scores.value) {
    const username = entry.username?.trim().toLowerCase() || 'guest'
    const game = entry.game || 'Unknown'
    const score = Number(entry.score) || 0

    if (!totals[username]) {
      totals[username] = {
        username: entry.username,
        games: {},
        total: 0,
      }
    }

    // keep only the highest score per game
    if (!totals[username].games[game] || score > totals[username].games[game]) {
      totals[username].games[game] = score
    }
  }

  // sum across all games
  for (const user in totals) {
    totals[user].total = Object.values(totals[user].games).reduce((a, b) => a + b, 0)
  }

  // filter out users who only have 'Unknown' entries (bad data)
  return Object.values(totals)
    .filter((u) => Object.keys(u.games).some((g) => g !== 'Unknown'))
    .sort((a, b) => b.total - a.total)
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
