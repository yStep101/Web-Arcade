import { ref } from 'vue'
import { submitScore } from '@/utils/leaderboard'

// 🧠 cached username across sessions
const username = ref(localStorage.getItem('arcadeUsername') || 'Player')

// 🏁 composable: handles leaderboard submissions per game
export function useScoreSubmit(game) {
  const bestScore = ref(0)

  // ⚙️ Update and persist username
  function setUsername(newName) {
    username.value = newName.trim() || 'Player'
    localStorage.setItem('arcadeUsername', username.value)
  }

  // 🧩 Submit score — includes game name
  async function trySubmit(score) {
    if (score > bestScore.value) {
      bestScore.value = score
      try {
        await submitScore(username.value, score, game) // 👈 pass game name
        console.log(`✅ Submitted ${game} score: ${score} by ${username.value}`)

        // 🔁 Trigger leaderboard refresh for all open tabs
        window.dispatchEvent(new Event('leaderboardUpdated'))
      } catch (err) {
        console.error('❌ Failed to submit score:', err)
      }
    }
  }

  // 🌀 Reset best score (used on restart)
  function resetBest() {
    bestScore.value = 0
  }

  return { trySubmit, resetBest, username, setUsername }
}
